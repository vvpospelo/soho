new function Observer() {

    var parse = function parse(mutations, options) {
        var nodes = {
            added   : [],
            removed : [],
            attrs   : {}
        };

        function pushNodes(array, nodes) {
            var i = nodes.length;
            while ( i-- ) array.push(nodes[i]);
            return array;
        }

        mutations.forEach(function(mutation) {
            pushNodes(nodes.added, mutation.addedNodes);
            pushNodes(nodes.removed, mutation.removedNodes);
            if ( mutation.type == 'attributes' ) {
                var attr = mutation.attributeName;
                (nodes.attrs[attr] = nodes.attrs[attr] || []).push({
                    value     : mutation.target.getAttribute(attr),
                    namespace : mutation.attributeNamespace,
                    oldValue  : mutation.oldValue
                });
            }
        });

        if ( _.isFunction(options.condition) ) {
            nodes.added = _.filter(nodes.added, options.condition);
            nodes.removed = _.filter(nodes.removed, options.condition);
            nodes.attrs = _.transform(nodes.attrs, function(attrs, arr, attr) {
                attrs[attr] = _.filter(arr, options.condition);
            }, {});
        }
        return nodes;
    }.try({
        added   : [],
        removed : [],
        attrs   : {}
    });

    Function.prototype.define({
        mutator : function(node, options) {
            var handler = this.try(null);
            return function() {
                options = options || {};
                node.observers = node.observers || new Stacker(_.isObserver, function(observer) {
                        return observer ? observer.disconnect() : null;
                    });
                var observer = node.observers.reg(new MutationObserver(function(mutations) {
                    (options.pause ? $.Trial().setTimeout(options.pause) : already).done(function() {
                        handler(parse(mutations, options));
                    });
                }));
                options.until ? options.until.always(function() {
                    observer.disconnect();
                }) : null;
                observer.observe(node, options);
            };
        }.wrapper()
    });

};

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.define({

    onChildMutation : function(handler, options) {
        return this.each(function() {
            (function(nodes) {
                handler(nodes.added, nodes.removed);
            }.mutator(this, _.assign({
                childList : true
            }, options)))();
        });
    }.try(),

    onAttrMutation : function(handler, options) {
        return this.each(function() {
            (function(nodes) {
                handler(nodes.attrs);
            }.mutator(this, _.assign({
                subtree    : false,
                attributes : true
            }, options)))()
        });
    }.try(),

    // -----------------------------------------------------------------------------------------------------------------

    onAppearance : function(selector, options) {
        var trial = $.Trial(), node = this.find(selector);
        return node.length ? trial.resolve(node) : this.onChildMutation(function(nodes) {
            (nodes = $(nodes).find(selector).add($(nodes).filter(selector))).length ? trial.resolve(nodes) : null;
        }, _.assign({
            subtree    : true,
            attributes : false,
            until      : trial
        }, options || {})) && 0 || trial;
    }.try(never),

    onChildAppearance : function(selector, options) {
        return this.onAppearance(selector, _.assign(options || {}, {
            childList : true,
            subtree   : false
        }));
    }.try(never),

    // -----------------------------------------------------------------------------------------------------------------

    disconnect : function() {
        var node = this.elem();
        node && node.observers && node.observers.reset();
        return this;
    }.try()

});

