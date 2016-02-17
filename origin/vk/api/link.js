Function.prototype.define({

    link : function() {
        var func = this;
        return function(event) {
            var link = $(this);
            link.VKID = link.tryVKID();
            link.card = link.linkCard();
            link.VKID ? link.role = this.dataset.role : null;
            var args = Array.from(arguments);
            args.splice(1, 0, link);
            return func.apply(this, args);
        };
    }.wrapper()

});

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.define({

    deferEnter : function() {
        var args    = Array.from(arguments),
            pause   = _.isNumeric(_.last(args)) && args.pop() || 0,
            handler = _.isFunction(_.last(args)) && args.pop().try(null).link().defer(pause) || function() { };
        handler.reject && jQuery.prototype.on.apply(this, ['mouseleave'].concat(args).concat([handler.reject]));
        return jQuery.prototype.on.apply(this, ['mouseenter'].concat(args).concat([handler]));
    }.try()

});
