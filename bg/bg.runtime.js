'use strict';

mixinTrial();

var runtime = new function Extension() {

    var self = this;

    self.defineValue(Object.assign(document.documentElement.dataset, {
        start : _.now(),
        id    : chrome.runtime.id,
        root  : chrome.extension.getURL(''),
        name  : chrome.runtime.getManifest().name
    }));

    Extension.prototype.define({

        responseCallback : function() {
            if ( !_.size(arguments) && chrome.runtime.lastError ) {
                throw new Error(chrome.runtime.lastError.message || 'error occurs while connecting to the extension');
            }
        },

        // -------------------------------------------------------------------------------------------------------------

        onConnect : function(handler) {
            chrome.runtime.onConnect.addListener((port) => port.sender.id === self.id && handler(port));
        },

        onStartup : chrome.runtime.onStartup.addListener.bind(chrome.runtime.onStartup),
        onUnload  : chrome.runtime.onSuspend.addListener.bind(chrome.runtime.onSuspend),

        // --- https://developer.chrome.com/extensions/messaging -------------------------------------------------------

        sendMessage : function() {
            chrome.runtime.sendMessage.apply(chrome.runtime, Array.from(arguments).concat([self.responseCallback]));
        },

        onMessage : function(handler) {
            chrome.runtime.onMessage.addListener((msg, sender) => sender.id === self.id && !sender.tab && handler(msg, sender));
        }

    }.try(null));

    // --- Web Pages Inject --------------------------------------------------------------------------------------------

    self.tabs = new Tabs(self.id);

    function inject(tabs) {
        let dataset = {
            host : self.id,
            root : self.root,
            name : self.name
        };
        self.tabs.insertCSS(tabs, function() {
            return {
                code : injectCSS(dataset)
            };
        });
        self.tabs.execute(tabs, function(tab) {
            return {
                code : injectData(_.assign(dataset, {
                    query  : (function query(url) {
                        return url.search ? !isNaN(url.query.sel) ? 'dialog' : true : '';
                    })(LNK.parse(tab.url, true)),
                    opener : self.tabs.openerTabId(tab.id)
                })) + injectCode.code()
            };
        }.try({}));
    }

    self.tabs.query(inject);
    self.tabs.onLoading(inject);

};
