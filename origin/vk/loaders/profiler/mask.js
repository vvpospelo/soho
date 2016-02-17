function Mask() {

    var mask = {},
        self = this;

    // --- Query Lib ---------------------------------------------------------------------------------------------------

    function unwrap(query) {
        return _.transform(query, (query, value, key) => query[_.words(key, /\w+/g)[1] || key] = value);
    }

    function wrap(query) {
        return _.transform(query, (query, value, key) => query['c[' + key + ']'] = value);
    }

    // -----------------------------------------------------------------------------------------------------------------

    let ignoredKeys = /^((q|faculty|chair|company|position|lang)|(addr_|edu_|mil_)\w*)|(\w*(_status|_spec|_class|_year|_priority))$/i;

    function isIgnored(query) {
        return _.some(query, (value, key) => ignoredKeys.test(key));
    }

    // -----------------------------------------------------------------------------------------------------------------

    var locationMask  = /^(city|country|hometown)$/i,
        educationMask = /^(university|school|uni_\w+|school_\w+)$/i;

    var reduce = function(mask) { // search optimization & acceleration
        (mask.country || 0) > 3 ? mask = _.grep(mask, (value, key) => !locationMask.test(key)) : null;
        mask.city || mask.hometown ? mask = _.grep(mask, (value, key) => !educationMask.test(key)) : null;
        mask.bday && mask.bmonth ? mask = _.grep(mask, (value, key) => !locationMask.test(key) && !educationMask.test(key)) : null;
        _.size(mask) > 6 ? mask = _.grep(mask, (value, key) => !locationMask.test(key)) : null;
        return mask;
    }.try({});

    // -----------------------------------------------------------------------------------------------------------------

    self.define({

        set : function(obj) {
            return _.forOwn(obj, (value, key) => mask[key == 'query' ? 'q' : key] = value);
        }.try({}),

        statusText : function (status) {
            status = INI.vkStatus[mask.status] || [];
            return status[(mask.sex || 2) - 1] || status[0];
        }.try(''),

        query : function(query) {
            return wrap(query || mask);
        }.try({}),

        link : function(query) {
            return LNK.toSearch(_.transform(self.query(query || mask), (query, value, key) => query[key] = key == 'c[q]' ? STR.queryEncode(value) : value));
        }.try(''),

        parse : function(labeleds, eachLabel, eachQuery) {
            labeleds.each(function() {
                var label   = null,
                    labeled = $(this),
                    text    = _.compact(_.map(labeled.find('a'), function(link) {
                        var url = LNK.parse(link.ref(), true);
                        if ( url.file == 'search' && !isIgnored(url.query = unwrap(url.query)) ) {
                            _.forOwn(url.query, function(value, key) {
                                mask[label = key] = value = WORD.first(value);
                                eachQuery && eachQuery(label, value, link.innerText);
                            });
                            return link.innerText || '';
                        }
                    })).join(' ');
                label && eachLabel && eachLabel(labeled, label, mask[label], text);
                return Boolean(_.size(mask) <= 12);
            });
            mask = _.assign(reduce(mask), {
                section : 'people',
                name    : 1
            });
        }.try(null),

        reset : function() {
            mask = {};
        }

    }).reset();

}
