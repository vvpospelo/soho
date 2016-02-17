var marker,
    hinter,
    viewer,
    profiler,
    iTube;

// ---------------------------------------------------------------------------------------------------------------------

DOM.ready.done(function() {

    marker = new Marker();
    hinter = new Hinter();
    viewer = new Viewer();
    profiler = new Profiler();

    $('#reload').removeAttr('onclick').click(profiler.tabs.reload);

    iTube = new ImageTube({
        capacity : 42
    });

    $.when(
        DOM.avatars.gallery({
            priority : 2,
            capacity : 15,
            attempts : 5,
            criteria : {
                role   : 'avatar',
                width  : {
                    min : 320,
                    col : 4
                },
                height : {
                    min : 320,
                    row : 3
                }
            }
        }),
        DOM.albums.gallery({
            priority : 3,
            capacity : 15,
            attempts : 5
        }),
        DOM.photos.gallery({
            priority : 4,
            capacity : 45,
            attempts : 5,
            criteria : {
                role   : 'preview',
                width  : {
                    min : 196,
                    col : 8
                },
                height : {
                    min : 196,
                    row : 6
                }
            }
        })).then(function() {

        DOM.photos.gallery({
            counterbar : DOM.counterbar.counterbar('create')
        });

        // --- Run -----------------------------------------------------------------------------------------------------

        DOM.html.on('mousemove', function(event) {
            DOM.cursor.left = event.clientX;
            DOM.cursor.top = event.clientY;
        });

        DOM.html.on(DOM.events.mouse, hinter.noCollision);

        // -------------------------------------------------------------------------------------------------------------

        DOM.pageLayout.on('mouseenter', function() {
            DOM.scrollBody.css('overflow', 'visible');
            DOM.avatars.removeClass('active').gallery('refresh');
        });

        DOM.html.on('mouseenter', '#viewer, .alert, #layer_wrap', function() {
            DOM.scrollBody.css('overflow', 'hidden');
            DOM.avatars.addClass('active');
            DOM.photos.gallery({
                top     : true,
                refresh : true
            });
            DOM.albums.gallery('top');
        });

        DOM.header.deferEnter(profiler.show, 49);
        DOM.profiler.on('mouseleave', profiler.hide);

        // -------------------------------------------------------------------------------------------------------------

        DOM.blocker.on('click dblclick mousedown', function(event) {
            DOM.cancelDefault(event);
        });

        DOM.content.add(DOM.viewer).deferEnter('a', function(event) {
            hinter.flip(event);
        }).on('mouseleave click', 'a', hinter.reset);

        // -------------------------------------------------------------------------------------------------------------

        DOM.body
            .add(DOM.birthday)
            .add(DOM.watcher)
            .add(DOM.profiler)
            .add(DOM.albums)
            .add(DOM.photos)
            .on('click', 'a', function(event) {
                if ( !/\#$|^$/.test(this.ref() || '') && !API.ACT.inTab(this.getAttribute('onclick')) ) {
                    DOM.cancelDefault(event);
                    profiler.tabs.open(this.href);
                }
            });

        DOM.albums.deferEnter('a', viewer.switchAlbum, 99);

        // -------------------------------------------------------------------------------------------------------------

        DOM.profiler
            .add(DOM.photos)
            .deferEnter('a', hinter.showPhoto, 49)
            .add(DOM.watcher)
            .deferEnter('a', hinter.showTooltip, 19);

        // --- Main complex logic --------------------------------------------------------------------------------------

        DOM.content.add($('<div></div>').append(DOM.locationLink)).deferEnter('a', function(event, link, trial) {
            link.role && $.when(
                hinter.reset().done(function() {
                    hinter.showPhoto(event, link).showTooltip(event, link);
                }),
                profiler.isLoaded(link) ? TIME.resolve(trial, link.VKID) || already : $.when(
                    profiler.reset(), viewer.reset()
                ).then(DOM.whenWindowStoped).then(function() {
                    var profiled = profiler.load(event, link, trial);
                    return (API.isVKID(link.VKID) ? already : profiled).done(function() {
                        API.dataset.vkid = API.dataset.vkid || link.VKID;
                        viewer.load(event, link).done(profiler.tryCount);
                    });
                })
            ).done(function() {
                profiler.tryHistory(event, link).done(function() {
                    hinter.showMailHint(event, link);
                });
            }) || TIME.reject(trial);
        }, 99);

        // --- Ready ---------------------------------------------------------------------------------------------------

//        setTimeout(function () {
//            profiler.ajax.get('https://vk.com/al_search.php', {al:1,
//                'c[bday]':1,
//            'c[bmonth]':11,
//            'c[byear]':1984,
//            'c[country]':2
//}).done(function(f) {console.log(f)});
//        }, 1700);

        profiler.server.serve('ready').done(function() {
            DOM.locationLink.trigger('mouseenter');
            TIME.log('ready');
        });

    });
});

