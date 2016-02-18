'use strict';

var context = DOM.context();
var $ = jQuery.noConflict();

DOM.ready = $.Trial();

// ---------------------------------------------------------------------------------------------------------------------

DOM.joined = $.when(
    LNK.apply([
        '/css/al/im.css',
        '/css/al/photos.css',
        '/css/al/photoview.css'
    ]),

    // --- API ---------------------------------------------------------------------------------------------------------

    LNK.apply([
        'api/date/date.js',
        'api/date/time.js'
    ]),

    LNK.apply([
        'api/dom/dom.js',
        'api/dom/event.js',
        'api/dom/position.js',
        'api/dom/sibling.js'
    ]),

    LNK.apply([
        'api/html/code.js',
        'api/html/html.js',
        'api/html/query/lQuery.js',
        'api/html/query/sQuery.js',
        'api/html/query/XHR.js'
    ]),

    LNK.apply([
        'api/unicode/unicode.js',
        'api/unicode/unicode.dia.js',
        'api/unicode/unicode.greek.js'
    ]),

    LNK.apply([
        './api/link/vk.api.actions.js',
        './api/link/vk.api.events.js',
        './api/link/vk.api.links.js',
        './api/link/vk.api.media.js',
        './api/link/vk.api.role.js'
    ]),


    LNK.apply([
        './api/card/vk.card.js',
        './api/card/vk.context.js',
        './api/card/vk.editable.js',
        './api/card/vk.mark.js'
    ]),



    (function tryPilot(trial) {
        return (trial = $.Deferred()) && LNK.tryPilot([
                'pilot/css/vk.zodiak.css',
                'pilot/vk.phrase.js',
                'pilot/vk.zodiak.js',
                'pilot/vk.zodiake.js',
                'pilot/vk.zodiakw.js'
            ]).then(function () {
                EastZodiak.inherits(Zodiak);
                WestZodiak.inherits(Zodiak);
            }).always(trial.resolve) && trial;
    })(),

    // --- CSS ---------------------------------------------------------------------------------------------------------

    LNK.apply([
        './dom/css/common.css',
        './dom/css/effects.css',
        './dom/css/scroll.css'
    ]),

    LNK.apply([
        './widgets/css/vk.alert.css',
        './widgets/css/vk.chkbox.css',
        './widgets/css/vk.controls.css',
        './widgets/css/vk.counter.css'
    ]),

    LNK.apply([
        './loaders/css/vk.actions.css',
        './loaders/css/vk.checkbox.css',
        './loaders/css/vk.hinter.css',
        './loaders/css/vk.previews.css',
        './loaders/css/vk.profiler.css',
        './loaders/css/vk.relations.css',
        './loaders/css/vk.viewer.css',
        './loaders/css/vk.watcher.css'
    ]),

    context == 'recent' ? LNK.apply([
        './pages/css/vk.recents.css',
        './pages/css/vk.recenter.css'
    ]) : already,

    context == 'friends' || context == 'people' ? LNK.apply([
        './api/card/css/vk.card.css',
        './api/card/css/vk.labeled.css',
        './pages/css/vk.filter.css'
    ]) : already,

    context == 'dialog' ? LNK.apply([
        './pages/css/vk.dialog.css'
    ]) : already,

    LNK.apply([
        './require/jquery.mousewheel.min.js'
    ], true),

    LNK.apply([
        './const/vk.const.js',
        './vk.init.js'
    ]),


    // --- DOM ---------------------------------------------------------------------------------------------------------

    LNK.apply([
        './dom/vk.dom.js',
        './dom/vk.run.js'
    ]),

    // --- Widgets -----------------------------------------------------------------------------------------------------

    LNK.apply([
        'vk.gallery.js',
        INI.snapshot && 'vk.snapshot.js'
    ], {
        path : './widgets/gallery/'
    }),

    LNK.apply([
        {image : 'vk.imager.js'}[INI.imager],
        'vk.itube.js'
    ], {
        path : './widgets/imager/'
    }),

    LNK.apply([
        './widgets/vk.alert.js',
        './widgets/vk.chkbox.js',
        './widgets/vk.controls.js',
        './widgets/vk.counter.js'
    ]),

    // --- objects -----------------------------------------------------------------------------------------------------

    $.when(LNK.apply([
            './objects/base/vk.buffer.js',
            './objects/base/vk.queue.js',
            './objects/base/vk.stacker.js',
            './objects/base/vk.tabs.js'
        ]),
        LNK.apply([
            './dom/events/vk.listener.js',
            './dom/events/vk.observer.js'
        ])
    ).then(function () {
        PortListener.inherits(Listener);
        LiveListener.inherits(Listener);
        FrameListener.inherits(Listener);
        WindowListener.inherits(Listener);
        StorageListener.inherits(Listener);
    }),

    LNK.apply([{
        lQuery : 'vk.lQuery.js',
        sQuery : 'vk.sQuery.js'
    }[INI.parser]
    ], {
        path : './loaders/parser/'
    }),

    LNK.apply([
        './loaders/api/vk.albums.js',
        './loaders/api/vk.photos.js',
        './loaders/api/vk.status.js'
    ]),

    LNK.apply([
        './loaders/profiler/vk.activity.js',
        './loaders/profiler/vk.mask.js',
        './loaders/profiler/vk.people.js'
    ]),

    $.when(
        LNK.apply([
            './objects/vk.container.js',
            './objects/vk.loader.js'
        ]),
        LNK.apply([
            './loaders/vk.hinter.js',
            './loaders/vk.marker.js',
            './loaders/vk.profiler.js',
            './loaders/vk.viewer.js'
        ])
    ).then(function () {
        Container.inherits(Loader);
        Hinter.inherits(Loader);
        Marker.inherits(Loader);
        Profiler.inherits(Loader);
        Viewer.inherits(Loader);
    })
).done(function () { // --- pages ---------------------------------------------------------------------------------------

    DOM.context('dialog') ? LNK.apply([
        './pages/vk.dialog.js'
    ]) : already;

    DOM.context('fave') ? LNK.apply([
        './pages/vk.fave.js'
    ]) : already;

    DOM.context('recent') ? LNK.apply([
        './pages/vk.recenter.js'
    ]) : already;

    DOM.context('friends') ? LNK.apply([
        './pages/api/vk.related.js',
        './pages/vk.relator.js'
    ]) : already;

    DOM.context('people') ? LNK.apply([
        './pages/api/vk.filter.js',
        './pages/api/vk.related.js',
        './pages/vk.checker.js'
    ]) : already;

});

