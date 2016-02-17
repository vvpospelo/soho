function Relator(filter) {
    Relator.superclass.constructor.apply(this, arguments);

    var self = this;

    self.mark = function() {
        self.fixSummary();
        return self.visible().each(function(i) {
            $(this).addInfo({
                number : i + 1
            }, true);
        });
    }.try($());

    self.order = function() {
        DOM.container.prepend(_.sortBy(self.visible(), function(friend) {
            return -$(friend).calcRating();
        }));
        return self.mark();
    }.try($());

    var onCheckStatus = function(msg, value, key) {
        switch ( key ) {
            case 'ready' :
                self.setTimer(TIME.check).done(self.prev);
                break;
            case 'fail' :
                switch ( value ) {
                    case 'bottom':
                        self.next();
                        break;
                    case 'closed':
                        self.prev();
                        break;
                    case 'failed':
                        self.setTimer(TIME.retry).done(self.prev);
                        break;
                    case 'missed':
                        self.setTimer(3 * TIME.minute).done(self.next);
                        break;
                }
                break;
            case 'status' :
                _.isNumeric(value) && profiler.setStatus(value).done(self.next);
        }
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    self.next = function() {
        return TIME.resolve(self.check);
    }.try(never);

    self.prev = function() {
        return TIME.reject(self.check);
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.clearTimer = function() {
        return TIME.reject(self.expire);
    }.try(never);

    self.setTimer = function(timeout) {
        self.clearTimer();
        return self.expire = self.timer('expire', timeout);
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.prepare = function(card) {
        return card.not('.analyzed').is(':visible') ? DOM.scrollTop(card.offset().top - DOM.container.offset().top, TIME.fast).then(function() {
            return card;
        }) : already;
    }.try(never);

    self.enter = function(card) {
        return self.prepare(card).then(function(card) {
            return _.isJQuery(card) ? card.cardEnter().reg(self, 'enter').then(function() {
                return self.prepare(card);
            }) : already;
        });
    }.try(never);

    self.analyze = function(card) {
        return self.enter(card).then(function(card) {
            if ( _.isJQuery(card) ) {
                self.tabId = profiler.tabs.open(profiler.checkURL(), {
                    active : false
                });
                self.setTimer(TIME.minute).done(self.prev);
                return self.check = self.Trial('check').always(function() {
                    profiler.tabs.close(self.tabId);
                    self.clearTimer();
                });
            }
            return already;
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    var counter = new Progress(),
        buffer  = new Buffer(function(card) {
            return $.when(self.analyze(card), $.Trial().setTimeout(TIME.guarant)).fail(function() {
                buffer.prepend(card);
            });
        });

    self.addBuffer(buffer);

    buffer.progress(counter.progress).then(function() {
        return DOM.scrollTop(0, TIME.fast).done(function() {
            var cards = self.order();
            DOM.block.off().done(function() {
                DOM.photos.gallery({
                    counterbar : DOM.counterbar
                }).done(function() {
                    cards.first().cardEnter().done(self.reset);
                });
            });
        });
    }.try(never));

    self.start = function() {
        profiler.server.addListener(onCheckStatus);
        DOM.block.on().done(function() {
            DOM.counterbar.counterbar({
                counter : counter
            });
            self.mark().filter(':not(.analyzed)').filter(':visible').each(function() {
                buffer.append($(this));
            });
        });
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    self.collectYouth = function(cities) {
        return new Related({
            sex      : 1,
            age_from : 0,
            age_to   : INI.age.youth - 1,
            city     : 0
        }, self, cities).collect();
    }.try(never);

    self.collectByAge = function(cities) {
        return new Related({
            sex      : 1,
            age_from : INI.age.youth,
            age_to   : INI.age.senior - 1,
            city     : 0
        }, self, cities).collect(true);
    }.try(never);

    self.collectSenior = function(cities) {
        return new Related({
            sex      : 1,
            age_from : INI.age.senior,
            age_to   : INI.age.limit - 1,
            city     : 0
        }, self, cities).collect();
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.includeByAge = function(included, excluded) {
        var ages = {};
        return self.every(function(card, VKID) {
            if ( excluded[VKID] ) {
                card.hide();
            } else {
                var age = included[VKID] || 0;
                ages[age] = ages[age] || 0;
                ages[age]++;
                card.dataset({
                    age : age
                });
                age ? card.newLabeled('age').text(DATE.yearsLabel(age)).css({
                    color : DATE.colorAge(age)
                }) : null;
            }
        }).then(function mergeByAge() {
            ages = _.keys(ages).sort(function(age1, age2) {
                return (Number(age1) || 99) - (Number(age2) || 99);
            }).map(function(age) {
                return {
                    ages   : [age],
                    length : ages[age]
                }
            });
            for ( var i = 1; i < ages.length; ) {
                var prev = ages[i - 1], curr = ages[i];
                if ( (prev.length + curr.length) < 1000 ) {
                    prev.length += curr.length;
                    prev.ages.push(curr.ages[0]);
                    ages.splice(i, 1);
                } else {
                    i++;
                }
            }
            return ages;
        });
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    self.addButton = function(text, click) {
        return $('<button class="filter_button flat_button">' + text + '</button>').off('click').on('click', function() {
            var button = $(this).addClass('selected');
            button.siblings().hide();
            return click ? click(button) : null;
        }).appendTo(filter.filters.append('<div class="sep"></div>'));
    }.try($());

    self.buttonsByAge = function(ages) {
        if ( ages.length < 2 ) {
            return already;
        } else {
            var trial = self.Trial('buttonsByAge');
            DOM.block.off().done(function() {
                for ( var i = 0; i < ages.length; i++ ) {
                    function label(part) {
                        return (part.ages.indexOf('0') < 0 ? _.visual(part.ages, {
                                quotes : ['', ''], brackets : ['', '']
                            }) : ' and more ') + ' : ' + part.length;
                    }

                    self.addButton(label(ages[i]), function(button) {
                        var part = button.data('part');
                        self.every(function(card) {
                            part.indexOf(card.dataset('age') || 0) < 0 ? card.hide() : null;
                        }).done(trial.resolve);
                    }).data({
                        part : ages[i].ages
                    });
                }
            });
            return trial.then(DOM.block.on);
        }
    }.try(never);

}

Relator.inherits(Container);

// ---------------------------------------------------------------------------------------------------------------------

DOM.ready.done(function(context) {
    if ( context == 'friends' ) {
        marker.listen(function() {
            DOM.container.markViewed();
        });
        _.isPlainObject(INI.age) && (function() {
            var relator = new Relator(new Filter());
            relator.ready().done(function() {
                DOM.scrollTop(0);
                0 ? relator.addButton('TEST', function() {
                    relator.every(function() { }).done(function() {
                        DOM.idleObject('Friends').done(function() {
                            relator.test(function(next) {
                                return next.cardEnter();
                            });
                        });
                    });
                }) : null;
                relator.addButton('Check ' + INI.age.youth + '+', function(button) {
                    button.text('Collecting ' + INI.age.youth + '+ ...');
                    DOM.window.bind('beforeunload', function() {
                        return 'Уверен ?';
                    });
                    DOM.block.while(relator.server.serve('friends').then(function(friends) {
                        return relator.collectYouth(friends.cities).then(function(youth) {
                            return relator.collectByAge(friends.cities).then(function(included) {
                                return relator.collectSenior(friends.cities).then(function(senior) {
                                    return relator.includeByAge(included, _.assign(youth, senior, friends.males)).then(function(ages) {
                                        button.hide();
                                        return relator.idle('Friends').then(function() {
                                            return relator.buttonsByAge(ages);
                                        });
                                    });
                                });
                            });
                        });
                    })).done(relator.start);
                });
            });
        })();
    }
});
