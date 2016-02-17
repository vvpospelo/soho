function Viewed() {
    Viewed.superclass.constructor.apply(this, arguments);
    var self = this;

    //self.log = function(storage) {
    //    return (storage = storage || localStorage) &&
    //        '{\r\n' + _.keys(storage).map(VKID => '\t' + VKID + ':' + storage[VKID]).join(',\r\n') + '\r\n};';
    //};
    //
    //self.saveAs = function(storage) {
    //    saveAs(new Blob(['INI.archive = ' + self.log(storage)], {
    //        type : "text/plain"
    //    }), "vk.storage.js");
    //};

    // -----------------------------------------------------------------------------------------------------------------

    //self.store = function(obj) {
    //    return self.set(_.deepGrep(obj, function(time) {
    //        return time || _.now();
    //    }));
    //}.argObj();

    // -----------------------------------------------------------------------------------------------------------------

    //[INI.hiddenList, INI.ignoredList, INI.noFriendList, INI.viewedList].map(list => list && self.store(list)); // force INI lists
    //
    //_.size(INI.archive) ? (function importStorage(archive) { // auto import localStroage
    //    _.keys(archive).map(VKID => !localStorage.getItem(VKID) ? localStorage.setItem(VKID, archive[VKID]) : false);
    //})(INI.archive) : null;


    // -----------------------------------------------------------------------------------------------------------------

    //localStorage.length - _.size(INI.archive) > 49 ? self.saveAs() : null;

    //1 ? (function exportStorage() { // export localStroage to FS
    //    (localStorage.length ? FILES.save('INI.archive', localStorage) : $.Trial().resolve()).done(function() {
    //        FILES.read('INI.archive').done(function(archive) {
    //            //console.log(self.log(archive));
    //        });
    //    });
    //})() : null;

}

