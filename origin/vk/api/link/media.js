API.pickSRC = function(photo, dim, sizes) {
    function pick(size_, src) {
        return photo[size_ + 'src'] || (src = photo[size_]) && (src = LNK.parse(src[0])) &&
            (photo[size_ + 'src'] = (src.hostname ? src.fullname : photo.base + src.fullname) + (src.extension ? '' : '.jpg'));
    }

    var dimWidth  = dim ? dim.width : 0,
        dimHeight = dim ? dim.height : 0,
        dimSRC    = [null, 0, 0],
        ordSRC    = null;

    for ( var i = 0; i < sizes.length; i++ ) {
        var size_ = sizes[i],
            arr   = photo[size_],
            src   = pick(size_);
        if ( src ) {

            // ---------------------------------------------------------------------------------------------------------

            !ordSRC ? ordSRC = src : null;
            if ( !dim && ordSRC )
                return ordSRC;

            // ---------------------------------------------------------------------------------------------------------

            !arr ? photo[size_] = arr = [src] : arr[0] = src;

            var width  = arr[1] || 0,
                height = arr[2] || 0;

            if ( dimSRC[1] < width ) {
                dimSRC[1] < dimWidth || dimSRC[2] < dimHeight ? dimSRC = arr : null;
            } else {
                width >= dimWidth && height >= dimHeight ? dimSRC = arr : null;
            }

        }
    }
    return dimSRC[0] || ordSRC;
}.try(null);

// --------- w_src [2560] > z_src [1280] > y_src [807] > x_src [604] (regular) > r_src > q_src > p_src > o_src ---------

API.hintSRC = function(photo, dim) {
    return photo ? (photo.hintSRC = photo.hintSRC || API.pickSRC(photo, dim, ['w_', 'z_', 'y_', 'x_', 'r_', 'q_', 'p_', 'o_'])) : null;
}.try(null);

API.avatarSRC = function(photo, dim) {
    return photo ? (photo.avatarSRC = photo.avatarSRC || API.pickSRC(photo, dim, ['z_', 'w_', 'y_', 'x_', 'r_', 'q_', 'p_', 'o_'])) : null;
}.try(null);

API.previewSRC = function(photo, dim) {
    return photo ? (photo.previewSRC = photo.previewSRC || API.pickSRC(photo, dim, ['x_', 'r_', 'y_', 'z_', 'w_', 'q_', 'p_', 'o_'])) : null;
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

API.isVoidAlbum = function(name, desc) {
    return desc && INI.voidDesc.test(desc) || name && INI.voidDesc.test(name) || name && INI.voidAlbums.test(name);
}.try(false);

API.parseAlbumURL = function(url) {
    var info = {}, parts = [];
    if ( _.isString(url) ) {
        url = LNK.parse(url).file;
        parts = (/^album(-?\d+)_(\d+)$/.exec(url) || [2]);
        if ( parts[2] ) {
            info.VKID = parts[1];
            info.albumID = parts[2];
        } else {
            parts = (/^wall(-?\d+)_(\d+)$/.exec(url) || [2]);
            if ( parts[2] ) {
                info.VKID = parts[1];
                info.albumID = '00';
            } else {
                parts = (/^tag(-?\d+)$/.exec(url) || [1]);
                if ( parts[1] ) {
                    info.VKID = parts[1];
                    info.albumID = 'tag';
                } else {
                    parts = (/^(photos|videos)(-?\d+)$/.exec(url) || []);
                    if ( parts[2] ) {
                        info.VKID = parts[2];
                    }
                }
            }
        }
        if ( info.VKID ) {
            info.albumURL = url;
        }
    }
    return info;
}.try({});

// ---------------------------------------------------------------------------------------------------------------------

API.parseMediaURL = function(url) {
    var info = {};
    if ( _.isString(url) ) {
        url = LNK.parse(url).file;
        var parts = (/^(photo|video)?(-?\d+)(_\d+)$/.exec(url) || []);
        return {
            role : 'media',
            type : parts[1],
            VKID : parts[2],
            id   : parts[2] + parts[3]
        };
    }
    return info;
}.try({});

jQuery.prototype.urlMediaVKID = function() {
    var url = this.ref(), info = API.parseMediaURL(url);
    if ( info.VKID ) {
        this.data(info);
    }
    return info.VKID;
}.try(null);

jQuery.prototype.tryMediaVKID = function() {
    return this.mediaVKID() || this.mediaVKID(this.keepEventsVKID()) || this.mediaVKID(this.urlMediaVKID());
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

API.extendMedia = function(mediaURL, albumURL) {
    return _.assign(API.parseMediaURL(mediaURL), API.parseAlbumURL(albumURL));
}.try({});
