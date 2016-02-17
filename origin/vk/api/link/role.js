Node.prototype.roleVKID = function(role, VKID) {
    if ( VKID ) {
        this.dataset.vkid = VKID;
        this.dataset.role = role;
        return VKID;
    } else {
        var info = this.dataset;
        return !role ? info.vkid : ((info.role == role) ? info.vkid : null);
    }
};

Node.prototype.mediaVKID = function(VKID) {
    return this.roleVKID('media', API.ifVKID(VKID));
};

Node.prototype.actionVKID = function(VKID) {
    return this.roleVKID('action', API.ifVKID(VKID));
};

Node.prototype.pageVKID = function(VKID) {
    return this.roleVKID('page', VKID);
};

Node.prototype.cardVKID = function(VKID) {
    return this.roleVKID('card', VKID);
};

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.roleVKID = function(role, VKID) {
    return this.elem().roleVKID(role, VKID);
}.try(null);

jQuery.prototype.mediaVKID = function(VKID) {
    return this.roleVKID('media', API.ifVKID(VKID));
}.try(null);

jQuery.prototype.actionVKID = function(VKID) {
    return this.roleVKID('action', API.ifVKID(VKID));
}.try(null);

jQuery.prototype.pageVKID = function(VKID) {
    return this.roleVKID('page', VKID);
}.try(null);

jQuery.prototype.cardVKID = function(VKID) {
    return this.roleVKID('card', VKID);
}.try(null);

jQuery.prototype.tryVKID = function() {
    return _.find(_.pick(this.data(), ['VKID', 'vkid']), API.isVKID) ||
        LNK.origin(this.ref()) == 'vk' && (this.tryMediaVKID() || this.tryActionVKID() || this.tryPageID());
}.try(null);

// -------------------------------------------------------------------------------------------------

API.isPageID = function(url) {
    return /^[\w\.]{1,99}$/.test(url) && // users || groups || communities
        (LNK.noPageFile.indexOf(url) < 0);
};

API.tryPageID = function(url) {
    return API.isPageID(url = LNK.parse(url).file) ? -((/^(public|club)(\d+)$/.exec(url) || [])[2] || 0) || (/^id(\d+)$/.exec(url) || [])[1] || url : null;
};

jQuery.prototype.tryPageID = function() {
    return this.pageVKID() || this.pageVKID(API.tryPageID(this.ref()));
}.try(null);

