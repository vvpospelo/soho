var $ = jQuery.noConflict();

jQuery.prototype.checkBox = function(set) {
    set       = set || {};
    var boxes = this.selfFind('.chkbox');
    if ( boxes.length > 1 ) {
        return Array.from(boxes).map(box => $(box).checkBox(set));
    } else {
        return (function CheckBox(self) {
            var create = self.addClass('chkbox').is(':empty'), id = create && _.uniqueId('chkbox'),
                chkbox = create && $('<input type="checkbox" id="' + id + '"/>').appendTo(self) || self.children('input'),
                label  = create && $('<label for="' + id + '"></label>').appendTo(self) || self.children('label');

            // --- Tags ------------------------------------------------------------------------------------------------

            function tagChange() {
                label.text((label.data('tags') || ['', ''])[chkbox.prop('checked') && 1 || 0]);
            }

            create && chkbox.change(tagChange);

            self.tags = function(tags) {
                _.isArray(tags) && label.data('tags', tags) && tagChange();
            };

            // ---------------------------------------------------------------------------------------------------------

            self.onchange = function(onchange) {
                chkbox.change(function(event) {
                    onchange(event, self, chkbox);
                });
            };

            self.name = function(name) {
                return _.ifJQuery(name = jQuery.prototype.attr.apply(chkbox, ['name'].concat(Array.from(arguments)))) && self || name;
            };

            self.checked = function(checked) {
                return _.ifJQuery(checked = jQuery.prototype.prop.apply(chkbox, ['checked'].concat(Array.from(arguments)))) && chkbox.change() && self || checked;
            };

            self.freeze = function(frozen) {
                return self[frozen == false && 'removeClass' || 'addClass']('frozen') && 0 || self;
            };

            return _.map(set, (value, key) => self[key](value)) && self;
        })(this);
    }
}.try(never).argObj(true);
