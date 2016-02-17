'use strict';

function Tabs(runtimeId) {

    var tabs = {},
        self = this;

    // -----------------------------------------------------------------------------------------------------------------

    function origin(tab) {
        return tab && LNK.origin(tab.url);
    }

    function keep(tab) {
        return origin(tab) && _.assign(tabs[tab.id] = tabs[tab.id] || {}, tab);
    }

    function pick(tabIDs) {
        return _.omitBy(_.pick(tabs, tabIDs), tab => tab.closed);
    }

    Tabs.prototype.define({

        origin : function(tab) {
            return 'origin/' + origin(tab);
        },

        query : function(handler) {
            chrome.tabs.query({}, function(tabs) {
                handler(_.filter(tabs, keep));
            });
        },

        // -------------------------------------------------------------------------------------------------------------

        onCreated : function(handler) {
            chrome.tabs.onCreated.addListener(tab => handler(keep(tab)));
        },

        onUpdated : function(handler) {
            chrome.tabs.onUpdated.addListener((tabId, info, tab) => handler(keep(tab)));
        },

        // -------------------------------------------------------------------------------------------------------------

        onRemoved : function(handler) {
            chrome.tabs.onRemoved.addListener(tabId => handler(pick(tabId)));
        },

        onLoading : function(handler) {
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
                changeInfo.status == 'loading' && handler(pick(tabId), changeInfo);
            });
        },

        // -------------------------------------------------------------------------------------------------------------

        insertCSS : function(tabs, handler) {
            _.map(pick(_.map(tabs, tab => tab.id)), tab => chrome.tabs.insertCSS(tab.id, _.assign({
                runAt : 'document_start'
            }, handler(keep(tab)))));
        },

        execute : function(tabs, handler) {
            _.map(pick(_.map(tabs, tab => tab.id)), tab => chrome.tabs.executeScript(tab.id, _.assign({
                runAt : 'document_start'
            }, handler(keep(tab)))));
        },

        // --- https://developer.chrome.com/extensions/messaging -------------------------------------------------------

        sendMessage : function(tabIDs) {
            _.map(pick(tabIDs), tab => chrome.tabs.sendMessage.apply(chrome.tabs,
                [tab.id].concat(_.drop(Array.from(arguments)).concat([runtime.responseCallback]))));
        },

        onMessage : function(handler) {
            chrome.runtime.onMessage.addListener((msg, sender) => sender.id === runtimeId && sender.tab && handler(msg, sender.tab));
        },

        // -------------------------------------------------------------------------------------------------------------

        create : function(openerTab, options, post) {
            function postTab(tab) {
                post(openerTab.id,
                    {}.entry(JSON.stringify(options.url), keep(tab).entry('openerTabId', options.openerTabId || openerTab.id))
                );
            }

            if ( options.reload ) {
                chrome.tabs.update(openerTab.id, _.pick(options,
                    ['url', 'active', 'highlighted', 'selected', 'pinned', 'muted', 'openerTabId']), postTab);
            } else {
                if ( options.window ) { // new tab, new window
                    chrome.windows.create(_.pick(options,
                        ['url', 'tabId', 'left', 'top', 'width', 'height', 'focused', 'incognito', 'type', 'state']), function(window) {
                        chrome.tabs.query({
                            windowId : window.id
                        }, tabs => postTab(tabs[0]));
                    });
                } else { // new tab, same window
                    chrome.tabs.create(_.pick(_.assign(options, {
                        openerTabId : openerTab.id,
                        windowId    : openerTab.windowId
                    }), ['windowId', 'index', 'url', 'active', 'selected', 'pinned', 'openerTabId']), postTab);
                }
            }
        },

        // -------------------------------------------------------------------------------------------------------------

        openerTabId : function(tabId) {
            return _.head(_.map(pick(tabId), tab => tab.openerTabId));
        },

        opener : function(tab, msg, post) {
            if ( msg = msg.opener || msg ) {
                msg.openerTabId = msg.openerTabId || self.openerTabId(tab.id);
                tab.id != msg.openerTabId && post(msg.openerTabId, msg = _.transform(msg, function(msg, value, type) {
                    msg[type] = ['error', 'warn'].indexOf(type) >= 0 ? type + ' from tab ' + tab.id + ' : ' + (tab[type] = value) : value;
                }));
                var error = _.find(_.pick(msg, 'error'));
                if ( error ) {
                    throw new Error(error);
                }
            }
        },

        // -------------------------------------------------------------------------------------------------------------

        close : function(tab, tabIDs, post) {
            $.when.apply($, _.map(_.omitBy(pick(tabIDs), tab => tab.error || tab.warn), function(tab, trial) {
                return (trial = $.Trial()) && chrome.tabs.remove(tab.id, trial.resolve) || trial;
            })).done(function() {
                post(tab.id, {
                    closed : tabIDs
                });
            });
        }

    }.try(null));

    self.onCreated(keep);
    self.onUpdated(keep);

    self.onRemoved(tab => tab.closed = true);

}

