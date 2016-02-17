function Hinter() {
    Hinter.superclass.constructor.apply(this, arguments);

    var self = this;

    var hinter  = $('<div id="hinter"></div>').appendTo(DOM.html),
        tooltip = $('<div id="tooltip"></div>').appendTo(DOM.html);

    // --- Resize ------------------------------------------------------------------------------------------------------

    var dim = {}, limits = {};

    function resize() {
        _.assign(limits, {
            left   : 5,
            right  : DOM.window.width() - 5,
            top    : DOM.header.height() + 25,
            bottom : DOM.window.height() - 25
        });

        var CSS = {
            'max-width'  : (dim.width = (limits.right - limits.left) * 0.75) + 'px',
            'max-height' : (dim.height = (limits.bottom - limits.top) * 0.75) + 'px'
        };
        _.map(['tooltip', 'mail', 'img'], id => DOM.addStyle('#' + id, CSS));
    }

    DOM.window.resize(resize) && 0 || resize();

    // -----------------------------------------------------------------------------------------------------------------

    self.pickSRC = function(photo) {
        return API.hintSRC(photo, dim);
    };

    // --- Collision ---------------------------------------------------------------------------------------------------

    var flip = {}, cursor = DOM.cursor;

    self.noCollision = function(event) {
        if ( event && !event.isTrigger ) {

            var width, height,
                left, top;

            if ( !hinter.is(':empty') ) {

                width = hinter.width();
                height = hinter.height();

                left = cursor.left + ((flip.left > 0) ? flip.left : (flip.left - width));
                top = cursor.top + ((flip.top > 0) ? flip.top : (flip.top - height));

                if ( (left + width) > limits.right ) {
                    left = limits.right - width;
                }
                left = Math.max(limits.left, left);
                if ( (top + height) > limits.bottom ) {
                    top = limits.bottom - height;
                }
                top = Math.max(limits.top, top);

                hinter.css({
                    top  : top,
                    left : left
                });

            }

            if ( !tooltip.is(':empty') ) {

                width = tooltip.width();
                height = tooltip.height();

                left = cursor.left + ((flip.left <= 0) ? flip.left + 24 : (flip.left - width - 24));
                top = cursor.top + ((flip.top > 0) ? flip.top - 54 : (flip.top - height + 54));

                if ( (left + width) > limits.right ) {
                    left = limits.right - width;
                }
                left = Math.max(limits.left, left);
                if ( (top + height) > limits.bottom ) {
                    top = limits.bottom - height;
                }
                top = Math.max(limits.top, top);

                tooltip.css({
                    top  : top,
                    left : left
                });

            }
        }
    }.try(null);

    self.flip = function(event) {
        if ( event.target ) {
            var width  = Math.max(Math.min(event.target.clientWidth, 180), 90),
                height = Math.max(Math.min(event.target.clientHeight, 180), 90);
            flip = {
                left : (event.screenX < (DOM.window.width() / 2)) ? width : -width,
                top  : (event.screenY > 2 * (DOM.window.height() / 3)) ? -height : height
            }
        }
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    self.showMailHint = function(event, link) {
        if ( event && !event.isTrigger && (self.VKID = link.VKID) ) {
            if ( ['page', 'action', 'card'].indexOf(link.role) >= 0 ) {
                var mail = link.data('mail');

                function noCollision(mail) {
                    mail.find('tr').reverse().each(function(i, tr) {
                        if ( !DOM.isVisible(tr, false, mail.elem()) ) {
                            tr.style.display = 'none';
                        } else {
                            return false;
                        }
                        return true;
                    });
                }

                if ( mail ) {
                    hinter.html(mail);
                    noCollision(mail);
                    self.noCollision(event);
                }
            }
        }
        return self;
    }.try();

    // -----------------------------------------------------------------------------------------------------------------

    self.showPhoto = function(event, link) {
        if ( event && !event.isTrigger && (self.VKID = link.VKID) ) {
            if ( link.role == 'media' ) {
                marker.storeNow(event, link);
                var info = link.data() || {};
                if ( _.is(info.id) ) {
                    (function tryPhotoHint(photo) {
                        if ( photo.hintSRC = self.pickSRC(photo) ) {
                            self.Trial('photo', DOM.loadImage(photo.hintSRC, 3)).done(function(img) {
                                img.setAttribute('id', 'img');
                                hinter.append(img);
                                self.noCollision(event);
                            });
                        } else {
                            self.ajax.post('al_photos.php', {
                                act   : 'show',
                                al    : 1,
                                list  : photo.albumURL,
                                photo : photo.id
                            }).done(function(data) {
                                (XHR.extractJSON(data) || []).every(function(ph) {
                                    if ( photo.id == ph.id ) {
                                        photo.hintSRC = self.pickSRC(ph);
                                        return false;
                                    }
                                    return true;
                                });
                                photo.hintSRC = photo.hintSRC || link.src();
                                tryPhotoHint(photo);
                            });
                        }
                    })(info);
                }
            }
        }
        return self;
    }.try();

    // -----------------------------------------------------------------------------------------------------------------

    self.showTooltip = function(event, link) {
        if ( event && !event.isTrigger ) {
            function toTitle() {
                var text = _.filter(arguments, _.ifString).join('<br>');
                return text ? '<div class="pv_title">' + text + '</div>' : '';
            }

            function show(text) {
                tooltip.html(text);
                self.noCollision(event);
            }

            var text = link.data('tooltip');
            if ( text ) {
                show(XHR.isHTML(text) ? text : toTitle(text));
            } else {
                var title = link.attr('title');
                if ( title ) {
                    link.removeAttr('title');
                    link.data('tooltip', title);
                    show(toTitle(title));
                } else {
                    if ( link.role == 'media' ) {
                        var photo = link.data();
                        show(toTitle(photo.date, photo.albumName) + toTitle(photo.desc, photo.place) + (photo.comments || ''));
                    }
                }
            }

        }
        return self;
    }.try();

    // -----------------------------------------------------------------------------------------------------------------

    var reset = self.reset;
    (self.reset = function() {
        return reset().then(function() {
            return [hinter, tooltip].forEach(container => container.empty());
        });
    }.try(already))();

}
