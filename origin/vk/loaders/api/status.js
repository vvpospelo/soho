function Status(loader) {

    var self    = this,
        timeout = 1099,
        timing  = new Timing(function(query) {
            return loader.ajax.post('al_search.php', _.assign(query, {
                al : 1
            })).then(function(response) {
                return {
                    list : _.map(XHR.lQuery(response).selfChild('.people_row'), row =>
                        Number(API.tryVKID(/-?\d+/, row.querySelector('.search_bigph_wrap').onmouseover))),
                    more : XHR.extractJSON(response).has_more
                };
            });
        }.try(never), timeout);

    loader.addBuffer(timing);

    function flash(query) {
        return loader.Trial('flash', DOM.flash.apply(DOM, _.concat(_.pickBy({
            checking : query['c[q]'],
            status   : query['c[status]']
        }), _.tail(arguments))));
    }

    // -----------------------------------------------------------------------------------------------------------------

    let checkQuery = {
        'c[q]'          : 'Владимир Волконский',
        'c[section]'    : 'people',
        'c[country]'    : 2,
        'c[city]'       : 314,
        'c[name]'       : 1,
        'c[bday]'       : 11,
        'c[bmonth]'     : 10,
        'c[university]' : 1096
    };

    function confirm(query, retry) {
        return timing.append(checkQuery).then(function(cards) {
            return !_.size(cards.list) && flash(query, 'paused ...', 3 * TIME.minute).then(() => confirm(query, true)) ||
                flash(query, timeout) && (retry && self.check(query) || 'missed');
        });
    }

    // -----------------------------------------------------------------------------------------------------------------

    var checkStatus = function(query, VKID, offset) {
        return timing.append(_.assign(query, {
            offset : offset = offset || 0
        })).then(function(cards) {
            flash(query, timeout);
            return _.indexOf(cards.list, VKID) >= 0 ? query['c[status]'] :
                   cards.more && _.size(cards.list) && checkStatus(query, VKID, offset += _.size(cards.list)) || null;
        });
    }.try(never);

    self.define({

        check : function(query) {
            function checkbyOrder(order, VKID) {
                return _.size(order) ? checkStatus(_.new(query, {
                    'c[status]' : order.shift()
                }), VKID).then((status) => _.is(status) ? status : checkbyOrder(order, VKID)) : confirm(query);
            }

            return checkbyOrder([1, 4, 2, 7, 3, 0], Number(loader.VKID));
        }.try(never)

    });

}
