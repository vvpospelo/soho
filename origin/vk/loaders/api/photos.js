function Photos(loader, albums) {

    var self   = this,
        photos = {};

    self.reset = function() {
        photos = {};
    }.try(null);

    self.count = function() {
        return _.size(photos);
    }.try(0);

    // -----------------------------------------------------------------------------------------------------------------

    var extend = function(photo) {
        if ( photo && photo.id ) {
            if ( photo.album ) {
                var album = new sQuery(photo.album).child();
                album.isBlank() ? photo.albumName = photo.album : _.assign(photo, API.extendMedia(photo.id, album.attr('href')), {
                    albumName : album.text()
                });
            }
            if ( !API.isVoidAlbum(photo.albumName, photo.desc) ) {
                photo.time = DATE.parse(photo.date);
                photo.VKID = loader.VKID;
                photo.role = 'media';
                return true;
            }
        }
        return false;
    }.try(false);

    var cache = function(JSON, photoHandler, length) {
        if ( JSON && JSON.length ) {
            length = Math.min(length || JSON.length, JSON.length);
            for ( var i = 0; i < length; i++ ) {
                if ( extend(JSON[i]) ) {
                    _.isFunction(photoHandler) ? photoHandler(JSON[i]) : null;
                }
            }
            return JSON.length;
        }
        return false;
    }.try(false);

    // -----------------------------------------------------------------------------------------------------------------

    var tryPhotos = function(list, photoHandler, offset, when) {
        return loader.ajax.post('al_photos.php', {
            act       : 'show',
            list      : list,
            offset    : offset = offset || 0,
            al        : 1,
            direction : 1,
            module    : 'profile'
        }).done(function(response) {
            var header = XHR.responseHeader(response);
            if ( header.volume ) {
                offset += cache(XHR.extractJSON(response) || [], photoHandler, header.volume - offset);
                offset < header.volume ? tryPhotos(list, photoHandler, offset, when) : when && when();
            }
        });
    }.try(never);

    var tryWall = function(VKID, photoHandler, offset, when) {
        return loader.ajax.post('al_wall.php', {
            act      : 'get_wall',
            type     : 'own',
            offset   : offset = offset || 0,
            owner_id : VKID,
            al       : 1
        }).done(function(response) {
            var posts = parser.parsePosts(response);
            posts.forEach(post => cache(post, photoHandler));
            posts.length >= 10 ? tryWall(VKID, photoHandler, offset + 10, when) : when && when();
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    var setPhoto = function(photo, aPoint, pPoint) {
        if ( photo && photo.id ) {
            if ( aPoint ) {
                var avatar       = document.createElement('div');
                avatar.className = 'avatar';
                avatar.src       = API.avatarSRC;
                $.data(avatar, photo);
                aPoint.before(avatar);
            }
            if ( pPoint ) {
                var preview       = document.createElement('a');
                preview.className = 'preview ' + albums.class(photo.albumID);
                preview.href      = '/photo' + photo.id + ((photo.albumID == 'tag') ? '?tag=' + photo.VKID : '');
                preview.src       = [API.previewSRC, hinter.pickSRC];
                preview.mediaVKID(photo.VKID);
                $.data(preview, photo);
                pPoint.before(preview);
            }
            photos[photo.id] = true;
        }
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    self.load = function(avatarsPoint, previewPoint) {
        var VKID = loader.VKID;

        // 'photos' + VKID = *(со старницы _0) + *(альбомы _xxxxxx)
        // Другие = *(на стене _00) + *(сохраненные _000) + *(фотографии с _tag)

        function photoPoint(points, albumID) {
            return points[albums.isStandart(albumID) ? albumID : 'default'];
        }

        function aPoint(photo) {
            return DOM.avatars.ifVisible(photoPoint(avatarsPoint, photo.albumID));
        }

        function pPoint(photo) {
            return photoPoint(previewPoint, photo.albumID);
        }

        function timePoint(photo) {
            return previewPoint[photo.albumID].prevWhile(function(point) {
                return photo.time > (point.data('time') || TIME.future);
            });
        }

        return $.when(
            tryPhotos('album' + VKID + '_0/rev', function(photo) {
                photo.albumID = '0';
                setPhoto(photo, aPoint(photo), timePoint(photo));
            }),
            tryPhotos('photos' + VKID, function(photo) {
                if ( !albums.isStandart(photo.albumID) ) {
                    setPhoto(photo, aPoint(photo), pPoint(photo));
                }
            }),
            tryPhotos('album' + VKID + '_00/rev', function(photo) {
                photo.albumID = '00';
                setPhoto(photo, aPoint(photo), pPoint(photo));
            }, 0, function() {
                tryWall(VKID, function(photo) {
                    if ( !photos[photo.id] ) {
                        photo.albumID = '00';
                        setPhoto(photo, aPoint(photo), timePoint(photo));
                    }
                });
            })
        ).done(function() {
            if ( !DOM.block.is ) {
                tryPhotos('tag' + VKID, function(photo) {
                    photo.albumID = 'tag';
                    setPhoto(photo, aPoint(photo), pPoint(photo));
                });
                tryPhotos('album' + VKID + '_000/rev', function(photo) {
                    photo.albumID = '000';
                    setPhoto(photo, aPoint(photo), pPoint(photo));
                });
            }
        });
    }.try(never);

}
