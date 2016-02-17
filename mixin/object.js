function mixinObject() {
    if ( !Object.prototype.define ) {

        Object.defineProperties(Object.prototype, {
            // http://habrahabr.ru/post/150571/
            // only new methods creation way, just unique name
            defineProp  : {
                value      : function(key, descriptor) {
                    descriptor ? Object.defineProperty(this, key, descriptor) : Object.defineProperties(this, key);
                    return this;
                },
                enumerable : false
            },
            defineValue : {
                value      : function(key, value) {
                    if ( typeof key == 'string' && value ) {
                        this.defineProp(key, {
                            value        : value,
                            writable     : false,
                            configurable : false,
                            enumerable   : false
                        });
                    } else {
                        for ( var prop in key )
                            if ( key.hasOwnProperty(prop) ) {
                                this.defineValue(prop, key[prop]);
                            }
                    }
                    return this;
                },
                enumerable : false
            },
            define      : {
                value      : function(key, property) {
                    if ( typeof key == 'string' && property ) {
                        this.defineProp(key, {
                            value        : property,
                            enumerable   : false,
                            configurable : true
                        });
                    } else {
                        for ( var prop in key )
                            if ( key.hasOwnProperty(prop) ) {
                                this.define(prop, key[prop]);
                            }
                    }
                    return this;
                },
                enumerable : false
            }
        });

        Object.prototype.define({
            // http://stackoverflow.com/questions/1827458/prototyping-object-in-javascript-breaks-jquery
            // http://stackoverflow.com/questions/14047809/js-defineproperty-and-prototype
            entry    : function(key, value) {
                this[key] = value;
                return this;
            },
            // http://javascript.ru/tutorial/object/inheritance
            // https://learn.javascript.ru/class-inheritance
            inherits : function(Parent) {
                this.prototype = Object.create(Parent.prototype);
                this.prototype.constructor = this;
                this.superclass = Parent.prototype;
                return this;
            }
        });

        // -------------------------------------------------------------------------------------------------------------

        var defineId = 1000000000;
        Function.prototype.defineProp('defineId', {
            get : function() {
                return this._defineId || (this._defineId = defineId++);
            }
        });

        Function.prototype.defineProp('wrappers', {
            get : function() {
                return this._wrappers || {};
            },
            set : function(defineId) {
                this._wrappers = Object.assign(this.wrappers, typeof defineId === 'number' ? {}.entry(defineId, true) : defineId)
            }
        });

        Function.prototype.define({
            wrapper : function() {
                var wrapper = this;
                return function() {
                    return !this.wrappers[wrapper.defineId] && Object.assign(wrapper.apply(this, Array.from(arguments)), {
                            wrappers : wrapper.defineId
                        }, {
                            wrappers : this.wrappers
                        }) || this;
                };
            }
        });

        // -------------------------------------------------------------------------------------------------------------

        Function.prototype.define({
            defer : function(pause) {
                var func = this,
                    iDef = null;
                return function() {
                    clearTimeout(iDef);
                    iDef = setTimeout(function(args) {
                        func.apply(this, args);
                    }.bind(this), pause, Array.from(arguments));
                }.define({
                    reject : () => clearTimeout(iDef)
                });
            }.wrapper()
        });

        // -------------------------------------------------------------------------------------------------------------

        Function.prototype.define({
            argObj : function(fill) {
                var func = this;
                return function() {
                    var args = Array.from(arguments);
                    _.size(args) && !_.isPlain(_.head(args)) && (args[0] =
                        {}.entry(String(args.shift()), _.if(_.head(args), fill)));
                    return func.apply(this, args);
                };
            }.wrapper()
        });

        Function.prototype.define({
            code : function() {
                return '(' + this.toString() + ')();\r\n';
            }
        });

        Function.prototype.define({
            onCondition : function(condition, fail, limit, gap) {
                var done = function(result) {
                        return (result = condition()) ? this(result) && 0 || true : null;
                    }.bind(this),
                    int  = !done() && setInterval(function() {
                            done() && (fail = null || clearInterval(int));
                        }, gap || 5);
                int && setTimeout(() => clearInterval(int) || fail && fail('timeout'), limit || 9999);
            }
        });

        // -------------------------------------------------------------------------------------------------------------

        Object.prototype.define({
            onAppearance : function(prop, done, fail, limit, gap) {
                return done.onCondition(function(value) {
                    return (typeof (value = this[prop]) !== 'undefined') && value;
                }.bind(this), fail, limit, gap);
            }
        });

    }
}

mixinObject();