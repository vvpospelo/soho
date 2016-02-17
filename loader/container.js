function Container(filter) {
    Container.superclass.constructor.apply(this, arguments);

    var self = this, context = null;

    self.VKID = self.VKID || window.vk.id;

    function tryVKID(card) {
        return context.cardVKID(card);
    }

    // -----------------------------------------------------------------------------------------------------------------

    self.ready = function() {
        self.VKID = DOM.locationLink.tryVKID() || self.VKID;
        return filter.init().then(function() {
            ((context = DOM.container.data()) ? already : never).done(function() {
                if ( context.editable ) {

                    //new function ContainerBar() {
                    //    console.log(0);
                    //    var counterbar = $('<div id="container_bar"></div>').insertBefore(DOM.counterbar).counterbar('create'),
                    //        position   = $('<p class="base"></p>'), summary = $('<sup></sup>');
                    //    var counter = new Counter(position, summary);
                    //    self.counterbar = counter.counterbar;
                    //    self.show = function(value) {
                    //        position.text(value);
                    //        summary.text(self.visible().length);
                    //    };
                    //};

                    DOM.content.mousewheel(function(event, delta) {
                        var source = $(event.target).closest(context.card, this);
                        if ( source.is(context.card) ) {
                            var cards = self.visible(),
                                index = cards.index(source),
                                where = (delta < 0) ? Math.min(index + 1, cards.length - 1) : Math.max(index - 1, 0);
                            if ( where != index ) {
                                DOM.cancelDefault(event);
                                var target = $(cards.get(where)),
                                    ava    = target.cardAva().selfFirst('img'),
                                    shift  = ava.offset().top + ava.height() * 0.67 - event.pageY;
                                DOM.scrollTop((shift > 0) ? ('+=' + shift) : ('-=' + -shift));

                            }
                        }
                    }.try(null));

                }
            });
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.more = function() {
        return $(context.more).filter(':visible');
    }.try($());

    self.cards = function(subset) {
        return _.isJQuery(subset) ? subset.selfFind(context.card) : DOM.container.find(context.card);
    }.try($());

    self.visible = function(subset) {
        return self.cards(subset).filter(':visible');
    }.try($());

    // -----------------------------------------------------------------------------------------------------------------

    self.summary = function(value) {
        if ( _.is(context.summary) ) {
            if ( _.no(value) ) {
                return API.tryNumber($(context.summary)) || 0;
            } else {
                $(context.summary).html(value);
            }
        }
        return value;
    }.try(0);

    self.fixSummary = function() {
        var total  = self.summary(),
            length = self.visible().length;
        if ( total != length ) {
            var summary = $(context.summary);
            summary.text(summary.selfText().replace(/([\d])/, String(length).numeral() + ' : $1'));
            $('#top_back_link').instead('span', '<span> [' + String(length).numeral() + '] </span>');
        }
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    self.idle = function() {
        self.more().remove();
        DOM.dataset.interruptible = true;
        DOM.vkClearCache([window, document]);
        return DOM.idleObject.apply(null, Array.from(arguments));
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    function listener(handler, options) {
        if ( _.isFunction(handler) && (handler = handler.try(null)) ) {
            DOM.container.onChildMutation(function(addedNodes, removedNodes) {
                handler(addedNodes, removedNodes);
            }, _.assign(options = options || {}, {
                condition : function(node) {
                    return node.nodeType == 1;
                }
            }));
            if ( !options.quiet ) {
                handler(_.map(DOM.container.children()), []);
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------------------

    self.remarker = function(marker) {
        if ( _.isFunction(marker) ) {
            var point = 0;
            return self.ready().done(function() {
                listener(function(addedNodes, removedNodes) {
                    if ( addedNodes.length <= removedNodes.length ) {
                        point = 0;
                    }
                    self.cards($(addedNodes)).each(function() {
                        marker($(this), ++point);
                    });
                });
            });
        }
        return already;
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.scrollMore = function(duration) {
        var more = self.more();
        return !more.is(':visible') ? already : DOM.scrollTop(more.offset().top - DOM.window.height(), duration).then(function() {
            return more.fire('click');
        });
    }.try(never);

    self.scrollAll = function(pause) {
        var trial = $.Trial();
        listener(function() {
            self.scrollMore(TIME.fast).done(function() {
                !self.more().is(':visible') ? trial.resolve() : null;
            });
        }, {
            subtree    : true,
            attributes : true,
            pause      : pause || TIME.pause,
            until      : trial
        });
        return trial.pass(function() {
            return DOM.scrollTop(0, TIME.fast);
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.seekCard = function(VKID, pause, limit) {
        var card = null, total = 0, trial = $.Trial();
        listener(function(addedNodes) {
            total += self.cards($(addedNodes)).each(function(i, node) {
                if ( tryVKID(node = $(node)) == VKID ) {
                    card = node;
                    return false;
                }
                return true;
            }).length;
            if ( _.is(card) ) {
                trial.resolve(card);
            } else {
                if ( total ) {
                    if ( !self.more().is(':visible') ) {
                        trial.reject('missed');
                    } else {
                        if ( total >= (limit || 0) ) {
                            trial.reject('bottom');
                        } else {
                            self.scrollMore(TIME.fast);
                        }
                    }
                } else {
                    trial.reject('empty');
                }
            }
        }, {
            subtree    : true,
            attributes : true,
            pause      : pause || TIME.pause,
            until      : trial
        });
        return trial.pass(function() {
            return DOM.scrollTop(0, TIME.fast);
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.switch = function(params, pause) {
        var trial = $.Trial();
        listener(trial.resolve, {
            quiet : true,
            pause : pause || TIME.pause,
            until : trial
        });
        return filter.switch(params).then(trial.self);
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.collect = function(params, pause) {
        return self.switch(params, pause).then(function() {
            return self.scrollAll().then(function() {
                var VKIDs = {};
                self.visible().each(function() {
                    VKIDs[tryVKID($(this))] = true;
                });
                return VKIDs;
            });
        });
    }.try(never);

    self.every = function(handler) {
        return self.scrollAll().then(function() {
            return self.visible().each(function() {
                var card = $(this);
                return handler(card, tryVKID(card));
            });
        });
    }.try(never);

    self.test = function(test, tune, index) {
        tune = tune || {};
        index = index || 0;

        tune.iter = tune.iter || 99999999;
        tune.imax = tune.imax || 99999999;

        index = (index >= tune.imax) ? 0 : index;
        var cards = self.cards(),
            card  = $(cards.elem(index = (index >= cards.length) ? 0 : index));

        (!card.is(':visible') ? already :
         (tune.scroll === false ? already : // scroll memory leak !!!
          DOM.scrollTop(card.offset().top - DOM.container.offset().top, TIME.fast)).then(function() {
             return test(card);
         })
        ).always(function() {
            self.delay(TIME.guarant).done(function() {
                tune.iter-- > 0 ? self.test(test, tune, ++index) : null;
            });
        });
    }.try(null);

}

