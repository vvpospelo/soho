function People() {

    var locationVKID = API.tryActionVKID(location.href),
        self         = this,
        cities       = {},
        countries    = {};

    self.reset = function() {
        cities = {};
        countries = {};
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    self.tryCountry = function(label, value) {
        if ( /country/.test(label) && (value > 0) ) {
            countries[value] = true;
        }
    }.try(null);

    self.tryCity = function(label, text) {
        if ( text && ['city', 'hometown'].indexOf(label) >= 0 ) {
            cities[text.replace(STR.regexp.insignificantChars, ' ').normalize().capitalize()] = true;
        }
    }.try(null);

    // -----------------------------------------------------------------------------------------------------------------

    var labelLocation = function(univers) {
        var moda = univers.length ? (INI.vkUniversities[univers[0]] || {
            country : 'unknown',
            city    : 'unknown'
        }) : {};
        !countries[2] && self.tryCountry('country', moda.country);
        self.tryCity('city', moda.city);
        return _.size(countries) ? '<a class="countries" data-countries="' + _.keys(countries).join(',') + '">' +
        _.keys(countries).map(country => INI.vkCountries[country] || '').join(', ') + '</a>' + (_.size(cities) ? ' <a class="cities">' +
        _.keys(cities).map(city => (city == 'Unknown') ? '<span class="tabu">' + city + '</span>' : city).join(', ') + '</a>' : '') : '';
    }.try('');

    var labelUniver = function(univers, mention) {
        return univers.map(function(edu) {
            var uni = INI.vkUniversities[edu];
            return '<a ' + (uni ? (uni.country == 2 ? '' : 'class="warn" ') : 'class="tabu" ') + 'href="' + LNK.toSearch({
                    section : 'people', university : edu
                }) + '#noSearch">' + (uni ? uni.city + ', ' : '') + mention[edu] + '</a>';
        }).join(',<br>');
    }.try('');

    var labelSexRatio = function(sexratio) {
        return sexratio + '%';
    }.try('');

    // -----------------------------------------------------------------------------------------------------------------

    var link = function(obj, VKID, cls) {
        return '<a class="common_' + cls + '" data-id="' + VKID + '" href="' + LNK.toMail(VKID) + '" title="' + obj.name +
            '" ><img src="' + obj.src + '" /></a>';
    }.try('');

    var labelBooked = function(booked) {
        return _.transform(booked, function(booked, obj, VKID) {
            locationVKID != VKID ? booked[VKID] = link(obj, VKID, 'booked') : null;
        }, []).join('');
    }.try('');

    var labelCommon = function(common) {
        return _.transform(common, function(common, obj, VKID) {
            locationVKID != VKID ? common[VKID] = link(obj, VKID, 'friend') : null;
        }, []).join('');
    }.try('');

    var labelRecents = function(recents) {
        return _.transform(recents, function(recents, obj, VKID) {
            locationVKID != VKID ? recents[VKID] = link(obj, VKID, 'recent') : null;
        }, []).join('');
    }.try('');

    // -----------------------------------------------------------------------------------------------------------------

    self.labels = function(related) {
        return {
            location : labelLocation(related.univers),
            univers  : labelUniver(related.univers, related.mention),
            sexratio : labelSexRatio(related.sexratio),
            booked   : labelBooked(related.booked),
            common   : labelCommon(related.common),
            recents  : labelRecents(related.recents)
        };
    }.try({});

}
