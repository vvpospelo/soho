function mixinVisual() {
    if ( !_.visual ) {
        mixinLodash();

        // --- Own Visual Prototypes ---------------------------------------------------------------------------------------

        String.prototype.define({
            visual : function(tune) {
                var quotes = (tune || {}).quotes || "''";
                return quotes[0] + this + quotes[1];
            }
        });

        Node.prototype.define({
            visual : function(tune, depth) {
                try {
                    var data = $.data(this) || {};
                    return _.unescape(this.outerHTML) + STR.normEOL(_.size(data) ? '.data(' + _.visual(data, tune, depth) + ')' : '');
                } catch ( e ) {
                    _.log(e.stack);
                }
                return '';
            }
        });

        jQuery.prototype.define({
            reverse : [].reverse,
            visual  : function(tune, depth) {
                try {
                    var node = this.elem();
                    if ( node ) {
                        var data = $.data(node) || {};
                        return "$('" + _.unescape(node.outerHTML) + "')" + STR.normEOL(_.size(data) ? '.data(' + _.visual(data, tune, depth) + ')' : '');
                    }
                } catch ( e ) {
                    _.log(e.stack);
                }
                return '';
            }
        });

        window.visual = function() {
            return 'window';
        };

        // --- Design Tools ------------------------------------------------------------------------------------------------

        String.prototype.define({

            numeral : function() {
                return this.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
            },

            shift : function(space) {
                return (space = space || 4) && this.replace(/(^.*$)/gim, (_.isNumber(space) ? _.repeat(' ', space) : space) + '$1');
            }

        });

        // --- Objects visual ----------------------------------------------------------------------------------------------

        _.mixin({

            numeral : function(obj) {
                return _.transform(obj, function(obj, value, key) {
                    obj[key] = _.isNumeric(value) ? String(value).numeral() : value;
                });
            },

            visual : function(obj, tune, depth) {
                try {
                    tune = tune || {};
                    tune.depth = tune.depth || 7;
                    tune.comma = tune.comma || ',';

                    function brackets(str, br) {
                        return br[0] + str + br[1];
                    }

                    function eol(str, eoline) {
                        return str.length && (eoline ? ('\n' + str + '\n') : (' ' + str.trimLeft() + ' ')) || ' ';
                    }

                    if ( (depth = (depth || 0) + 1) <= tune.depth ) {
                        if ( _.is(obj) ) {
                            if ( _.isFunction(obj) ) {
                                return obj.toString();
                            } else {
                                if ( _.isFunction(obj.visual) ) {
                                    return obj.visual(tune, depth);
                                } else {
                                    if ( _.isArrayLikeObject(obj) ) {
                                        return brackets(eol(_.transform(obj, function(map, value) {
                                            map.push(String(_.visual(value, tune, depth)).shift(tune.space));
                                        }, []).join(tune.comma + '\n'), tune.eoline || (_.size(obj) > 1)), tune.brackets || '[]');
                                    } else {
                                        if ( _.isPlain(obj) ) {
                                            var spaces = _.maxBy(_.keys(obj), key => key.length).length || 0;
                                            return brackets(eol(_.transform(obj, function(map, value, key) {
                                                map.push((_.padEnd(key, spaces) + ' : ' + String(_.visual(value, tune, depth))).shift(tune.space));
                                            }, []).join(tune.comma + '\n'), tune.eoline || (_.size(obj) > 1)), tune.brackets || '{}');
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch ( e ) {
                    _.log(e.stack);
                }
                return obj;
            }

        });

    }

}

