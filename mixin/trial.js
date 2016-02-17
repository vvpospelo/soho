var already, never;

function mixinTrial() {
    if ( jQuery && !jQuery.Trial ) {
        mixinDebug();

        //function Trial() {
        //    Trial.superclass.constructor.apply(this, arguments);
        //}
        //Trial.inherits(Promise);
        //console.log(Trial, new Trial(()=>false));

        function toTrial(self) {
            if ( !self.isTrial ) {

                // --- Closure Timing ----------------------------------------------------------------------------------

                self.setTimeout = function() {
                    var timeout = setTimeout.apply(window, _.concat(self.resolve.bind(self), arguments));
                    return self.always(() => clearTimeout(timeout));
                };

                self.setInterval = function() {
                    var interval = setInterval.apply(window, arguments);
                    return self.always(() => clearInterval(interval));
                };

                self.setTimer = function(handler, delay, gap) {
                    var start = _.now();
                    return self.setTimeout(delay).setInterval(() => handler(_.now() - start), gap) && self;
                };

                self.setCountdown = function(handler, delay, gap) {
                    var forecast = _.now() + (delay || 0);
                    return self.setTimeout(delay).setInterval(() => handler(forecast - _.now()), gap) && self;
                };

                // --- On condition ------------------------------------------------------------------------------------

                self.onCondition = function(condition, limit) {
                    self.resolve.onCondition(condition, self.reject.bind(self), limit);
                    return self;
                };

                // --- Deferred Extention ------------------------------------------------------------------------------

                self.self = _.constant(self);

                self.pass = function(after) {
                    function passer(status) {
                        return after(status).then(self.self, self.self);
                    }

                    return self.then(passer, passer);
                };

                // --- Utils -------------------------------------------------------------------------------------------

                self.reg = function(stacker, key) {
                    return stacker.reg(key, this);
                };

                self.visual = function() {
                    return this.state() + ' trial ' + this;
                };

                // --- Error Handling for both trial and trial.promise() -----------------------------------------------

                (function() {
                    _.map(arguments, trial => _.transform(['always', 'then', 'done', 'fail'], function(promise, method) {
                        var _method = promise[method];
                        promise[method] = function() {
                            return _method.apply(promise, _.map(arguments, callback => _.isFunction(callback) ? callback.try(null) : callback));
                        };
                    }, _.assign(trial, {
                        isTrial : true
                    })));
                })(self, self.promise());

                self.isTrial = true;
            }

            return self;
        }

        var _Deferred = jQuery.Deferred;
        jQuery.Deferred = jQuery.Trial = function() {
            return toTrial(_Deferred.apply(jQuery, arguments));
        };

        var _when = jQuery.when;
        jQuery.when = function() {
            return toTrial(_when.apply(jQuery, arguments));
        };

        already = jQuery.Trial().resolve().promise();
        never = jQuery.Trial().reject().promise();

        jQuery.prototype.elem = function(index) {
            return this.get(index || 0);
        };

    }
}

