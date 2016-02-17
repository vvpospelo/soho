var errorStack = new function ErrorStack() {

    var stack = {};

    ErrorStack.prototype.define({
        push : function(e) {
            (stack[e.type] = stack[e.type] || []).push({
                time  : _.now(),
                type  : e.type,
                stack : e.stack
            });
            return e;
        },
        last : function(type) {
            return _.last(stack[type || 'error']) || {}
        },
        size : function(type) {
            return _.size(stack[type || 'error']);
        }
    });

};

function Warning(stack) {
    Warning.superclass.constructor.apply(this, arguments);

    this._type = 'warn';
    this.stack = stack;
}

// ---------------------------------------------------------------------------------------------------------------------

function mixinDebug(notice) {
    mixinVisual();

    if ( !Object.prototype.try ) {

        Error.prototype.defineProp('type', {
            get : function() {
                return this._type || 'error';
            }
        });

        Warning.inherits(Error);

        // -------------------------------------------------------------------------------------------------------------

        console.define({
            collapse : function() {
                try {
                    _.map(arguments, function(value) {
                        _.isArray(value) ? console.collapse.apply(console, value) :
                        _.isPlain(value) ? _.forOwn(value, function(value, key) {
                            console.groupCollapsed(key + ' >>>');
                            console.collapse(value);
                            console.groupEnd();
                        }) : _.log(value);
                    });
                } catch ( e ) {
                    _.log(e.stack);
                }
            }
        });

        Error.prototype.define({
            console : function() {
                var stack = LNK.removeCacheBuster(this.stack);
                console.collapse({}.entry(TIME.format() + ' ' + _.map(_.take(_.lines(stack), 2), _.trim).join(' '),
                    [_.filter(_.drop(_.lines(stack)), line => line.search(API.dataset.root + 'require/') < 0).join('\n')]
                        .concat(Array.from(arguments))));
            }
        });

        // -------------------------------------------------------------------------------------------------------------

        Error.prototype.define({
            alert : function(info) {
                this.console(info) || this.notice && this.notice({
                    timeout : TIME.maxTimeout
                }.entry(this.type, this.stack));
                return this;
            }
        });

        // -------------------------------------------------------------------------------------------------------------

        Function.prototype.define({
            try : function(reaction) {
                var func = this;
                return function() {
                    try {
                        if ( !this || !_.isJQuery(this) || this.length ) {
                            return func.apply(this, arguments);
                        }
                    } catch ( e ) {
                        errorStack.push(e).alert({
                            arguments : arguments
                        });
                    }
                    return _.isUndefined(reaction) ? this : reaction;
                };
            }.wrapper()
        });

        Object.prototype.define({
            try : function(args) {
                return args = Array.from(arguments) &&
                    _.transform(this, (obj, func, key) => obj[key] = _.isFunction(func) ? func.try.apply(func, args) : func);
            }
        });

        // -------------------------------------------------------------------------------------------------------------

        window.onerror = function(message, url, line, col, error) {
            error ? error.alert() : _.log(message + ' at ' + url + ':' + line + ':' + col + ' Click or press F12 for details');
        };

    }

    _.isFunction(notice) && Error.prototype.define({
        notice : function(msg) {
            notice(_.assign({
                last : errorStack.last(this.type).stack,
                size : errorStack.size(this.type)
            }, msg));
        }
    }.try(null));

}
