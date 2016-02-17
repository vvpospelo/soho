function Friends() {
    Friends.superclass.constructor.apply(this, arguments);
    var self = this;

    self.load = function(VKID) {
        return self.ajax.post('al_friends.php', {
            act : 'load_friends_silent',
            al  : 1,
            gid : 0,
            id  : VKID
        }).then(function(data) {
            return parser.parseRelatives(data);
        });
    }.try(never);

    self.related = function(VKID) {
        return self.load(VKID).then(function(friends) {
            return {
                univers  : friends.univers,
                mention  : friends.mention,
                sexratio : Math.round(_.size(friends.males) / _.size(friends.list) * 100),
                // -------------------------------------------------------------------------------------------------
                common   : self.pick(friends.list),
                booked   : _.grep(booked.pick(friends.list), function(friend, VKID) {
                    return !self.get(VKID);
                }),
                recents  : _.grep(recents.pick(friends.list), function(friend, VKID) {
                    return !self.get(VKID) && !booked.get(VKID);
                })
            };
        });
    }.try(never);

    self.load().done(function(friends) {
        self.set(friends.list);
    });

}

