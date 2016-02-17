TIME.calc = function(callback, iter) {
    if ( _.isFunction(callback) ) {
        var ms = TIME.ms();
        iter = iter || 1;
        while ( iter-- )
            callback();
        return TIME.ms() - ms;
    }
    return null;
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

TIME.leftFormat = function(ms, days) {
    return !_.isNumeric(ms) && 'NaN' || (days = Math.floor(ms / TIME.day)) + 'd ' +
        new Date(ms - days * TIME.day).toUTCString().split(' ')[4].split(':')[0] + 'h';
}.try('');

// --- Trial -----------------------------------------------------------------------------------------------------------

TIME.reject = function(trial, status) {
    return _.isPending(trial) && _.is(trial.reject) && trial.reject(status ? status : 'abort') || trial;
}.try(never);

TIME.resolve = function(trial, status) {
    return _.isPending(trial) && _.is(trial.resolve) && trial.resolve(status) || trial;
}.try(never);

// ---------------------------------------------------------------------------------------------------------------------

TIME.isFuture = function(time) {
    return _.now() - (time || 0) < 0;
}.try(false);

TIME.isValid = function(date) {
    return _.ifNumeric(date) && _.inRange(date, TIME.never, _.now());
};

TIME.ifValid = function() {
    return _.find(arguments, TIME.isValid) || null;
};

