'use strict';

function injectCSS(dataset) {
    return ' \
    #listener, \
    html.ready.uncover #cover, \
    body::-webkit-scrollbar, \
        ::-webkit-scrollbar:horizontal { \
        visibility          : hidden; \
        display             : none; \
    } \
    \
    #cover { \
        top                 : 0px;\
        left                : 0px; \
        width               : 100%; \
        height              : 100%; \
        position            : fixed; \
        z-index             : 99999999; \
        background-color    : #4e729a; \
        background-position : 50% 50%; \
        background-repeat   : no-repeat; \
        background-image    : url(' + dataset.root + 'require/png/loaders/loader.blue.gif); \
    } \
    \
    #reload { \
        top                 : 6px; \
        left                : 6px; \
        width               : 28px; \
        height              : 28px; \
        position            : fixed; \
        cursor              : pointer; \
        z-index             : 9999999; \
        background-color    : #ffffff; \
        background-position : 50% 50%; \
        background-repeat   : no-repeat; \
        background-image    : url(' + dataset.root + 'require/png/loaders/reload.gif); \
        opacity             : 0.5; \
        border-radius       : 50%; \
    }';

}

