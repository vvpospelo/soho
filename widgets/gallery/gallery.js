jQuery.prototype.gallery = function(set) {

    set = set || {};

    var self      = this,
        container = self.elem(),
        dataset   = container.dataset;

    _.is(set.priority) ? dataset.priority = set.priority : null;
    _.is(set.capacity) ? dataset.capacity = set.capacity : null;
    _.is(set.attempts) ? dataset.attempts = set.attempts : null;

    _.isJQuery(set.counterbar) && _.isFunction(self.counter) && set.counterbar.counterbar({
        counter : self.counter()
    });

    // -----------------------------------------------------------------------------------------------------------------

    return (function() {

        return (!dataset.priority || dataset.gallery || !DOM.inPage(container)) ? already : (function() {
            dataset.gallery = true;

            // --- Resize ----------------------------------------------------------------------------------------------

            function resize() {
                (function fixGalleryStyle(cRole, cWidth, cHeight) {
                    function maxDim(total, minDim, col) {
                        if ( col > 0 ) {
                            var dim = total / col;
                            return ( dim < minDim ) ? maxDim(total, minDim, Math.round(total / dim) - 1) : dim;
                        }
                        return total;
                    }

                    var div   = $('<div></div>').addClass(cRole).appendTo(self.fixRect()),
                        width = dataset.width = maxDim(self.width() - DOM.scrollbar.width, cWidth.min, cWidth.col),
                        height = dataset.height = maxDim(self.height(), cHeight.min, cHeight.row);

                    INI.snapshot ? self.fixSnapmatrix({
                        width  : width,
                        height : height
                    }) : null;

                    DOM.addStyle('.' + cRole, {
                        width  : (width - div.getPropertyValue('border-left') - div.getPropertyValue('margin-left') -
                        div.getPropertyValue('border-right') - div.getPropertyValue('margin-right')) + 'px',
                        height : (height - -div.getPropertyValue('border-top') - div.getPropertyValue('margin-top') -
                        div.getPropertyValue('border-bottom') - div.getPropertyValue('margin-bottom')) + 'px'
                    });

                    div.remove();

                })(set.criteria.role, set.criteria.width, set.criteria.height);
            }

            set.criteria ? DOM.window.resize(resize) && 0 || resize() : null;

            // ---------------------------------------------------------------------------------------------------------

            let counter = new ImageCounter();

            self.define({
                counter : function() {
                    return counter;
                }
            });

            return new Imager(dataset, counter.progress).then(function(imager) {
                var overPoint = 0, addNodes = INI.snapshot ? function() {
                    var nodes = [];
                    if ( self.needSnapshot() ) {
                        Array.from(self.makeSnapshot()).filter(function(snap) {
                            return snap.node && !snap.node.queued;
                        }).forEach(function(snap) {
                            snap.node.queued = true;
                            nodes.push(snap.node);
                        });
                    }
                    imager.queuePhotos(nodes);
                }.try(null) : function() { // ----------------------------------------------------------------------
                    var nodes  = [],
                        childs = container.childNodes,
                        square = container.squareVertical();
                    for ( var i = overPoint = 0; i < childs.length; i++ ) {
                        var node = childs[i];
                        if ( node.offsetHeight ) {
                            if ( !node.queued ) {
                                var rect = node.offsetVertical();
                                if ( rect.top < square.bottom ) {
                                    if ( rect.bottom > square.top ) {
                                        node.queued = true;
                                        nodes.push(node);
                                    }
                                } else {
                                    overPoint = i;
                                    break;
                                }
                            }
                        }
                    }
                    imager.queuePhotos(nodes);
                }.try(null);

                // -----------------------------------------------------------------------------------------------------

                self.scroll(addNodes);
                self.onAttrMutation(addNodes);
                self.onChildMutation(function(addedNodes) {
                    if ( (addedNodes = DOM.skipSiblings(addedNodes).filter(node => node.offsetHeight)).length ) {
                        var bottom = container.squareBottom();
                        addedNodes.filter(node => overPoint ? Array.from(container.children).indexOf(node) < overPoint : node.offsetTop < bottom).length &&
                        addNodes.apply(null, arguments);
                    }
                }.try(null));

                // -----------------------------------------------------------------------------------------------------

                self.define({

                    ifVisible : function(node) {
                        var elem = node.elem();
                        if ( !elem.dataset.overflow ) {
                            var bottom = container.squareBottom();
                            elem.everyPrev(function(prev) {
                                if ( prev.offsetHeight ) {
                                    if ( prev.offsetTop >= bottom ) {
                                        prev.dataset.overflow = true;
                                        prev.everyNext(function(next) {
                                            next.dataset.overflow = true;
                                        });
                                    }
                                    return false;
                                }
                                return true;
                            });
                        }
                        return !elem.dataset.overflow ? node : null;
                    }.try(null),
                    reset     : function() {
                        return imager.reset().then(function() {
                            self.empty();
                        });
                    }.try(already)

                }).reset();

            });
        })();

    })().then(function() {
        set.top && self.attr('class', set.top == 'hide' ? '' : 'all').scrollTop(0);
        set.refresh && self.attr('refresh', _.random(11, 99));
        return self;
    });

}.try(never).argObj(true);
