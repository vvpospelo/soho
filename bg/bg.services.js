'use strict';

mixinTrial();

Preloader.inherits(Archive);

Booked.inherits(Preloader);
Dialogs.inherits(Archive);
Friends.inherits(Preloader);
Recents.inherits(Preloader);
Viewed.inherits(Archive);

// ---------------------------------------------------------------------------------------------------------------------

let storage = new ChromeStorage(
    chrome.storage.local ||
    chrome.storage.sync
);

let booked = new Booked(storage);
let dialogs = new Dialogs(storage);
let friends = new Friends(storage);
let recents = new Recents(storage);
let viewed = new Viewed(storage);

// ---------------------------------------------------------------------------------------------------------------------

let services = new function() {

    _.assign(this, {

        // --- Notice Window -------------------------------------------------------------------------------------------

        notice : function(msg) {
            notice.alert(_.omit(msg, 'timeout'), msg.timeout || TIME.notice);
        },

        report : function(msg) {
            Error.prototype.notice(_.numeral(_.assign({
                friends : friends.count(),
                recents : recents.count(),
                dialogs : dialogs.count(),
                booked  : booked.count(),
                viewed  : viewed.count()
            }, msg || {})));
        },

        // --- Connect / Inject && Apply -----------------------------------------------------------------------------------

        keydown : function(msg, tab, post) {
            post(tab.id, {
                uncover : DOM.keyUncover(msg.keydown)
            });
        },

        inject : function(msg, tab, post) {
            post(tab.id, {
                inject : mixinObject.code()
            });
            post(tab.id, {
                apply : [runtime.tabs.origin(tab) + '/main.js']
            });
        },

        // --- Tabs --------------------------------------------------------------------------------------------------------

        open : function(msg, tab, post) {
            runtime.tabs.create(tab, msg.open, post);
        },

        close : function(msg, tab, post) {
            runtime.tabs.close(tab, _.ifArray(msg.close) || tab.id, post);
        },

        // --- Tabs.opener -------------------------------------------------------------------------------------------------

        opener : function(msg, tab, post) {
            runtime.tabs.opener(tab, msg, post);
        },

        error : function(msg, tab, post) {
            runtime.tabs.opener(tab, msg, post);
        },

        warn : function(msg, tab, post) {
            runtime.tabs.opener(tab, msg, post);
        },

        // --- Ready -------------------------------------------------------------------------------------------------------

        ready : function(msg, tab, post) {
            runtime.tabs.opener(tab, msg, post);
            post(tab.id, {
                ready   : true,
                uncover : DOM.tryUncover(msg.openerTabId)
            });
        },

        // --- Preload -----------------------------------------------------------------------------------------------------

        preload : function(msg, tab, post) {
            post(tab.id, {
                preload : {
                    viewed : viewed.pick(),
                    booked : booked.boolean()
                }
            });
        },

        // --- Load --------------------------------------------------------------------------------------------------------

        dialogs : function(msg, tab, post) {
            dialogs.load(msg.VKID).done(function(dialogs) {
                post(tab.id, {
                    dialogs : dialogs
                });
            });
        },
        friends : function(msg, tab, post) {
            friends.load(msg.VKID).done(function(friends) {
                post(tab.id, {
                    friends : friends
                });
            });
        },
        related : function(msg, tab, post) {
            friends.related(msg.VKID).done(function(related) {
                post(tab.id, {
                    related : related
                });
            });
        },

        // --- forEach ports -----------------------------------------------------------------------------------------------

        viewed : function(msg, tab, post) {
            viewed.store(msg.viewed).done(function(viewed) {
                post(null, {
                    viewed : viewed
                });
            });
        },
        booked : function(msg, tab, post) {
            booked.book(msg.booked).done(function() {
                post(null, {
                    booked : msg.booked
                });
            });
        }

    }.try(null));

};

// ---------------------------------------------------------------------------------------------------------------------

mixinDebug(function(msg) {
    services.notice(_.omit(_.assign(_.pickBy({
        errors : msg.last && (msg.size + '<span class="last_error">' + _.head(_.lines(msg.last)) + '</span>')
    }, _.is), msg), ['error', 'warn', 'size', 'last']));
}.try(null));

storage.onChanged(function() {
    storage.length(null).done(bytes => services.report({
        storage : String((bytes / 1000).toFixed(1)).numeral() + ' kB'
    }));
}.try(null));

// ---------------------------------------------------------------------------------------------------------------------

new Live(_.omit(services, _.keys(new Port(_.pick(services, [])).services)));
