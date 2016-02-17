function Recents() {
    Recents.superclass.constructor.apply(this, arguments);
    var self = this;

    function loadRecents(offset, trial) {
        return self.ajax.post('al_im.php', {
                act    : 'a_get_dialogs',
                al     : 1,
                offset : offset = offset || 0
            }).done(function(data) {
                self.set(_.transform(parser.parseRecents(data), function(recents, recent) {
                    recents[recent.VKID] = recent;
                }, {})).done(function(header) {
                    (header = XHR.extractJSON(data) || {}) && header.has_more && offset <= INI.recentsLimit &&
                    setTimeout(loadRecents, 49, header.offset, trial) || trial.resolve(_.keys(self.pick()));
                });
            }) && (trial = trial || $.Deferred());
    }

    LNK.tryPilot().always(function () {
        loadRecents().done(function() {
            //console.log(self.history());
        }/*dialogs.refresh*/);
    });

}

