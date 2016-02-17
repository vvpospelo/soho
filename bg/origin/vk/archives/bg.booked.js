function Booked() {
    Booked.superclass.constructor.apply(this, arguments);
    var self = this;

    function loadBooked() {
        return self.ajax.post('fave', {
            section : 'users'
        }).then(function(data) {
            return self.clear().then(function() {
                return self.set(parser.parseBooked(data));
            });
        });
    }

    var reloadBooked = loadBooked.defer(9000);

    loadBooked().done(function() {
        //console.log(self.boolean());
    });

    // -----------------------------------------------------------------------------------------------------------------

    self.book = function(obj) {
        self.set(obj) && reloadBooked();
        return already;
    };

}

