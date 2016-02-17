function Counter() {
    var self = this,
        max  = 0;

    var labels = [
        $('<p class="procent"></p>'),
        $('<p class="todo_bar todo"></p>')
    ];
    self.bar = labels[0].add(labels[1]);

    _.map(arguments, bar => self.bar = self.bar.add(bar));

    self.define({
        enable  : function(bar) {
            if ( _.isJQuery(bar) ) {
                bar.labels.empty().append(self.bar.addClass('prolabel'));
                (self.reset = function() {
                    bar.hide();
                    max = 0;
                })();
                self.show = function(todo) {
                    var procent = 1 - todo / (max = Math.max(max, todo));
                    bar.counterbar({
                        progress : procent
                    });
                    labels[0].text(Math.floor(procent * 100) + '%');
                    labels[1].text(todo || '');
                    return {
                        max     : max,
                        todo    : todo,
                        procent : procent
                    };
                };
            }
            return self;
        },
        disable : function() {
            self.reset = function() { };
            self.show = function() { };
            return self;
        }

    }).disable();

}

function Progress() {

    var labels = [
        $('<p class="todo"></p>'),
        $('<p></p>')
    ];
    var bar = labels[0].add(labels[1]);

    Progress.superclass.constructor.apply(this, _.concat(arguments, bar));
    var self = this;

    var max   = 0,
        start = 0;

    self.progress = function(todo) {
        if ( !todo ) {
            self.reset(start = max = 0);
        } else {
            var prog = self.show(todo);
            start = (prog.max > max) ? TIME.ms() : start;
            max = prog.max;
            var index = max - prog.todo;
            var remain = index ? (TIME.ms() - start) * (max / index - 1) : 0;
            labels[0].text(remain ? 'осталось' : '');
            labels[1].text(remain ? TIME.toTimeString(remain) : '');
        }
    }

}

Progress.inherits(Counter);

// ---------------------------------------------------------------------------------------------------------------------

function ImageCounter() {

    function QueueBar(cls) {
        let bar = [
            $('<div class="priority1"></div>'),
            $('<sup class="priority2"></sup>')
        ];

        this.define({
            bar  : function() {
                return $('<p class="' + (cls || '') + ' queue"></p>').append(bar);
            },
            show : function(state) {
                _.map(_.merge([0, 0], state), (length, q) => bar[q].text(length || ''));
            }
        });
    }

    let queueBar = [
        new QueueBar('inload_bar'),
        new QueueBar('queue_bar')
    ];

    ImageCounter.superclass.constructor.apply(this, _.concat(arguments, queueBar[0].bar(), queueBar[1].bar()));

    var self = this;

    self.define({
        progress : function() {
            var total = _.sum(_.zip.apply(_, arguments)[0]);
            _.map(arguments, (state, p) => queueBar[p].show(state));
            total > 0 ? self.show(total) : self.reset();
        }
    });

}

ImageCounter.inherits(Counter);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.counterbar = function(set) {
    var self = this;

    function isCounter(object) {
        return object && object instanceof Counter;
    }

    _.forOwn(set, function(value, key) {
        switch ( key ) {
            case 'create' :
                self.html(self.bar = $('<div class="progressbar"></div>')
                        .append(self.labels = $('<div class="prolabels"></div>')));
                break;
            case 'counter' :
                if ( isCounter(value) ) {
                    self.counterbar('disable');
                    self.counter = value.enable(self);
                }
                break;
            case 'progress' :
                !isNaN(value) ? self.show().bar.css({
                    width : (value * 100) + '%'
                }) : null;
                break;
            case 'disable' :
                if ( isCounter(self.counter) ) {
                    self.counter.disable();
                    self.counter = null;
                }
        }
    });
    return self;

}.try().argObj(true);
