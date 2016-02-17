'use strict';

function Queue(cleaner) {
    var queues = {},
        self   = this,
        rules  = new Handlers(); // --- Shift Limitation Rules ---------------------------------------------------------

    function length(queue) {
        return _.is(queue) ? queue instanceof Queue ? queue.length() :
                             queue instanceof Array ? queue.length : length(queues[queue]) : 0;
    }

    function byPriority(handler, priority) {
        _.is(priority) ? handler(queues[priority], priority) : _.forOwn(queues, handler);
    }

    self.define({

        rule   : rules.add.bind(rules),
        length : function(priority) {
            var value = 0;
            byPriority(function(queue) {
                value += length(queue);
            }, priority);
            return value;
        },
        state  : function() {
            return _.keys(queues).map(priority => self.length(priority));
        },

        // -------------------------------------------------------------------------------------------------------------

        push  : function(elem, priority) {
            priority = priority || 0;
            (queues[priority] = queues[priority] || []).push(elem);
        },
        shift : function(priority) {
            var value = null;
            rules.every() && byPriority(function(queue) {
                return _.is(value = queue.shift()) ? false : true;
            }, priority);
            return value;
        },
        reset : function() {
            _.forOwn(queues, queue => queue instanceof Queue ? queue.reset() : cleaner && _.map(queue, cleaner));
            queues = {};
        }

    }).reset();

    // --- Utils -------------------------------------------------------------------------------------------------------

    self.define({

        random : function() {
            for ( var p = 0, s = _.random(1, 3); p < s; p++ ) {
                for ( var i = 1, length = _.random(3, 9); i < length; i++ ) {
                    self.push(_.random(111, 999), p);
                }
            }
            return self;
        },
        visual : function(tune, depth) {
            return _.visual(queues, tune, depth);
        }

    });

    // --- Test --------------------------------------------------------------------------------------------------------

    self.define({

        subQueue : function(queue, priority) {
            function nextPriority(priority) {
                return !isNaN(priority = _.findLastKey(queues) || 0) ? Number(++priority) : priority + 1;
            }

            return queues[priority || nextPriority()] = queue || new Queue(cleaner);
        },
        test     : function() {
            self.random();
            self.subQueue(new Queue().random(), 5);
            self.subQueue(new Queue().random(), 7);
            self.subQueue(new Queue().random(), 9);

            _.log(self.visual());
            self.push('hai');
            _.log(self.visual());

            var value;
            while ( value = self.shift() ) {
                _.log(value, self.state(), self.visual());
            }
        }

    });

}
