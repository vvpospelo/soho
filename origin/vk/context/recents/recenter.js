function Recenter() {
    Recenter.superclass.constructor.apply(this, arguments);

    var self = this;

    self.load = function(offset, now) {
        now = now || _.now();
        return self.ajax.post('al_im.php', {
            act    : 'a_get_dialogs',
            al     : 1,
            offset : offset = offset || 0
        }).then(function(data) {
            var header = XHR.extractJSON(data) || [];
            DOM.container.append(parser.collectRecents(data).map(ava => ava.html()).join(''));
            if ( header.has_more && (offset < INI.recentsLimit) ) {
                return self.delay('cards', Math.min(offset, 49)).then(function() {
                    return self.load(header.offset, now);
                });
            }
            return already;
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.renumber = function() {
        self.cards().each(function(o) {
            $.data(this, 'tooltip', this.dataset.tooltip = '[' + (o + 1) + '] ' + this.dataset.tooltip);
        });
        return self;
    }.try();

    self.tester = function() {
        self.test(function(next) {
            return DOM.container.is('.testing') ? next.cardEnter() : never;
        }, {
            imax   : 99999,
            scroll : false,
            iter   : 99999
        });
    }.try();

    // -----------------------------------------------------------------------------------------------------------------

    self.controls = function() {
        function switchButton(role, tags, exclusive, callback) {
            return $('<div class="recenter"></div>').addClass(role).checkBox({
                onchange : function(event, self) {
                    exclusive && self.siblings().toggleClass('invisible');
                    DOM.container.toggleClass(role);
                    callback && callback();
                }, tags  : tags
            });
        }

        $('#im_sum').after($('<div id="recenter"></div>')
            .append(switchButton('just_online', ['just online', 'online'], true))
            .append(switchButton('just_unread', ['just unread', 'unread'], true))
            .append(switchButton('just_passive', ['just passive', 'passive'], true))
            .append(switchButton('just_hidden', ['just hidden', 'hidden'], true))
            .append($('<span></span>')
                .append(switchButton('hide_expected', ['add expect', '+expect'], true))
                .append(switchButton('just_expected', ['just expect', 'expect'], false)))
            .append(switchButton('testing', ['run test', 'testing...'], true, self.tester))
        );
        return self;
    }.try();

    self.resize = function() {
        DOM.content.outerHeight(DOM.window.height() - DOM.content.offset().top);
        DOM.container.outerHeight(DOM.window.height() - DOM.container.offset().top);
        return self;
    }.try();
}

Recenter.inherits(Container);

// ---------------------------------------------------------------------------------------------------------------------

DOM.ready.done(function(context) {
    if ( context == 'recent' ) {
        var recenter = new Recenter(new Filter());
        DOM.window.resize(recenter.resize);
        DOM.container.addClass('hide_expected').empty();
        DOM.idleObject('IM').then(function() {
            recenter.ready().done(function() {
                marker.listen(function(msg) {
                    _.size(msg.hidden) && Array.from(DOM.container.children()).map(marker.mark);
                });
                DOM.container.onChildMutation(function(added) {
                    added.map(marker.mark);
                }).gallery({
                    priority : 1,
                    capacity : 45,
                    attempts : 7
                }).done(function() {
                    recenter.controls().resize().load().done(function() {
                        recenter.idle().then(recenter.renumber);
                    });
                });
            });
        });
    }
});
