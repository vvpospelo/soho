function Albums(loader) {

    var self   = this,
        albums = {};

    self.reset = function() {
        albums = {};
    }.try(null);

    self.count = function() {
        return _.size(albums);
    }.try(0);

    // -----------------------------------------------------------------------------------------------------------------

    self.isStandart = function(albumID) {
        return _.ifString(albumID) ? ((albumID == 'tag') || (_.ifNumeric(albumID) == 0)) : null;
    }.try(false);

    self.class = function(albumID) {
        return _.ifString(albumID) ? (albumID + ' album' + (albums[albumID] || (albums[albumID] = _.size(albums) + 1))) : '';
    }.try('');

    // -----------------------------------------------------------------------------------------------------------------

    var albumTiming = new Timing(function(task) {
        return loader.ajax.post('albums' + task.VKID, {
            al     : 1,
            offset : task.offset,
            part   : task.part
        });
    }, 1099);

    loader.addBuffer(albumTiming);

    // -----------------------------------------------------------------------------------------------------------------

    var albumToLink = function(album) {
        function isShown(album) {
            var empty = album.find('a').is('.no_photo'),
                name  = (album.find('.ge_photos_album').text() || '').toLowerCase(),
                desc  = (album.find('.description').text() || '').toLowerCase();
            return !empty && !API.isVoidAlbum(name, desc);
        }

        if ( isShown(album = $(album)) ) {
            var link = album.find('.img_link'), img = link.children('img').remove();
            return link.removeAttr(DOM.events.onmouse + ' ' + DOM.events.ontouch).addClass('album')
                .dataset('src', img.lockedAttr('src')).attr('id', album.attr('id')).outerHTML().unlockLinks()
        }
        return '';
    }.try('');

    self.load = function() {
        return albumTiming.append({
            VKID   : loader.VKID,
            offset : 0
        }).then(function(response) {
            var page    = XHR.lQuery(response),
                summary = API.tryNumber(page.find('div.summary'));
            page.find('#photos_albums_container').find('.photo_row').each(function(index, album) {
                DOM.albums.append(albumToLink(album));
            });
            return summary > 6 ? loadAlbumsTail(0) : already;
        });
    }.try(never);

    var loadAlbumsTail = function(offset) {
        return albumTiming.append({
            VKID   : loader.VKID,
            offset : offset,
            part   : 1
        }).then(function(response) {
            var albums = XHR.lQuery(response);
            albums.each(function(index, album) {
                !DOM.albums.children('#' + album.id).length ? DOM.albums.append(albumToLink(album)) : null;
            });
            return albums.length ? loadAlbumsTail(offset + albums.length) : already;
        });
    }.try(never);

}
