jQuery.prototype.setRating = function(key, value) {
    if ( this.editable() ) {
        var rating = this.data('rating') || {};
        rating[key || 'rating'] = _.no(value) ? 1 : value;
        this.data('rating', rating);
        return rating;
    }
    return {};
}.try({});

jQuery.prototype.calcRating = function() {
    return _.sum(this.data('rating'));
}.try(0);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markActivity = function(activity) {
    if ( this.editable() ) {
        var labeled = this.getLabeled('activity');
        activity = activity || DATE.parse(labeled.text());
        if ( !activity || (activity < INI.activeTimeLimit) ) {
            this.setRating('activity', -7);
            return this.tabuSwat(labeled);
        }
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.classFriends = function(nfriends) {
    nfriends = nfriends || API.tryNumber(this) || 0;
    var rating = (nfriends > 1299) ? -7 :
                 (nfriends > 899) ? -3 :
                 (nfriends > 799) ? -2 :
                 (nfriends > 699) ? -1 :
                 (nfriends > 599) ? -0.5 :
                 (nfriends < 49) ? -1 :
                 (nfriends < 29) ? -3 :
                 (nfriends < 9) ? -7 : 0;
    if ( rating <= -3 ) {
        this.tabu();
    } else {
        if ( rating <= -1 ) {
            this.warn();
        } else {
            this.nice();
        }
    }
    return rating;
}.try(0);

jQuery.prototype.markFriends = function() {
    if ( this.editable() ) {
        var labeled = this.getLabeled('friends');
        var rating = labeled.classFriends();
        this.setRating('friends', rating);
        if ( rating <= -7 ) {
            return this.tabuSwat(labeled);
        }
        if ( rating <= -3 ) {
            return this.tabu(labeled);
        }
        if ( rating <= -1 ) {
            return this.warn(labeled);
        }
        return this.nice(labeled);
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markSexRatio = function() {
    if ( this.editable() ) {
        var labeled = this.getLabeled('sexratio');
        var rating = Math.min(48 - API.tryNumber(labeled), 0) / 2;
        this.setRating('sexratio', rating);
        if ( rating < -5 ) {
            return this.tabuSwat(labeled);
        }
        if ( rating < -1 ) {
            return this.tabu(labeled);
        }
        if ( rating < 0 ) {
            return this.warn(labeled);
        }
        labeled.hide();
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

API.classStatus = function(status) {
    if ( _.isNumeric(status) ) {
        status = Number(status);
        if ( status == 1 ) {
            return 5;
        }
        if ( [2, 3, 4, 7].indexOf(status) >= 0 ) {
            return -49;
        }
        if ( [0, 5, 6].indexOf(status) >= 0 ) {
            return 0;
        }
    }
    return 0;
}.try(0);

jQuery.prototype.classStatus = function(status) {
    if ( _.isNumeric(status) ) {
        var rating = API.classStatus(status);
        if ( rating > 0 ) {
            this.nice();
        }
        if ( rating < 0 ) {
            this.tabu();
        }
        if ( rating == 0 ) {
            this.warn();
        }
        return rating;
    }
    return 0;
}.try(0);

jQuery.prototype.markStatus = function(status) {
    if ( this.editable() ) {
        var labeled = this.getLabeled('status');
        var rating = labeled.classStatus(status);
        this.setRating('status', rating);
        if ( rating > 0 ) {
            return this.nice(labeled);
        }
        if ( rating < 0 ) {
            return this.tabuSwat(labeled);
        }
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markChilds = function() {
    if ( this.editable() ) {
        var labeled = this.getLabeled('role');
        if ( labeled.length ) {
            if ( /(^есть$)|(\d+ (год|года|лет|мес€ц|мес€ца|мес€цев))/i.test(labeled.text() || '') ) {
                this.setRating('childs', -5);
                return this.tabuSwat(labeled);
            } else {
                this.setRating('childs', -1);
                return this.warn(labeled);
            }
        }
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.classCountries = function(countries) {
    if ( countries ) {
        countries = countries.split(',').map(c => Number(c));
        if ( countries.indexOf(2) >= 0 ) {
            return this.nice() && 1;
        }
        for ( var country of countries ) {
            if ( INI.vkSwapedCountries[country] ) {
                return this.tabu() && -3;
            }
        }
        this.warn();
    }
    return 0;
}.try(0);

jQuery.prototype.markLocation = function() {
    if ( this.editable() ) {
        var labeled   = this.getLabeled('location'),
            countries = labeled.find('.countries').dataset('countries'),
            rating    = labeled.classCountries(countries);
        this.setRating('location', rating);
        if ( rating < 0 ) {
            return this.tabuSwat(labeled);
        }
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markName = function() {
    if ( this.editable() ) {
        var labeled = this.getLabeled('name'),
            name    = labeled.text() || '';
        if ( WORD.regexp.married_name.test(name) ) {
            this.setRating('name', -3);
            return this.warn(labeled);
        }
        if ( name.like(WORD.regexp.v_names) ) {
            return this.nice(labeled);
        }
        return this.mark();
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markAge = function(age) {
    if ( this.editable() ) {
        var labeled = this.getLabeled('age');
        ( age = age || API.tryNumber(labeled)) ? labeled.css({
            color : DATE.colorAge(age)
        }) : null;
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markError = function() {
    if ( this.editable() ) {
        var labeled = this.getLabeled('error');
        if ( labeled.length ) {
            this.setRating('error', -7);
            return this.tabu(labeled);
        } else {
            this.setRating('error', 0);
        }
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markPhotos = function() {
    if ( this.editable() ) {
        var labeled = this.getLabeled('photos');
        if ( labeled.length ) {
            this.setRating('photos', -7);
            return this.tabu(labeled);
        } else {
            this.setRating('photos', 0);
        }
    }
    return already;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.markViewed = function() {
    return Array.from(this.selfFind('.booked_label, .common_label, .recents_label').children()).map(marker.mark) && already;
}.try(already);
