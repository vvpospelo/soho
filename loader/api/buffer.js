'use strict';

function Buffer(handler) {

    var tasks    = [],
        self     = this,
        trial    = already,
        progress = function() { },
        then     = function() { };

    function nextTask() {
        progress(tasks.length);
        if ( !_.isPending(trial) ) {
            if ( tasks.length > 0 ) {
                ( _.ifTrial(trial = handler(tasks.shift())) || already).done(nextTask);
            } else {
                then();
            }
        }
    }

    if ( _.isFunction(handler) ) {
        handler = handler.try(never);

        self.define({

            then     : function(handler) {
                return (then = _.ifFunction(handler) || then) && self;
            },
            progress : function(handler) {
                return (progress = _.ifFunction(handler) || progress) && self;
            }

        });

        // -------------------------------------------------------------------------------------------------------------

        self.define({

            append  : function(task) {
                tasks.push(task);
                nextTask();
            },
            prepend : function(task) {
                tasks.unshift(task);
                nextTask();
            },
            reset   : function() {
                tasks = [];
                TIME.reject(trial);
                progress(0);
                return self;
            }

        }).reset();

    }

}

// ---------------------------------------------------------------------------------------------------------------------

function Timing(handler, delay) {

    var tasks = [],
        self  = this,
        busy  = false,
        trial = already,
        exec  = already;

    function nextTask() {
        if ( tasks.length && !busy ) {
            exec = handler(tasks.shift());
            if ( _.isPending(exec) ) {
                busy = setTimeout(function() {
                    busy = false;
                    nextTask();
                }, delay);
                exec.done(trial.resolve)
                    .fail(trial.reject);
            }
            return exec;
        }
        return trial = $.Trial();
    }

    if ( _.isFunction(handler) ) {
        handler = handler.try(never);

        self.define({

            append : function(task) {
                self.reset();
                tasks = [task];
                return nextTask();
            },
            reset  : function() {
                tasks = [];
                TIME.reject(exec);
                TIME.reject(trial);
                return self;
            }

        }).reset();
    }

}

