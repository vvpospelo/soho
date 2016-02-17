API.ACT = {

    showPhoto : function(mediaURL, albumURL, hintData) {
        return _.assign(API.extendMedia(mediaURL, albumURL), (hintData || {}).temp || {}, {
            role : 'media',
            type : 'photo'
        });
    }.try(null),

    showVideo : function(mediaURL) {
        return API.extendMedia(mediaURL, {
            role : 'media',
            type : 'video'
        });
    }.try({}),

    showInlineVideo : function(mediaURL) {
        return API.extendMedia(mediaURL, {
            role : 'media',
            type : 'video'
        });
    }.try({}),

    parse : function(event) {
        return {
            name : (event = /([\.\w]+)\s*\([^\)\(]*\)/.exec(event || '') || [])[1] || '',
            body : event[0] || ''
        };
    }.try({}),

    essential : function essential(event) {
        return (event = API.ACT.parse(event)) && event.name && API.ACT[event.name] ? _.unescape(event.body) : null;
    },

    inTab : function(event) {
        return ['showPhoto', 'showVideo', 'selectGift', 'showGift', 'showGiftBox', 'fansBox', 'loadHistory'].indexOf(API.ACT.parse(event).name) >= 0;
    }

};

API.parseAction = function(action) {
    var info = {};
    try {
        _.assign(info, eval('(function (event) { return (API.ACT.' + (API.ACT.essential(action) || '').replace('(', ' || function () {})(') + ';})(null);'));
    } catch ( e ) { }
    return info;
}.try({});

jQuery.prototype.keepEventsVKID = function() {
    var self = this;
    HTML.extractAttrs(this.elem().outerHTML || '', DOM.events.onmouse).forEach(action => self.data(API.parseAction(action)));
    return self.data().VKID;
}.try(null);

