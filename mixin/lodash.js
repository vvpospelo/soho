function mixinLodash() {
    if ( _ && !_.is ) {
        mixinObject();

        _.mixin({

            log : function() { return console.log.apply(console, arguments); },

            new : function() { return _.assign.apply(_, [{}].concat(Array.from(arguments))); },

            is : function(obj) { return !_.isNull(obj) && !_.isUndefined(obj); },
            no : function(obj) { return !_.is(obj); },

            isNumeric  : function(obj) { return obj !== null && !isNaN(obj); },
            isObserver : function(obj) { return obj instanceof MutationObserver; },

            isJQuery : function(obj) { return obj instanceof jQuery; },
            toJQuery : function(obj) { return obj instanceof jQuery && obj || jQuery(obj); },

            isTrial   : function(obj) { return _.isPlainObject(obj) && obj.isTrial; },
            isPending : function(trial) { return _.isTrial(trial) && (trial.state() === 'pending') && _.isFunction(trial.then); },

            isPlain : function(obj) { return _.isPlainObject(obj) && !obj.isTrial; },
            isBlank : function(str) { return !str || /^[\s\uFEFF\xA0]*$/.test(str); },

            // ---------------------------------------------------------------------------------------------------------

            if : function() { return _.find(arguments, _.is) || null; },

            ifArray : function() { return _.find(arguments, _.isArray) || null; },

            ifString : function() { return _.find(arguments, _.isString) || null;},

            ifNumeric  : function() { return _.find(arguments, _.isNumeric) || null; },
            ifFunction : function() { return _.find(arguments, _.isFunction) || null; },

            ifJQuery : function() { return _.find(arguments, _.isJQuery) || null; },

            ifTrial   : function() { return _.find(arguments, _.isTrial) || null; },
            ifPending : function() { return _.find(arguments, _.isPending) || null; },

            // ---------------------------------------------------------------------------------------------------------

            asArray : function(obj) { return _.ifArray(obj) || [obj]; },

            // ---------------------------------------------------------------------------------------------------------

            grep : function(obj, filter) { // filter object
                return _.transform(obj, function(obj, value, key) {
                    filter(value, key) && (obj[key] = value);
                });
            },

            // ---------------------------------------------------------------------------------------------------------

            identify : function(obj) {
                // http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
                return _.find(['isArguments', 'isArray', 'isBoolean', 'isDate', 'isElement', 'isError', 'isFinite',
                    'isFunction', 'isNaN', 'isNull', 'isNumber', 'isJQuery', 'isTrial', 'isPlainObject',
                    'isRegExp', 'isString', 'isTypedArray', 'isUndefined', 'isEmpty', 'isObject'], function(method) {
                    return _[method](obj);
                });
            },

            instance : function(obj) {
                return (Function.prototype.toString.call(obj.constructor).match(/function (.*)\(/)[1] || '').toLowerCase();
            },

            // --- Tools -----------------------------------------------------------------------------------------------

            //    this.tryNumber = function(value) {
            //    if ( _.is(value) ) {
            //        _.isJQuery(value) ? value = String(value.text() || 0) : null;
            //        return !isNaN(value) ? Number(value) : (!isNaN(value = String(value).replace(/\D/g, '')) ? Number(value) : null);
            //    }
            //    return null;
            //};

            toObject : function(arr, value, obj) {
                return _.transform(arr, _.ifFunction(value) || function(obj, key) {
                        obj[key] = value;
                    }, obj || {});
            },

            // --- String ----------------------------------------------------------------------------------------------

            lines : function(str) { return str.split(/\r?\n/); }

        });

        // -------------------------------------------------------------------------------------------------------------

        // -------------------------------------------------------------------------------------------------------------
        // ( filter + map ) == reduce == transform // http://elijahmanor.com/reducing-filter-and-map-down-to-reduce/
        // _.merge || _.cloneDeep == recursion, default value == undefined;

        var t = {
            f : 6,
            g : {
                fd    : 7,
                fge   : [
                    8,
                    3,
                    4,
                    0,
                    6
                ],
                u     : {
                    twer : [
                        7,
                        6,
                        {
                            t : 8,
                            y : 6,
                            j : 'gggsf3wfsdfeg',
                            g : 4
                        }
                    ]
                },
                k     : 6,
                ggggg : {}
            },
            l : [6, 5, 7, 4]
        };

        //console.log(_.every(t, (t,y,u) => console.log(t,y,u)));

        //console.log(_.merge([[0,0],[0,0]], []));

        //console.log(_.zip([5,6],[7,8]));

        //console.log(_.pickBy({
        //    keyCode  : [37, 38, 39, 40],
        //    shiftKey : true,
        //    ctrlKey  : true,
        //    f        : false,
        //    g        : 0
        //}));

        //console.log(_.diffKeys({
        //    keyCode  : [37, 38, 39, 40],
        //    shiftKey : true,
        //    ctrlKey  : true,
        //    f        : 4
        //}, {
        //    keyCode  : 38,
        //    shiftKey : true,
        //    ctrlKey  : true,
        //    sdf      : false
        //}));

        //console.log(t, _.grep(t, (value,key) => value == 6));

        //var q =function q (){
        //    console.log(1);
        //    return 1;};
        //var x=function x(){
        //    console.log(0);
        //    return 4;};
        //var z=function z(){
        //    console.log(2);
        //    return 2;};
        //
        //var e= [q,z,x];
        //
        //console.log(_.every(e, g => g()));

        //console.log(_.capitalize('sdf sdf RET 6fsg'));
        //
        //console.log(_.pick(t, { g : 6 }));

        //console.log(_.filter([5,6,7], [6] ));

        // -------------------------------------------------------------------------------------------------------------


        //console.log(_.visual(_.cloneDeep(t, function(r) {
        //    return _.isNumber(r) && null;
        //})));
        //
        //var r = _.reduceDeep(t, function(n) {return n * 8;});
        //

        // -------------------------------------------------------------------------------------------------------------

        //console.log(_.visual(t), _.wipe(t));

    }
}

