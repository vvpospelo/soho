API.tryActionVKID = function(link) {
    var info = API.parseAlbumURL(link);
    if ( !info.VKID ) {
        var url  = LNK.parse(link, true),
            file = /^(write|photos|videos|audios|gifts|albums|tag|wall)(-?\d+|)$/i.exec(url.file) || [];
        if ( file[1] ) {
            return API.ifVKID(file[2]) || window.vk.id;
        }
        if ( /^(friends|groups|fave|fans|photos|video|audio|im|mail)(\.php|)$/i.test(url.file) ) {
            return url.search ? _.find(_.pick(url.query, ['id', 'mid', 'sel', 'from_id']), API.isVKID) : window.vk.id;
        }
    }
    return info.VKID;
}.try(null);

jQuery.prototype.tryActionVKID = function() {
    return this.actionVKID() || this.actionVKID(API.tryActionVKID(this.ref()));
}.try(null);

