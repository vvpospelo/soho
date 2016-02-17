var $ = jQuery.noConflict();

jQuery.prototype.notice = function(id) {
    var self   = this,
        notice = $('<div class="tracer" id="' + id + '"></div>');
    self.onChildMutation(function() {
        notice.text(self.contents().length || '');
    });
    return notice.text(self.contents().length || '').attr('title', 'Click or press F12 for details').click(function() {
        alert(self.contents().last().remove().text());
    });
};

// ---------------------------------------------------------------------------------------------------------------------

DOM.block = {};

DOM.block.is = false;
DOM.block.stack = [];

DOM.block.on = function() {
    DOM.block.is = Boolean(DOM.block.stack.unshift(true) > 0);
    if ( DOM.block.stack.length == 1 ) {
        DOM.blocker.addClass('locked');
    }
    return already;
}.try(never);

DOM.block.off = function() {
    DOM.block.stack.shift();
    DOM.block.is = Boolean(DOM.block.stack.length > 0);
    if ( !DOM.block.is ) {
        DOM.blocker.removeClass('locked');
    }
    return already;
}.try(never);

DOM.block.while = function(trial) {
    if ( _.isPending(trial) ) {
        DOM.block.on().done(function() {
            trial.always(DOM.block.off);
        });
    }
    return trial;
}.try(never);

// ---------------------------------------------------------------------------------------------------------------------

DOM.addWatch = function(src) {
    DOM.watcher.append(src);
}.try(null);

DOM.watch = function(src) {
    DOM.watcher.empty().append(src);
}.try(null);

DOM.addTrace = function(src) {
    DOM.tracer.append(src);
}.try(null);

DOM.trace = function(src) {
    DOM.tracer.empty().append(src);
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

DOM.showTime = function(time) {
    DOM.timer.html(_.isNumeric(time) && time >= 0 ? TIME.toTimeString(time) : '');
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

DOM.flash = function() {
    function format(hint) {
        return _.isPlain(hint) ? _.visual(_.transform(hint, function(hint, value, key) {
            value != null ? hint[key] = _.isNumeric(value) ? String(value).numeral() : value : null;
        }, {}), {
            comma    : '<br>',
            quotes   : ['<span class="quotes">', '</span>'],
            brackets : ['<div class="brackets">', '<br></div>']
        }) : hint;
    }

    var delay = _.ifNumeric(_.last(arguments)) || 0;

    if ( delay ) {
        var trial = $.Trial().setTimeout(delay),
            timer = $('<div class="flash_timer"></div>');

        DOM.flasher.stop(true).empty().show().css('opacity', 1)
            .append(timer, _.map(_.dropRightWhile(arguments, _.isNumeric), format).join('')).fadeOut(delay * 1.33);

        return delay > 2999 && trial.setCountdown(function(ms) {
                timer.html(TIME.toTimeString(ms, 2999));
            }, delay) || trial;
    }
    return already;
}.try(never);

// ---------------------------------------------------------------------------------------------------------------------

DOM.scrollTop = function(scrollHeight, duration) {
    if ( _.is(scrollHeight) ) {
        duration = duration || 0;
        DOM.wheelOff();
        return DOM.block.while(DOM.scrollBody.animate({
            scrollTop : scrollHeight
        }, {
            duration : duration,
            easing   : 'linear'
        }).promise()).always(DOM.wheelOn);
    } else {
        return DOM.scrollBody.scrollTop();
    }
}.try(never);

// ---------------------------------------------------------------------------------------------------------------------

DOM.whenWindowStoped = function(timeout) {
    timeout = timeout || TIME.atom;
    return DOM.dataset.interruptible ? setTimeout(function() {
        if ( window.stop ) {
            window.stop();
        } else {
            if ( document.execCommand ) {
                document.execCommand('Stop', false);
            }
        }
    }, timeout / 2) && 0 || $.Trial().setTimeout(timeout) : already;
}.try(already);
