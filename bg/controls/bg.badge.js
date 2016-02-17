new function Badge() {

    chrome.browserAction.setBadgeBackgroundColor({
        color : '#4E729A'
    });

    //chrome.browserAction.onClicked.addListener(function() {
    //    store.saveAs();
    //});

    var t = 0;

    //chromeStorage.wipe().done(function() {

        //chromeStorage.onChanged(function show() {
        //
        //    console.log(t++, arguments);
        //
        //    chromeStorage.length(null).done(function(bytes) {
        //
        //        chrome.browserAction.setBadgeText({
        //            text : String(bytes)
        //        });
        //        var count = _.assign({
        //            //friends : friends.count(),
        //            //recents : recents.count(),
        //            //dialogs : dialogs.count(),
        //            //booked  : booked.count(),
        //            //viewed  : viewed.count(),
        //            //errors  : chromeStorage.errors().length,
        //            storage : bytes
        //        });
        //
        //        chrome.browserAction.setTitle({
        //            title : _.map(count, (value, param) => param + '\t' + String(value).numeral()).join('\r\n')
        //        });
        //
        //    });
        //});
    //});

};

