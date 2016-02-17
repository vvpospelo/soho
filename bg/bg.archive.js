function Archive(storage) {

    var self  = this,
        name  = _.instance(self),
        cache = {};

    // --- Storage to Cache wrapers ------------------------------------------------------------------------------------

    Archive.prototype.define({

        wrap : function(obj) {
            return _.transform(obj, function(items, value, VKID) {
                return API.isVKID(VKID) ? items[VKID] = {}.entry(name, value) : null;
            }, {});
        },

        unwrap : function(items) {
            return _.transform(items, function(obj, value, VKID) {
                return API.isVKID(VKID) ? obj[VKID] = value[name] : null;
            }, {});
        }

    }.try({}));

    // --- Assign | Storage && Cache -----------------------------------------------------------------------------------

    var validate = function(items) {
        //function forceError(field) {
        //    throw new Error('Invalid ' + field + ' !');
        //}
        //
        //_.forOwn(items, function(obj) {
        //
        //
        //    console.log(obj);
        //
        //
        //    !obj.VKID && forceError('VKID');
        //    _.forOwn(obj, function(value, key) {
        //        switch ( key ) {
        //            case 'VKID' :
        //                !_.isNumber(value) && forceError(key);
        //                break;
        //            case 'date' :
        //                !TIME.ifValid(value) && forceError(key);
        //                break;
        //            case 'name' :
        //                !_.ifString(value) && forceError(key);
        //                break;
        //            case 'src' :
        //                !_.ifString(value) && forceError(key);
        //                break;
        //        }
        //    });
        //});
        return items;
    }.try({});

    storage.onUpload(function(items) {
        _.assign(cache, self.unwrap(items));
    }.try({}));

    self.set = self.assign = function(obj) {
        return _.isPlain(obj) && storage.assign(validate(self.wrap(obj))).done(function(items) {
                _.assign(cache, self.unwrap(validate(items)));
            }) || never;
    }.try(never).argObj();

    // -----------------------------------------------------------------------------------------------------------------

    function wipeDeep(obj, constant, self) { // new object wiped by constant
        return _.cloneDeep(obj, function(value) {
            return !_.isObject(value) ? constant || null : undefined;
        }, self);
    }

    self.clear = function() {
        return storage.assign(self.wrap(deepWipe(cache, null, 1))).done(function(items) {
            _.assign(cache, self.unwrap(items));
        });
    }.try(never);

    // --- Access | Cache ----------------------------------------------------------------------------------------------

    self.get = function(VKID) {
        return cache[VKID];
    }.try(null);

    self.pick = function(pickup) {
        return pickup ? _.pick(cache, _.isPlain(pickup) && _.keys(pickup) || pickup) : _.pickBy(cache, _.is);
    }.try({});

    self.count = function() {
        return _.size(cache);
    }.try(0);

    // --- Tools -------------------------------------------------------------------------------------------------------

    self.boolean = function(pickup) {
        return _.transform(self.pick(pickup), function(obj, value, VKID) {
            obj[VKID] = Boolean(value);
        }, {});
    }.try({});

    self.orderBy = function(field, desc) {
        return _.sortBy(self.pick(), function(obj) {
            return desc ? -obj[field] : obj[field];
        });
    }.try([]);

    self.history = function() {
        return self.orderBy('date', true);
    }.try([]);

    // --- AJAX --------------------------------------------------------------------------------------------------------

    self.ajax = new function() {

        function ajax(options, trial, attempts) {
            function retry(status, xhr, response) {
                if ( status != 'abort' && !XHR.isAborted(xhr) ) {
                    attempts > 1 && _.log('Loading fail ' + XHR.visualRequest(options) + ' with ' + status, {
                        response : response
                    });
                    setTimeout(ajax, 1200 + (attempts = attempts || 0) * 333, options, trial, ++attempts);
                }
            }

            return (trial = trial || $.Deferred()).always($.ajax({
                type    : options.type,
                url     : options.url,
                data    : options.data,
                success : function(response, status, xhr) {
                    !XHR.noResponse(response) ? trial.resolve(response) : retry(status, xhr, response);
                },
                error   : function(xhr, status) {
                    retry(status, xhr);
                }
            }).abort);
        }

        this.post = function(url, data) {
            return ajax({
                type : 'POST',
                url  : 'https://vk.com/' + url,
                data : data
            });
        }.try(never);

    };

}

// --- Own Data / Frequently Updated -----------------------------------------------------------------------------------

function Preloader() {
    Preloader.superclass.constructor.apply(this, arguments);

    var self = this,
        name = _.instance(self);

    // --- Storage to Cache wrapers ------------------------------------------------------------------------------------

    self.wrap = function(obj) {
        return {}.entry(name, obj);
    }.try({});

    self.unwrap = function(items) {
        return items[name] || {};
    }.try({});

}


