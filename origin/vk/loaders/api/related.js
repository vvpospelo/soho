function Related(init, relator, cities) {

    var self    = this,
        total   = {},
        timeout = TIME.guarant,
        timing  = new Timing(function(query) {
            return relator.ajax.post('friends', _.assign({
                sex      : 0,
                age_from : 0,
                age_to   : 0,
                city     : 0,
                al       : 1,
                act      : 'filter_friends',
                uid      : relator.VKID
            }, query)).then(function(response) {
                return _.toObject(XHR.extractJSON(response) || [], query.age_to);
            });
        }.try(never), timeout);

    relator.addBuffer(timing);

    function flash(query) {
        return relator.Trial('flash', DOM.flash.apply(DOM, _.concat(_.transform(_.omit(query, ['al', 'act', 'uid']), (query, value, key) =>
            query[key] = key == 'city' ? ( value && cities[value] || null ) :
                         key == 'sex' ? ( value && INI.vkSex.en[value] || null ) : value), _.tail(arguments))));
    }

    // -----------------------------------------------------------------------------------------------------------------

    let checkQuery = {
        sex      : 1,
        age_from : 15,
        age_to   : 20,
        city     : 314,
        uid      : 9912604
    };

    function confirm(query, retry) {
        return timing.append(checkQuery).then(function(list) {
            return !_.size(list) && flash(query, 'paused ...', 3 * TIME.minute).then(() => confirm(query, true)) ||
                flash(query, 'checking ...', timeout) && retry && buffer.prepend(query);
        });
    }

    // -----------------------------------------------------------------------------------------------------------------

    var counter = new Progress(),
        buffer  = new Buffer(function(query) {
            return timing.append(query).then(function(list) {
                flash(query, {
                    found : _.size(list),
                    total : _.size(_.assign(total, list))
                }, timeout);
                if ( !_.size(list) ) {
                    return confirm(query);
                } else {
                    if ( _.size(list) >= 1000 && !query.city ) {
                        _.map(cities, (value, city) => buffer.prepend(_.new(query, {
                            city : city
                        })));
                    }
                }
            });
        });

    buffer.progress(counter.progress);

    // -----------------------------------------------------------------------------------------------------------------

    var collectByAge = function(step) {
        buffer.then(function() {
            relator.reg('related').resolve(total);
        });
        for ( var query = _.new(init, {
            age_to : init.age_from ? init.age_from : 14
        }), toAge       = init.age_to; query.age_from <= toAge; ) {
            query.age_to = Math.min(query.age_to, toAge);
            buffer.append(_.new(query));
            query.age_from = query.age_to + 1;
            query.age_to += step;
        }
        return relator.Trial('related');
    }.try(never);

    self.define({

        check : function() {
            return timing.append(checkQuery).then(function(list) {
                return !_.size(list) ? never : already;
            });
        }.try(never),

        collect : function(byAge) {
            DOM.counterbar.counterbar({
                counter : counter
            });
            return timing.append(init).then(function(list) {
                return !byAge && _.inRange(_.size(list), 1, 1000) ? list : collectByAge(1);
            });
        }.try(never)

    });

}

