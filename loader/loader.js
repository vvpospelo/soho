'use strict';

function Loader() {

    var self = this,
        name = _.instance(self);

    self.isActual = function(VKID) {
        return _.is(VKID) && VKID == self.VKID;
    };

    // --- Buffers -----------------------------------------------------------------------------------------------------

    var buffers = [];
    self.addBuffer = buffers.push.bind(buffers);

    // --- Stacker Trial -----------------------------------------------------------------------------------------------

    var trieds = new Stacker(_.isTrial, TIME.reject);
    self.reg = trieds.reg.bind(trieds);

    self.Trial = function(key, trial) {
        return self.reg(key, trial || $.Trial());
    }.argKey(_.isTrial);

    self.delay = function(key) {
        return self.Trial(key).setTimeout.apply(null, _.tail(arguments));
    }.argKey(_.isNumber);

    // --- .ajax -------------------------------------------------------------------------------------------------------

    function AJAX() {

        var ajax = function(options, VKID, attempts) {
            function retry(status, xhr, response) {
                if ( self.isActual(VKID) && status != 'abort' && !XHR.isAborted(xhr) ) {
                    try {
                        if ( attempts > 1 )
                            throw new Warning('loading fail ' + XHR.visualRequest(options) +
                                ' with ' + status + '\n\n\tresponse : ' + response);
                    } finally {
                        self.delay(TIME.error + (attempts = attempts || 0) * 333).then(function() {
                            ajax(options, VKID, ++attempts);
                        });
                    }
                }
            }

            if ( self.isActual(VKID) ) {
                return (_.ifPending(self.reg(options)) || self.Trial(options)).always($.ajax({
                    type    : options.type,
                    url     : options.url,
                    data    : options.data,
                    success : function(response, status, xhr) {
                        self.isActual(VKID) && !XHR.noResponse(response) ? TIME.resolve(self.reg(options), response) : retry(status, xhr, response);
                    },
                    error   : function(xhr, status) {
                        retry(status, xhr);
                    }
                }).abort);
            }
            return never;
        }.try(never);

        this.post = function(url, data) {
            return ajax({
                type : 'POST',
                url  : url,
                data : data
            }, self.VKID);
        }.try(never);

        this.get = function(url) {
            return ajax({
                url : url
            }, self.VKID);
        }.try(never);

    }

    self.ajax = new AJAX();

    // --- .server -----------------------------------------------------------------------------------------------------

    function Server() {

        function isActual(VKID) {
            return _.no(self.VKID) || self.isActual(VKID);
        }

        function firstKey(msg) {
            return _.keys(_.omit(msg, ['client', 'VKID']))[0];
        }

        var serve = function(msg, key, VKID) {
            function post(msg) {
                return DOM.listener.post(_.assign(msg, _.pickBy({
                    client : name,
                    VKID   : !isActual(msg.VKID) && VKID
                })));
            }

            return isActual(VKID) && (key = key || firstKey(msg)) && (_.ifPending(self.reg(key)) || post(msg) && self.Trial(key)) || never;
        }.try(never);

        // -------------------------------------------------------------------------------------------------------------

        this.addListener = function(handler) {
            DOM.listener.listen(function(msg, key) {
                _.isPlain(msg) && msg.client == name && isActual(msg.VKID) && (key = firstKey(msg)) && handler(msg, msg[key], key);
            });
        }.try(null);

        this.serve = function(msg, key) {
            return serve(msg, key, self.VKID);
        }.try(never).argObj(true);

        this.addListener(function(msg, value, key) {
            TIME.resolve(self.reg(key), value);
        });

    }

    self.server = new Server();

    // --- .tabs -------------------------------------------------------------------------------------------------------

    self.tabs = new Tabs(self.server);

    // --- .reset ------------------------------------------------------------------------------------------------------

    (self.reset = function() {
        buffers.forEach(buffer => buffer.reset());
        [trieds].forEach(stacker => stacker.reset());
        self.VKID = null;
        return already;
    }.try(already))();

}
