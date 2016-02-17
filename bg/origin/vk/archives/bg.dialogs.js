function Dialogs() {
    Dialogs.superclass.constructor.apply(this, arguments);
    var self = this,
        name = _.instance(self);

    function loadHistory(VKID, reload, offset, trial, im) {
        return self.ajax.post('al_im.php', {
                peer   : VKID,
                act    : 'a_history',
                offset : offset = offset || 0,
                al     : 1,
                rev    : 0,
                whole  : 0
            }).done(function(data) {
                (function assign(dialogs, rows) {
                    var keys = _.keys(rows),
                        size = _.size(keys);
                    _.assign(im, rows);
                    if ( size && (reload || !_.size(_.pick(dialogs, keys))) ) {
                        setTimeout(loadHistory, 49, VKID, reload, offset + size, trial, im);
                    } else {
                        self.set(VKID, im).done(function() {
                            //console.log(im);
                            trial.resolve(VKID, im);
                        });
                    }
                })(self.get(VKID), parser.parseHistory(data));
            }) && (im = im || {}) && (trial = trial || $.Trial());
    }

    Dialogs.prototype.define({

        wrap : function(obj) {
            return _.transform(obj, function(items, value, VKID) {
                return API.isVKID(VKID) ? items[VKID] = {}.entry(name, JSON.stringify(value)) : null;
            }, {});
        }.try({}),

        unwrap : function(items) {
            return _.transform(items, function(obj, value, VKID) {
                return API.isVKID(VKID) ? obj[VKID] = JSON.parse(value[name]) : null;
            }, {});
        }.try({}),

        // -------------------------------------------------------------------------------------------------------------

        refresh : function(order, reload) {
            (function loadNextHistory(VKID) {
                API.isVKID(VKID) && loadHistory(VKID, reload).done(function(VKID, im) {
                    _.size(im) && order.length && loadNextHistory(order.shift(), reload);
                });
            })(order.shift());
        }.try(null),

        load : function(VKID) {
            return loadHistory(VKID).then(function(VKID, im) {
                return _.keys(im = self.get(VKID) || {}).sort((x, y) => y - x).slice(0, 15).map(id => im[id]).join('');
            });
        }.try(never)

    });

}

