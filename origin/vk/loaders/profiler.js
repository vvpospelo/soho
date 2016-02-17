function Profiler() {
    Profiler.superclass.constructor.apply(this, arguments);

    var self  = this,
        empty = $();

    var mask     = new Mask(),
        people   = new People(),
        activity = new Activity(),
        status   = new Status(self);

    var page = {},
        card = empty;

    // -----------------------------------------------------------------------------------------------------------------

    function isReady(VKID) {
        return self.isActual(VKID) && _.size(page);
    }

    self.isLoaded = function(link) {
        return link.card && link.card.cardRedirect(link.VKID, isReady(link.VKID)) &&
               link.card.editable() ? link.card.is('.selected_card') : self.isActual(link.VKID);
    }.try(false);

    // -----------------------------------------------------------------------------------------------------------------

    self.show = function() {
        DOM.profiler.unlockLinks().addClass('shown');
    }.try(null);

    self.hide = function() {
        DOM.profiler.removeClass('shown');
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    function cardInfo() {
        return card.addInfo.apply(card, arguments);
    }

    function leftInfo() {
        return DOM.leftWatcher.addInfo.apply(DOM.leftWatcher, arguments);
    }

    function rightInfo() {
        return DOM.rightWatcher.addInfo.apply(DOM.rightWatcher, arguments);
    }

    // -----------------------------------------------------------------------------------------------------------------

    var tryName = function(name) {
        return ((name = name.text()) ? cardInfo({
            name : function(labeled) {
                labeled.children('a').text(name);
            }
        }) : card).markName();
    }.try(never);

    var tryQuery = function(title) {
        var name = STR.decodeEntities((title.selfText() || card.cardName().text() || '').normalize());
        activity.set({
            name : name
        });
        mask.set({
            query : name
        });
        leftInfo({
            name : '<a>' + name.replace(STR.regexp.nonNativeChars, function replacer(str, char) {
                return '<span class="tabu">' + LNK.tryDecodeURIComponent(char) + '</span>';
            }) + '</a>'
        }).getLabeled('name').click(activity.tryFB);
    }.try(null);

    var tryText = function(text) {
        cardInfo({
            text : text.children('span').unlockLinks().html()
        });
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    var trySites = function(source, pattern) {
        var sites = {
            sites : activity.trySites(source, pattern)
        };
        rightInfo(sites);
        cardInfo(sites);
    }.try(null);

    var tryActivity = function(page) {
        var act = activity.tryActivity(page.title, page.posts);
        act.sex && mask.set({
            sex : act.sex
        });
        !act.time ? self.show() : null;
        leftInfo({
            activity : act.info
        });
        return cardInfo({
            activity : act.info
        }).markActivity(act.time);
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.tryCount = function(count) {
        !count ? cardInfo({
            photos : 'photos'
        }).markPhotos() && self.show() : null;
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    var tryProfilePhoto = function(ava, src) {
        if ( _.isString(src = ava.selfFirst('img').lockedAttr('src')) ) {
            LNK.noActive(src) && self.show();
            if ( card.editable() && !card.find('.profile_photo_img').length ) {
                card.divInfo().addClass('profiled_info');
                ava = card.cardAva().removeClass('img').addClass('profile_photo');
                return src ? self.Trial('ava', DOM.loadImage(src, 3)).then(function(img) {
                    ava.empty().append(img).parent().hide();
                    img.classList.add('profile_photo_img');
                    return ava.prependTo(card);
                }) : card.tabuSwat();
            }
        }
        return already;
    }.try(never);

    // --- Marker ------------------------------------------------------------------------------------------------------

    var actualAvatars = function() {
        return [DOM.pageBody, page.body].map(container => container && container.find('#page_avatar').filter(function() {
            return !self.VKID || API.isProfile(self.VKID) && self.isActual($(this).keepEventsVKID());
        }));
    }.try([]);

    var tryActions = function() {
        actualAvatars().map(avatars => avatars && avatars.each(function(i, avatar) {
            (function(bar, VKID) {
                bar.remove() && avatar.after(marker.actions(page.actions && VKID));
            })((avatar = $(avatar)).next('.pro_actions'), avatar.keepEventsVKID());
        }));
    }.try(null);

    var tryRelations = function() {
        if ( API.isProfile(self.VKID) ) {
            var relations = marker.relations(self.VKID).outerHTML();
            actualAvatars().concat([page.mail, card.editable() && card.cardAva()])
                .map(point => point && point.instead('.relations', relations));
            leftInfo({
                relations : relations
            }, true);
        }
    }.try(null);

// ---------------------------------------------------------------------------------------------------------------------

    var tryZodiak = _.is(window.WestZodiak) && _.is(window.EastZodiak) && (function() {
            var wZodiak = new WestZodiak().init(),
                eZodiak = new EastZodiak().init(wZodiak);
            return function(labeled, label, text) {
                if ( text && ['bmonth', 'byear'].indexOf(label) >= 0 ) {
                    var birth  = DATE.parse(text),
                        zodiak = wZodiak.link(birth) + ' ' + eZodiak.link(birth);
                    var age = API.tryNumber(labeled.append(zodiak).find('.east_zodiak'));
                    age ? cardInfo({
                        age : DATE.yearsLabel(age)
                    }).markAge(age) : null;
                    zodiak = rightInfo({
                        zodiak : zodiak
                    }, true).getLabeled('zodiak').add(labeled);
                    zodiak.find('.west_zodiak').data('tooltip', wZodiak.tooltip());
                    zodiak.find('.east_zodiak').data('tooltip', eZodiak.tooltip());
                }
            }.try(null);
        })() || function() {};

// ---------------------------------------------------------------------------------------------------------------------

    var childsRegExp = XRegExp('^(сын|доч|дет)\\p{InCyrillic}*(:$|,)', 'i');

    var tryChilds = function(labels) {
        return $.when.apply($, _.map(labels, function(label) {
            label = $(label);
            var role = label.text() || '';
            if ( childsRegExp.test(role) ) {
                return cardInfo({
                    role : '<span>' + label.next().html() + '</span>'
                }).markChilds();
            }
            return already;
        }));
    }.try(never);

// ---------------------------------------------------------------------------------------------------------------------

    var tryFriends = function(friends) {
        friends = friends.find('.p_header_bottom').first();
        friends.classFriends();
        friends = $('<a href="' + LNK.toFriends(self.VKID) + '">' + (friends.text() || '').normalize() + '</a>');
        friends.classFriends();
        (friends.hasClass('tabu') ? leftInfo : rightInfo)({
            friends : friends = friends.outerHTML()
        });
        return cardInfo({
            friends : friends
        }).markFriends();
    }.try(never);

// ---------------------------------------------------------------------------------------------------------------------

    self.setStatus = function(status, statusText) {
        if ( _.isNumeric(status) ) {
            mask.set({
                status : status
            });
            var label = '<a href="' + self.checkURL('#' + self.VKID) + '" >' + statusText || mask.statusText() + '</a>';
            (API.classStatus(status) < 0 ? leftInfo : rightInfo)({
                status : label
            }).getLabeled('status').classStatus(status);
            return card.addClass('analyzed').addInfo({
                status : label
            }).markStatus(status);
        }

        return already;
    }.try(never);

    var tryStatus = function(key, status, statusText) {
        return key == 'status' && self.setStatus(status, statusText);
    }.try(false);

// ---------------------------------------------------------------------------------------------------------------------

    self.checkURL = function(hash) {
        return mask.link() + (hash || '&c[status]=1' + '#' + self.VKID);
    }.try('');

    self.check = function() {

        isReady(self.VKID) ? /*activity.openSites() ||*/ status.check(mask.query()).done(function(status) {
            console.log(status);
        }) : self.VKID ? self.tabs.open(LNK.toPage(self.VKID)) : null;
    };

// ---------------------------------------------------------------------------------------------------------------------

    DOM.context('profile') ? (function tuneProfilePage() {
        var modules = DOM.pageLayout.find('#profile_narrow .module');
        modules.first().before(modules.last());
        tryActions();
    })() : null;

    var parse = function(page) {

        page.title = page.body.find('#title');
        page.ava = page.body.find('#page_avatar');

        page.info = page.body.find('#profile_info');
        page.name = page.info.find('div.page_name');

        page.status = page.info.find('#page_current_info');
        page.info = page.info.add(page.info.next('#profile_full_info'));

        page.info = page.info.find('div.profile_info');
        page.labels = page.info.find('div.label');
        page.labeleds = page.info.find('div.labeled');
        page.posts = page.body.find('#page_wall_posts').children('.post.own');

        page.modules = page.body.find('#profile_narrow .module');
        page.friends = page.modules.filter('#profile_friends');
        page.modules.filter('#profile_videos').insertAfter(page.friends);
        page.actions = page.modules.last();
        page.actions.insertBefore(page.modules.first());
        page.actions.find('#friend_remove').prevAll('a').hide();
        page.actions = page.actions.add(page.body.find('#profile_main_actions'));

        return page;
    }.try({});

    self.isWritten = function() {
        return page.mail && Boolean(page.mail.length);
    };

    self.canWrite = function() {
        return page.actions && Boolean(page.actions.find('#profile_message_send').length);
    };

    self.isBooked = function() {
        return page.actions && Boolean(page.actions.find('#profile_bottom_actions').find('a:contains("заклад")').is(':contains("закладок")'));
    };

    self.isRejected = function() {
        return page.actions && Boolean(page.actions.find('.profile_frdd_wrap#profile_am_subscribed').length);
    };

    self.isFriended = function() {
        return page.actions && Boolean(page.actions.find('.profile_frdd_wrap:not(#profile_am_subscribed)').length);
    };

    self.isExpected = function() {
        return page.mail && Boolean(page.mail.is('.expected'));
    };

    self.isGifted = function() {
        return page.mail && Boolean(page.mail.is('.gifted'));
    };

// ---------------------------------------------------------------------------------------------------------------------

//var tryGifts = function(event, link) {
//    return (!page.mail ? self.ajax.post('gifts' + link.VKID, {
//        al     : 1,
//        offset : 0,
//        part   : 1
//    }).then(function(response) {
//        //console.log(response);
//        //page.mail = parser.parseMail(response);
//    }) : already).then(function() {
//            //link.data('mail', page.mail);
//            //return page.mail;
//        });
//}.try(never);

    var tryHistory = self.tryHistory = function(event, link) {
        if ( API.isProfile(self.VKID) ) {
            return (!page.mail && self.server.serve('dialogs') || already).then(function(response) {
                page.mail = page.mail || parser.parseMail(response);
                return link.data('mail', page.mail) && page.mail;
                //return tryGifts(event, link);
            });
        }
        return already;
    }.try(never);

// ---------------------------------------------------------------------------------------------------------------------

    var tryRelated = function() {
        if ( API.isProfile(self.VKID) ) {
            if ( card.editable() && !card.getLabeled('common').length ) {
                return self.server.serve('related').then(function(related) {
                    return $.when(
                        cardInfo(people.labels(related)).markViewed(),
                        card.markSexRatio(), card.markLocation()
                    );
                });
            }
        }
        return already;
    }.try(never);

    self.server.addListener(function(msg, value, key) {
        switch ( key ) {
            case 'fail' :
                ['noVKID', 'bottom', 'missed'].indexOf(value) >= 0 ? cardInfo({
                    error : value
                }) : card.getLabeled('error').remove();
                break;
            case 'status' :
                _.isNumeric(value) && self.setStatus(value);
        }
        card.markError();
    }.try(null));

// ---------------------------------------------------------------------------------------------------------------------

    var tryVKID = function(page) {
        if ( !(self.VKID = API.ifVKID(self.VKID) || page.body.find('#profile_narrow, #group_narrow').selfFirst('a').keepEventsVKID()) ) {
            var obj = /\"(user_id|group_id|public_id)\"\s*\:\s*(\d+)/.exec(page.script) || [];
            if ( self.VKID = API.ifVKID(obj[2]) ) {
                self.VKID = (obj[1] == 'user_id') ? self.VKID : -self.VKID;
            }
        }
        self.VKID && leftInfo({
            VKID : '<a href="' + LNK.toPage(self.VKID) + '">' + self.VKID + '</a>'
        });
        return self.VKID;
    }.try(null);

    var tryCard = function(event, link) {
        DOM.content.find('.selected_card').removeClass('selected_card');
        card = (link.card || empty).addClass('selected_card');
        card.editable(!card.length);
    }.try(null);

// ---------------------------------------------------------------------------------------------------------------------

    var profileTiming = new Timing(function(pageID) {
        return LNK.parse(location.href).file == pageID ? $.Trial().resolve(DOM.html.html()) : self.ajax.post(LNK.toPage(pageID));
    }, 1099);

    self.addBuffer(profileTiming);

    self.load = function(event, link, trial) {

        trial = self.Trial('load', trial);
        self.VKID = link.VKID;

        tryCard(event, link);
        tryActions();

        return profileTiming.append(link.VKID).then(function(response) {

            _.assign(page, parse(parser.parseProfile(response)));

            // ---------------------------------------------------------------------------------------------------------

            if ( link.VKID = tryVKID(page) ) {

                LNK.apply(page.links);
                DOM.profiler.append(page.body).hasClass('shown') && self.show();

                // -----------------------------------------------------------------------------------------------------

                tryQuery(page.title);
                tryText(page.status);

                trySites(page.labeleds.add(page.status));
                trySites(page.posts, INI.sites);

                // -----------------------------------------------------------------------------------------------------

                mask.parse(page.labeleds, function(labeled, label, value, text) {
                    !tryStatus(label, value, text) ? rightInfo(label, text) : null;
                    tryZodiak(labeled, label, text);
                }, function(label, value, text) {
                    people.tryCountry(label, value);
                    people.tryCity(label, text);
                });

                // -----------------------------------------------------------------------------------------------------

                card.cardRedirect(self.VKID, true);
                tryActions();

                // -----------------------------------------------------------------------------------------------------

                card.addClass('loading');
                trial.always(function() {
                    card.removeClass('loading');
                });

                $.when(
                    $.when(
                        tryProfilePhoto(page.ava),
                        tryHistory(event, link)
                    ).done(
                        tryActions,
                        tryRelations
                    ),
                    tryName(page.name),
                    tryChilds(page.labels),
                    tryFriends(page.friends),
                    tryActivity(page),
                    tryRelated()
                ).then(trial.resolve, trial.reject);

                return self.VKID;
            } else {
                return trial.reject();
            }
        }).fail(trial.reject);
    }.try(never);

// ---------------------------------------------------------------------------------------------------------------------

    var reset = self.reset;
    (self.reset = function() {
        return reset().then(function() {

            page = {};
            card = empty;

            self.hide();
            DOM.showTime();

            [DOM.leftWatcher, DOM.rightWatcher, DOM.profiler].forEach(container => container.empty());
            [mask, people, activity].forEach(object => object.reset());

            DOM.leftWatcher.append('<div class="info"></div>').addInfo({
                relations : '', name : '', VKID : '', activity : ''
            });

            DOM.rightWatcher.append('<div class="info"></div>').addInfo({});

        });
    }.try(already))();

}

