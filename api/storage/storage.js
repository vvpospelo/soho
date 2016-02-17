'use strict';

function ChromeStorage(storage) {

    var self = this;

    // --- Compression -----------------------------------------------------------------------------------------

    function compress(obj) {
        return _.cloneDeep(obj, function(value) {
            return _.isString(value) ? LZString.compressToUTF16(value) : undefined;
        });
    }

    function decompress(obj) {
        return _.cloneDeep(obj, function(value) {
            return _.isString(value) ? LZString.decompressFromUTF16(value) : undefined;
        });
    }

    function file(obj) {
        return _.cloneDeep(obj, function(value) {
            return _.isString(value) ? LZString.compressToEncodedURIComponent(value) : undefined;
        });
    }

    function unfile(obj) {
        return _.cloneDeep(obj, function(value) {
            return _.isString(value) ? LZString.decompressFromEncodedURIComponent(value) : undefined;
        });
    }

    // -----------------------------------------------------------------------------------------------------------------

    function error(e, fail) {
        fail && fail(e);
        throw new Error(e);
    }

    var damp = function(map, done, fail) {
        storage.get(map, function(items, e) {
            !(e = chrome.runtime.error) ? done(items) : error(e, fail);
        });
    }.try(null);

    var get = function(map, done, fail) {
        storage.get(map, function(items, e) {
            !(e = chrome.runtime.error) ? done(decompress(items)) : error(e, fail);
        });
    }.try(null);

    var set = function(obj, done, fail) {
        _.isPlain(obj) ? storage.set(compress(obj), function(e) {
            !(e = chrome.runtime.error) ? done && done(obj) : error(e, fail);
        }) : fail && fail();
    }.try(null);

    var assign = function(obj, done, fail) {
        _.isPlain(obj) ? get(_.keys(obj), function(target) {
            set(_.merge(target, obj), done, fail);
        }, fail) : fail && fail();
    }.try(null);

    ChromeStorage.prototype.define({

        damp : function(map, trial) {
            return (trial = trial || $.Deferred()) && damp(map, trial.resolve, trial.reject) || trial;
        }.try(never),

        get : function(map, trial) {
            return (trial = trial || $.Deferred()) && get(map, trial.resolve, trial.reject) || trial;
        }.try(never),

        set : function(obj, trial) {
            return (trial = trial || $.Deferred()) && set(obj, trial.resolve, trial.reject) || trial;
        }.try(never).argObj(),

        assign : function(obj, trial) {
            return (trial = trial || $.Deferred()) && assign(obj, trial.resolve, trial.reject) || trial;
        }.try(never).argObj()

    });

    // -----------------------------------------------------------------------------------------------------------------

    var length = function(map, done, fail) {
        storage.getBytesInUse(map, function(bytes, e) {
            !(e = chrome.runtime.error) ? done(bytes) : error(e, fail);
        });
    }.try(null);

    var remove = function(map, done, fail) {
        storage.remove(map, function(e) {
            !(e = chrome.runtime.error) ? done && done() : error(e, fail);
        });
    }.try(null);

    var wipe = function(done, fail) {
        confirm('Are you sure want to wipe all storage data !? ') ? storage.clear(function(e) {
            !(e = chrome.runtime.error) ? done && done() : error(e, fail);
        }) : done && done();
    }.try(null);

    ChromeStorage.prototype.define({

        length : function(map, trial) {
            return (trial = trial || $.Deferred()) && length(map, trial.resolve, trial.reject) || trial;
        }.try(never),

        remove : function(map, trial) {
            return (trial = trial || $.Deferred()) && remove(map, trial.resolve, trial.reject) || trial;
        }.try(never),

        wipe : function(trial) {
            return (trial = trial || $.Deferred()) && wipe(trial.resolve, trial.reject) || trial;
        }.try(never)

    });

    // --- Upload ------------------------------------------------------------------------------------------------------

    var uploaders = new Handlers();

    ChromeStorage.prototype.define({
        onUpload  : uploaders.add.bind(uploaders),
        offUpload : uploaders.remove.bind(uploaders),

        upload : function() {
            return get(null, function(items) {
                uploaders.invoke(items);
            });
        }.try(never)
    });

    // --- Change ------------------------------------------------------------------------------------------------------

    var listeners = new Handlers();

    ChromeStorage.prototype.define({
        onChanged  : listeners.add.bind(listeners),
        offChanged : listeners.remove.bind(listeners),
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        _.keys(changes).map(key => listeners.invoke(changes[key], key, namespace));
    });

    // --- Tools -------------------------------------------------------------------------------------------------------

    ChromeStorage.prototype.define({
        log : function(raw) {
            return self[raw && 'damp' || 'get'](null).done(function(obj) {
                _.log(obj);
            });
        }
    });

}

