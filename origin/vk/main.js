if ( window.top == window.self ) {

    var html    = document.documentElement,
        dataset = html.dataset;

    function ready() {
        html.querySelector('#live_sender').appendChild(document.createTextNode(JSON.stringify({
            ready : true
        })));
    }

    document.onAppearance('head', function(head) {
        window.onAppearance('StaticFiles', function(StaticFiles) {
            var contexts = {
                recent  : StaticFiles['im.js'] && !Boolean(dataset.query),
                dialog  : StaticFiles['im.js'] && dataset.query == 'dialog',
                friends : StaticFiles['friends.js'],
                people  : StaticFiles['search.js'] && !StaticFiles['video.js'],
                gifts   : StaticFiles['gifts.js'],
                fave    : StaticFiles['fave.js'],
                feed    : StaticFiles['feed.js'],
                wall    : StaticFiles['wall.js'],
                profile : StaticFiles['profile.js'],
                public  : StaticFiles['public.js'],
                group   : StaticFiles['groups.js']
            };

            Object.keys(contexts).every(function(context) {
                if ( contexts[context] ) {
                    dataset.context = context;

                    // --- Online status & memory leaks minimizer --------------------------------------------------------------

                    function adsOff() {
                        window.noAdsAtAll = true;
                        window.updSeenAdsInfo = window.__seenAds =
                            window.updateFixedMenu = window.updateOtherCounters =
                                window.__adsUpdateExternalStats = window.__adsGetAjaxParams =
                                    window.__adsUpdate = window.__adsSet = function() {};
                    }

                    window.onAppearance('nav', function(nav) {
                        window.debugLog = window.updSideTopLink =
                            window.updGlobalPlayer = nav.go = function() {};
                        dataset.start = window._logTimer;
                        adsOff();
                    });

                    window.onAppearance('FastChat', function(FastChat) {
                        FastChat.destroy();
                    });

                    // ---------------------------------------------------------------------------------------------------------

                    function apply(srcs, onload, loading) {
                        loading = 0;
                        srcs.forEach(function(src) {
                            var script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('src', dataset.root + src);
                            ++loading && head.appendChild(Object.assign(script, {
                                onload : () => onload && !--loading && setTimeout(onload, 0),
                                async  : true
                            }));
                        });
                    }

                    apply([
                        'require/lodash.min.js',
                        'require/jquery.min.js',
                        'require/xregexp.min.js',
                        'require/lz-string.min.js',
                        'mixin/object.js',
                        'mixin/lodash.js',
                        'mixin/visual.js',
                        'mixin/debug.js',
                        'mixin/trial.js',
                        'api/api.js'
                    ], function() {

                        // --- Mixin -------------------------------------------------------------------------------------------

                        mixinObject();
                        mixinLodash();
                        mixinVisual();
                        mixinDebug(function(msg) {
                            _.size(msg = _.pick(msg, ['error', 'warn'])) && html.querySelector('#live_receiver')
                                .appendChild(document.createTextNode(JSON.stringify(msg)));
                        });
                        mixinTrial();

                        // --- Global Window VK Object Control -----------------------------------------------------------------

                        DOM.idleObject('Notifier', 'FastChat').then(function() { // notifier.js
                            return DOM.idleObject('curNotifier', 'curFastChat');
                        }).done(function() {
                            TIME.log('tuned');
                        });

                        DOM.idleObject('AdsLight', 'vk__adsLight').always(function() { // aes_light.js
                            adsOff() || TIME.log('no Ads');
                        });

                        // --- Let's go ! --------------------------------------------------------------------------------------

                        LNK.apply([
                            './vk.join.js'
                        ]);

                    });
                    return false;
                }
                return true;

            }) && ready();
        }, ready, 1999);
    }, ready, 1999);

}
