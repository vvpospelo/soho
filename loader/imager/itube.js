'use strict';

function ImageTube(set) {

    var settings = {},
        self     = this,
        queue    = new Queue(),
        inload   = new Queue();

    queue.rule(function() {
        return inload.length() < settings.capacity;
    });

    self.define({

        set       : function(set) {
            return _.assign(settings, set);
        },
        reg       : function(queues, priority) {
            _.forOwn(queues, function(q, role) {
                role == 'queue' ? queue.subQueue(q, priority) :
                role == 'inload' ? inload.subQueue(q, priority) : null;
            });
        },
        nextWhile : function(photo) {
            while ( photo = queue.shift() ) {
                photo.load();
            }
        }

    }).set(set);

}
