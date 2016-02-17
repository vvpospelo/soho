'use strict';
mixinTrial();

var API = new function() {

    this.dataset = document.documentElement.dataset;

    // -----------------------------------------------------------------------------------------------------------------

    this.tryNumber = function(value) {
        if ( _.is(value) ) {
            _.isJQuery(value) ? value = String(value.text() || 0) : null;
            return !isNaN(value) ? Number(value) : (!isNaN(value = String(value).replace(/\D/g, '')) ? Number(value) : null);
        }
        return null;
    };

    // -----------------------------------------------------------------------------------------------------------------

    this.isVKID = function(VKID) {
        return (VKID = Number(VKID)) && (VKID ^ 0) == VKID && VKID;
    };
    this.ifVKID = function() {
        return _.find(arguments, API.isVKID) || null;
    };
    this.tryVKID = function(regexp, str) {
        return API.ifVKID((regexp.exec(str || '') || [])[0]);
    };
    this.isProfile = function(VKID) {
        return (API.ifVKID(VKID) || 0) > 0;
    };

    // -----------------------------------------------------------------------------------------------------------------

    this.versions = function() {
        return {
            lodash     : _ && _.VERSION,
            XRegExp    : XRegExp && XRegExp.version,
            jQuery     : jQuery && jQuery.fn.jquery,
            jQueryUI   : jQuery.ui && jQuery.ui.version,
            MouseWheel : jQuery && jQuery.event.special.mousewheel.version
        };
    };

    this.userAgent = function(agent) {
        if ( navigator.userAgent.toLowerCase().indexOf('chrome') > -1 ) {
            return _.isString(agent) ? (agent == 'chrome') : 'chrome';
        }
        if ( navigator.userAgent.toLowerCase().indexOf('msie') > -1 ) {
            return _.isString(agent) ? (agent == 'msie') : 'msie';
        }
        if ( navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ) {
            return _.isString(agent) ? ((agent == 'firefox') || (agent == 'mozilla')) : 'firefox';
        }
        if ( navigator.userAgent.toLowerCase().indexOf('safari') > -1 ) {
            return _.isString(agent) ? (agent == 'safari') : 'safari';
        }
        return null;
    };

};

// ---------------------------------------------------------------------------------------------------------------------

var INI = API.INI = new function() {
    this.parser = 'lQuery';
    this.imager = 'image';
    this.snapshot = false;
};

// ---------------------------------------------------------------------------------------------------------------------

var TIME = API.TIME = new function() {

    this.ms = function() {
        return _.now() - API.dataset.start;
    };

    this.toTimeString = function(ms, limit) {
        return ms < (limit || 0) ? (ms / 1000).toFixed(3) : new Date(ms).toUTCString().split(' ')[4];
    };

    this.format = function(time) {
        return '[' + this.toTimeString((time || _.now()) - API.dataset.start, 9999) + '] ';
    };

    this.log = function(stage) {
        _.log(this.format() + ' ' + API.dataset.name + ' ' + stage);
    };

};

// ---------------------------------------------------------------------------------------------------------------------

var DOM = API.DOM = new function() {

    this.dataset = API.dataset;

    this.context = function(context) {
        return _.isString(context) ? (context == DOM.dataset.context) : DOM.dataset.context;
    };

    this.vkClearCache = function(wObjects, eventList) {
        _.map(wObjects, function(obj) {
            var events = (window.vkCache[window.data(obj)] || {}).events || {};
            _.transform(eventList || events, (events, arr, event) => events[event] = [], events);
        });
    };

    this.idleObject = function() {
        function idleObject(obj) {
            //_.transform(obj, function (obj, value,key) {
            //
            //});
            //for (var key in obj) {
            //    _.isFunction(obj[key]) ? obj[key] = function() {} : null;
            //}
            //console.log(obj);
            //return obj;

            return _.merge(obj, obj, function(value) { // deep => customizer return undefined on obj
                return _.isFunction(value) ? function() {} : _.isNumber(value) ? (function(value) {
                    clearInterval(value);
                    clearTimeout(value);
                    return 0;
                })(value) : undefined;
            });
        }

        return $.when.apply($, Array.from(arguments, name =>
            $.Trial().onCondition(obj => _.isObject(obj = window[name]) && idleObject(obj))));
    };

};

// ---------------------------------------------------------------------------------------------------------------------

var LNK = API.LNK = new function() {

    var host   = location.host,
        head   = document.head,
        regexp = {
            url : /^(([^:\/\?#]+):)?(\/\/(([^:\/\?#]*)(?::([^\/\?#]*))?))?([^\?#]*)(\?([^#]*))?(#(.*))?$/,
            ext : /^(.*\/)?([^./?][^/?]*?)?(\.([^.?]*))?$/, // http://www.perlmonks.org/bare/?node_id=111272
            dom : /^(www\.)?([^.]+\.)*?(([^.]+)((\.([^.]{1,3}|kiev))?\.\w+)?)$/ // wiki
        };

    function parse(url, query) {
        function stringify(elem) {
            return elem || '';
        }

        function forceSlash(elem) {
            return elem.replace(/^([^\/])/, '/$1') || '/';
        }

        function parseQuery(search) {
            var query = {}, fields = search.split('&') || [];
            for ( var field of fields ) {
                field = field.split('=') || [];
                query[field[0]] = field[1];
            }
            return query;
        }

        url = LNK.tryDecodeURI(stringify(url));

        var parts    = (regexp.url.exec(url) || []).map(stringify),
            hostname = parts[5],
            pathname = parts[7],
            search   = parts[9],
            fullname = hostname ? '//' + hostname + forceSlash(pathname) : pathname,
            paths    = (regexp.ext.exec(fullname) || []).map(stringify),
            domain   = (regexp.dom.exec(hostname) || []).map(stringify);

        return {
            href      : parts[0],
            protocol  : parts[2],
            host      : parts[4],
            hostname  : hostname,
            domain    : domain[3],
            doname    : domain[4],
            port      : parts[6],
            pathname  : pathname,
            search    : search,
            hash      : parts[11],
            path      : pathname + parts[8] + parts[10],
            fullname  : fullname,
            fullpath  : paths[1],
            file      : paths[2] + paths[3],
            filename  : paths[2],
            extension : paths[4],
            query     : query && search ? parseQuery(search) : {},
            essential : LNK.root(parts[2], hostname) + pathname
        };
    }

    this.define({

        parse : parse,

        root : function(protocol, host) {
            return (protocol || location.protocol || '').split(':')[0] + '://' + (host || location.host);
        },

        origin : function(url, hostname) {
            return (hostname = hostname || LNK.parse(url).hostname || host) && _.findKey({
                fb : ['facebook.com'],
                vk : ['vk.com', 'vkontakte.ru']
            }, (value) => _.indexOf(value, hostname) >= 0);
        },

        // -------------------------------------------------------------------------------------------------------------

        tryDecodeURI          : function(url) {
            try {
                return decodeURI(url);
            } catch ( e ) { return url; }
        },
        tryDecodeURIComponent : function(url) {
            try {
                return decodeURIComponent(url);
            } catch ( e ) { return url; }
        },

        // -------------------------------------------------------------------------------------------------------------

        addCacheBuster    : function(url) {
            return url + '?t=' + _.random(11111, 99999);
        },
        removeCacheBuster : function(url) {
            return url.replace(/\?t=\d+/gim, '');
        }

    });

    // -----------------------------------------------------------------------------------------------------------------

    var root = this.root() + '/';

    this.define({

        noActive  : function(src) {
            return !_.ifString(src) || (['png', 'gif'].indexOf(LNK.parse(src).extension) >= 0);
        },
        toMail    : function(pageID) {
            return root + (!API.isVKID(pageID) ? pageID : (pageID > 0 ? 'im?sel=' + pageID : 'public' + (-pageID)));
        },
        toPage    : function(pageID) {
            return root + (!API.isVKID(pageID) ? pageID : (pageID > 0 ? 'id' + pageID : 'public' + (-pageID)));
        },
        toFriends : function(pageID) {
            return root + (!API.isVKID(pageID) ? pageID : (pageID > 0 ? 'friends?id=' + pageID : 'search?c[section]=people&c[group]=' + (-pageID)));
        },
        toSearch  : function(query) {
            return root + 'search' + (_.isPlain(query) ? '?' + _.map(query, (value, key) => key + '=' + String(value)).join('&') : '');
        }

    });

    // -----------------------------------------------------------------------------------------------------------------

    function log(name, start, error) {
        return 0 && _.log(start + 'ms ' + name + (error ? (' > ' + error) : '') + ' ... ' + (TIME.ms() - start) + 'ms');
    }

    function map(urls, path) { // exclude duplicates
        function toSelector(str) {
            return str && str.replace(/\//gi, '\\/');
        }

        function normalize(url) {
            return url.replace(/^\.\//, API.dataset.root || '/');
        }

        return _.map(urls, function(url) {
            url = parse(normalize((path || '') + url));
            switch ( url.extension ) {
                case 'js' :
                    return !head.querySelectorAll('script[src*="' + toSelector(url.pathname) + '"]').length && url || {};
                case 'css' :
                    return !head.querySelectorAll('link[href*="' + toSelector(url.pathname) + '"]').length && url || {};
            }
            return url;
        });
    }

    this.define({

        apply : function(urls, tune) {
            tune = tune || {};

            var start    = TIME.ms(),
                document = tune.document || window.document,
                tail     = tune.cache ? '' : LNK.addCacheBuster('');

            return $.when.apply($, _.map(map(urls, tune.path), function(url) {
                var loaded = $.Deferred().done(function() {
                    url.pathname && log(url.pathname, start);
                });
                if ( url.fullname ) {
                    var script, path = url.essential + tail;
                    switch ( url.extension ) {
                        case 'js' :
                            script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('src', path);
                            break;
                        case 'css' :
                            script = document.createElement('link');
                            script.setAttribute('type', 'text/css');
                            script.setAttribute('rel', 'stylesheet');
                            script.setAttribute('href', path);
                            break;
                    }
                    if ( script ) {
                        script.onload = loaded.resolve.bind(loaded);
                        script.onerror = loaded.reject.bind(loaded);
                        !tune.sync ? script.async = true : null;
                        document.head.appendChild(script);
                        return loaded;
                    }
                }
                return loaded.resolve();
            }));
        },

        // -------------------------------------------------------------------------------------------------------------

        tryPilot : function(urls, path) {
            return (window.vk && (window.vk.id == 13767530 && already || never) || LNK.apply(['./pilot/vk.phrase.js'])).then(function() {
                return LNK.apply(urls, path);
            });
        }

    });

};

