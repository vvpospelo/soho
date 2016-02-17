function Activity() {

    var mask  = {},
        sites = {},
        self  = this;

    function open(url) {
        profiler.tabs.open(url, {
            selected : false
        });
    }

    self.define({

        set : function(obj) {
            return _.forOwn(obj, (value, key) => mask[key] = value);
        }.try({}),

        tryFB : function() {
            sites['facebook.com'] ? open(sites['facebook.com']) :
            open('https://www.facebook.com/search/str/' + encodeURIComponent(mask.name).replace('%20', '+') + '/keywords_users');
        }.try(null),

        openSites : function() {
            _.map(sites, open);
            !sites['facebook.com'] ? self.tryFB() : null;
        }.try(null),

        trySites : function(source, pattern) {
            function clearAway(url) {
                return (url = LNK.parse(url, true)).file == 'away.php' ? LNK.tryDecodeURIComponent(url.query.to) : !LNK.origin(url) ? url.href : null;
            }

            function tryInstagram(elem) {
                var page = (/^(.*\W|)inst([\w\.]*)([\W\s]+)(p\/[\w\-]+\/|\w+)/i.exec(elem.text() || '') || [])[4];
                return page ? elem.html('<a href="' + '/away.php?to=' + 'http://www.instagram.com/' + page + '">instagram.com</a>') : $();
            }

            function tryLinks(elem) {
                var links = elem.find('a');
                return links.length ? links : tryInstagram(elem).find('a');
            }

            source.each(function() {
                tryLinks($(this)).each(function() {
                    var url = clearAway(this.ref());
                    if ( url ) {
                        var site = LNK.parse(url).domain;
                        site && !sites[site] && INI.noSites.indexOf(site) < 0 && (!pattern || pattern.indexOf(site)) >= 0 ? sites[site] = url : null;
                    }
                });
            });

            return _.keys(sites).sort(function(site1, site2) {
                return ['facebook.com', 'instagram.com'].indexOf(site2) >= 0 ? 1 : 0;
            }).map(site => '<a href="' + sites[site] + '" class="url ' + site.replace('.', '_') + '" >' + site + '</a>').join(' ');

        }.try({}),

        // -----------------------------------------------------------------------------------------------------------------

        tryActivity : function(title, posts) {
            var activity = {};
            title.find('#profile_online_lv:not([style*=display]), #profile_time_lv').add(posts.find('.rel_date')).each(function() {
                var text = (this.innerText || '').replace(/заходил(а|)/gi, '').normalize();
                if ( text ) {
                    var time = DATE.parse(text) || 0;
                    if ( time > INI.activeTimeLimit ) {
                        activity.time = time;
                        activity.info = (text == 'Online' ? '<span class="online">' : '<span>') + text + '</span>';
                        var mobile = this.querySelector('.mob_onl');
                        mobile ? activity.info += mobile.outerHTML : null;
                    }
                    return false;
                }
            });
            title.find('#profile_time_lv').add(posts.find('span.explain')).each(function() {
                return activity.sex ? false :
                       /^(заходила|обновила)/i.test(this.innerText || '') ? (activity.sex = 1) && false :
                       /^(заходил|обновил)/i.test(this.innerText || '') ? (activity.sex = 2) && false : true;
            });
            !activity.time ? activity.info = '<span class="tabu">never</span>' : null;
            return activity;
        }.try({}),

        reset : function() {
            mask = {};
            sites = {};
        }

    }).reset();

}
