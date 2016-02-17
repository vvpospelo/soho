function Viewer() {
    Viewer.superclass.constructor.apply(this, arguments);

    var self   = this,
        albums = new Albums(self),
        photos = new Photos(self, albums);

    // --- Resize ------------------------------------------------------------------------------------------------------

    function resize() {
        var left   = DOM.pageBody.width(),
            top    = DOM.header.outerHeight(true),
            width  = window.innerWidth - left,
            height = DOM.window.height() - top;

        DOM.viewer.css({
            left : left,
            top  : top
        });

        DOM.viewer.outerHeight(height);
        DOM.viewer.outerWidth(width);
    }

    DOM.window.resize(resize) && 0 || resize();

    // -----------------------------------------------------------------------------------------------------------------

    self.switchAlbum = function(event, link) {
        DOM.photos.gallery({
            top : 'hide'
        }).done(function(gallery) {
            gallery.addClass(albums.class(API.parseAlbumURL(link.attr('href')).albumID));
        });
    }.try(null);

    self.load = function(event, link) {
        self.VKID = link.VKID;

        var avatarsPoint = {};
        var previewPoint = {};

        return $.when(DOM.photos.gallery('top'), DOM.albums.gallery('top')).then(function() {
            ['0', '00', 'default', 'tag', '000'].forEach(function(album) {
                DOM.avatars.append(avatarsPoint[album] = $('<div class="gallery_point"></div>'));
                DOM.photos.append(previewPoint[album] = $('<div class="gallery_point"></div>'));
            });
            albums.load();
            return photos.load(avatarsPoint, previewPoint).then(function() {
                marker.storePaused(event, link);
                return albums.count();
            });
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    var reset = self.reset;
    (self.reset = function() {
        return reset().then(function() {
            return $.when.apply($, [DOM.avatars, DOM.albums, DOM.photos].map(gallery => gallery.reset && gallery.reset())).then(function() {
                [albums, photos].forEach(obj => obj.reset());
            });
        });
    }.try(already))();

}
