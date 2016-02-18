function Marker() {
    Marker.superclass.constructor.apply(this, arguments);

    INI.timeViewed = 5 * TIME.day;
    INI.ignoredFlag = -1;
    INI.hiddenFlag = -2;

    TIME.ifViewed = function(time) {
        return ((time = time || 0) < 0 && _.now() || time ) - _.now() + INI.timeViewed;
    }.try(false);

    TIME.isViewed = function(time) {
        return TIME.ifViewed(time) >= 0;
    }.try(false);

    var self   = this,
        viewed = {},
        booked = {};

    function cache(msg) {
        _.isPlain(msg.viewed) && (function extend(msg) {
            return _.keys(msg.viewed || {}).map(function(VKID) {
                function flagEntry(obj, flag) {
                    function ifFlag() {
                        return (msg.viewed[VKID] == flag) || (viewed[VKID] != flag) && null;
                    }

                    return _.is(flag = ifFlag()) && (obj || {}).entry(VKID, flag) || obj;
                }

                msg.hidden = flagEntry(msg.hidden, INI.hiddenFlag);
                msg.ignored = flagEntry(msg.ignored, INI.ignoredFlag);
            });
        })(msg) && _.assign(viewed, msg.viewed);
        _.isPlain(msg.booked) && _.assign(booked, msg.booked);
    }

    function store(VKID, actionTime) {
        self.server.serve({ // action by time for message minimizing
            viewed : {}.entry(VKID, actionTime || 0)
        });
    }

    function book(VKID, booked) {
        self.server.serve({
            booked : {}.entry(VKID, booked)
        });
    }

    // --- Cache = Hidden || Ignored || timeViewed || Booked -----------------------------------------------------------

    var isHidden = self.isHidden = function isHidden(VKID) {
        return API.isVKID(VKID) && viewed[VKID] == INI.hiddenFlag;
    };

    function isIgnored(VKID) {
        return API.isVKID(VKID) && viewed[VKID] == INI.ignoredFlag;
    }

    function isViewed(VKID) {
        return API.isVKID(VKID) && TIME.isViewed(viewed[VKID] || 0);
    }

    function isFuture(VKID) {
        return API.isVKID(VKID) && TIME.isFuture(viewed[VKID] || 0);
    }

    function isBooked(VKID) {
        return API.isVKID(VKID) && booked[VKID];
    }

    function timeLeft(VKID) {
        return TIME.leftFormat(TIME.ifViewed(viewed[VKID]));
    }

    self.mark = function(link) {
        function mark(is, cls) {
            return is(link.dataset.host || link.dataset.vkid) ?
                   link.classList.add(cls) || true :
                   link.classList.remove(cls) && false;
        }

        return mark(isBooked, 'mark_booked') && 0 ||
            mark(isHidden, 'mark_hidden') || mark(isIgnored, 'mark_ignored') || mark(isViewed, 'mark_viewed');
    }.try(false);

    // --- Bookmark ----------------------------------------------------------------------------------------------------

    function Bookmarker() {
        var hash = 'toggleBookmark',
            VKID = DOM.pageBody.find('#page_avatar').keepEventsVKID(),
            ctrl = DOM.pageBody.find('#profile_narrow .module').find('a:contains(заклад)').hide();

        ctrl.onChildMutation(function() {
            book(VKID, !_.if(isBooked(VKID), !cur || Boolean(cur.toggleFaveAct)));
            LNK.parse(location.href).hash == hash ? profiler.tabs.close() : null;
        }, {
            subtree       : true,
            characterData : true
        });

        LNK.parse(location.href).hash == hash ? ctrl.click() : null;

        this.toggle = function(event, chkbox) {
            if ( !event.isTrigger && API.isProfile(profiler.VKID) ) {
                DOM.context('profile') && API.dataset.vkid == profiler.VKID ? ctrl.click() :
                profiler.tabs.open(LNK.toPage(profiler.VKID) + '#' + hash, {
                    state  : 'minimized',
                    window : true
                });
                chkbox.freeze();
            }
        }.try(null);
    }

    var toggleBookmark = function() { };

    function bar(html, cls, VKID) {
        return $('<a class="' + cls + '" data-role="' + cls + '" data-vkid="' + VKID + '"></a>').append(html);
    }

    // --- Actions -----------------------------------------------------------------------------------------------------

    var actions = new function Actions() {

        var self = this;

        var toggle = function(event, chkbox) {
            if ( !event.isTrigger && API.isProfile(profiler.VKID) ) {
                switch ( chkbox.name() ) {
                    case 'viewed' :
                        store(profiler.VKID, chkbox.freeze(true).checked() && TIME.future || 0);
                        break;
                    case 'ignored' :
                        store(profiler.VKID, chkbox.freeze(true).checked() && INI.ignoredFlag || 0);
                        break;
                    case 'hidden' :
                        store(profiler.VKID, chkbox.freeze(true).checked() && INI.hiddenFlag || 0);
                }
            }
        }.try(null);

        self.update = function(bar, VKID) {
            if ( API.isVKID(VKID) ) {
                _.toJQuery(bar).checkBox().map(function(chkbox) {
                    switch ( chkbox.name() ) {
                        case 'booked' :
                            chkbox.freeze(false).checked(isBooked(VKID));
                            break;
                        case 'viewed' :
                            chkbox.freeze(false).checked(isFuture(VKID)).tags([timeLeft(VKID), 'Viewed']);
                            break;
                        case 'ignored' :
                            chkbox.freeze(false).checked(isIgnored(VKID));
                            break;
                        case 'hidden' :
                            chkbox.freeze(false).checked(isHidden(VKID));
                            break;
                    }
                });
            }
            return bar;
        }.try(null);

        self.create = function(VKID) {
            function clkBox(onclick, cls) {
                return '<div class="pro_action ' + cls +
                    '" onclick="return ' + onclick + '"></div>';
            }

            function diaClass() {
                return arguments[profiler.canWrite() ? 0 : profiler.isWritten() ? 1 : 2];
            }

            return self.update(bar(VKID && [
                    clkBox('profiler.check();', 'pro_check'),
                    clkBox('profiler.tabs.open(LNK.toPage(profiler.VKID));', 'pro_home'),
                    clkBox('profiler.tabs.open(LNK.toFriends(profiler.VKID));', 'pro_friend'),
                    // -------------------------------------------------------------------------------------------------
                    clkBox('profiler.tabs.open(LNK.toMail(profiler.VKID));', diaClass('pro_write', 'pro_trywrite', 'pro_closed')),
                    clkBox('Profile.showGiftBox(profiler.VKID, event);', diaClass('pro_gift', 'pro_gift', 'pro_trygift')),
                    $('<div class="pro_action pro_booked"></div>').checkBox({
                        name    : 'booked', onchange : function() {
                            return toggleBookmark.apply(null, arguments);
                        }, tags : ['Book', 'Booked']
                    }),
                    // -------------------------------------------------------------------------------------------------
                    $('<div class="pro_action pro_viewed"></div>').checkBox({
                        name     : 'viewed',
                        onchange : toggle,
                        tags     : [timeLeft(VKID), 'Viewed']
                    }),
                    $('<div class="pro_action pro_ignored"></div>').checkBox({ name : 'ignored', onchange : toggle, tags : ['Ignore', 'Ignored'] }),
                    $('<div class="pro_action pro_hidden"></div>').checkBox({ name : 'hidden', onchange : toggle, tags : ['Hide', 'Hidden'] })
                ] || '', 'pro_actions', VKID).elem(), VKID);
        }.try('');

    };

    // --- Relations ---------------------------------------------------------------------------------------------------

    var relations = new function Relations() {

        var self = this;

        function relation(cls) {
            return '<div class="relation rel_' + cls + '"></div>';
        }

        self.update = function(bar, VKID, booked) {
            return API.isVKID(VKID) && _.is(!booked || booked[VKID]) &&
                _.toJQuery(bar).instead('.rel_booked', isBooked(VKID) && relation('booked') || '');
        }.try();

        self.create = function(VKID) {
            var relations = '';

            function diaSign(diaClass, addFriended) {
                return relations += (diaClass ? relation(diaClass) : '') + (addFriended && profiler.isFriended() ? relation('friended') : '');
            }

            if ( profiler.isRejected() ) {
                diaSign('rejected');
            } else {
                if ( profiler.isWritten() ) {
                    if ( profiler.canWrite() ) {
                        if ( profiler.isExpected() ) {
                            diaSign('expected', true);
                        } else {
                            if ( profiler.isGifted() ) {
                                diaSign('gifted', true);
                            } else {
                                if ( !profiler.isFriended() ) {
                                    diaSign('writable');
                                } else {
                                    diaSign(null, true);
                                }
                            }
                        }
                    } else {
                        diaSign('written', true);
                    }
                } else {
                    if ( !profiler.canWrite() ) {
                        diaSign('closed', true);
                    } else {
                        diaSign(null, true);
                    }
                }
            }
            return self.update(bar(VKID && relations || '', 'relations', VKID).elem(), VKID);
        }.try('');
    };

    // --- Listener ----------------------------------------------------------------------------------------------------

    self.actions = actions.create.bind(actions);
    self.storeNow = function(event, link) {
        !event.isTrigger && API.isProfile(link.VKID) && !isViewed(link.VKID) && store(link.VKID, 0);
    };
    self.storePaused = self.storeNow.defer(1499);
    self.relations = relations.create.bind(relations);

    var listeners = new Handlers();
    self.listen = listeners.add.bind(listeners);
    self.unlisten = listeners.remove.bind(listeners);

    var update = function(msg) {
        if ( msg.stored || msg.booked ) {
            cache(msg) || listeners.invoke(msg);
            msg.booked && $('.relations').each(function() {
                relations.update(this, this.roleVKID('relations'), msg.booked);
            });
            $('.pro_actions').each(function() {
                actions.update(this, this.roleVKID('pro_actions'), msg.booked, msg.stored);
            });
        }
    }.try(null);

    // --- Start -------------------------------------------------------------------------------------------------------

    self.server.serve('preload').done(function(msg) {
        toggleBookmark = new Bookmarker().toggle;
        update(msg);
    });

}

