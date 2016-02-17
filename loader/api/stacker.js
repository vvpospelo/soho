'use strict';

Function.prototype.define({

    argKey : function(isObject) {
        var func = this;
        return function(key, obj) {
            function keyGen(uniq) {
                return _.isObject(uniq) && JSON.stringify(uniq) || String(uniq);
            }

            var args = Array.from(arguments);
            isObject(args[0]) ? args.unshift(_.uniqueId('key')) : args[0] = keyGen(args[0]);
            return func.apply(this, args);
        };
    }.wrapper()

});

// ---------------------------------------------------------------------------------------------------------------------

function Stacker(isObject, breaker) {

    breaker = _.ifFunction(breaker) || function() { };

    var stack = {};

    this.define({

        reg   : function(key, value) {
            switch ( arguments.length ) {
                case 0:
                    break;
                case 1:
                    return stack[key];
                default:
                    return stack[key] = breaker(stack[key]) && 0 || value;
            }
        }.argKey(isObject),
        reset : function() {
            return _.forOwn(stack, breaker) && (stack = {}) && this;
        }.try()

    }).reset();

}

// ---------------------------------------------------------------------------------------------------------------------

function Handlers() {

    var handlers = [];

    this.define({

        add    : function(handler) {
            _.isFunction(handler) && handlers.push(handler);
        }.try(null),
        remove : function(handler) {
            _.remove(handlers, value => value == handler);
        }.try(null),
        clear  : () => (handlers = []) && this,

        invoke : function() {
            var args = Array.from(arguments);
            return _.map(handlers, handler => handler.apply(null, args)) && this;
        }.try(),
        every  : function() {
            var args = Array.from(arguments);
            return _.every(handlers, handler => handler.apply(null, args));
        }.try(true)

    }).clear();

}

// ---------------------------------------------------------------------------------------------------------------------

function Listener(listener) {
    Listener.superclass.constructor.apply(this, arguments);

    var listen = false;

    this.define({
        listen : function(handler) {
            !listen && listener.bind(this)(listen = true);
            this.add(handler);
        }.try(null)
    });

}

Listener.inherits(Handlers);
