function Parser() {

    var self = this;

    function isExpected(text) {
        return INI.phrasesRegExp && INI.phrasesRegExp.test(text);
    }

    this.parseBooked = function(data) {
        return _.transform(XHR.sQuery(HTML.extractNode(data, 'body')).first('#users').first('#users_content').children(), function(booked, fave) {
            var id  = Number(API.tryVKID(/-?\d+$/, fave.id())),
                div = fave.first('.fave_user_image');
            booked[id] = {
                VKID : id,
                src  : div.child('img').attr('src'),
                name : fave.first('.fave_user_name').first('a').text()
            };
        }, {});
    }.try({});

    this.parseFriends = function(arr) {
        return _.transform(arr, function(friends, props, id) {
            API.ifVKID(id = Number(props[0])) ? friends[id] = {
                VKID     : id,
                src      : props[1],
                page     : props[2],
                sex      : Number(props[3]),
                name     : props[5],
                group    : Number(props[6]),
                edu      : Number(props[8]),
                commerce : Boolean(props[8] == -2000000000),
                common   : Boolean(props[10])
            } : null;
        }, {});
    }.try({});

    this.parseRelatives = function(data) {
        var parts = _.filter(XHR.splitResponse(data), function(part) {
            return /^\s*\{/.test(part);
        });

        function evalArray(part) {
            return _.map((part || '').match(/\[[^\]\[]*?\]/gim) || [], function(elem) {
                try {
                    return eval(elem);
                } catch ( e ) {
                    return [];
                }
            });
        }

        // -------------------------------------------------------------------------------------------------------------

        var friends  = self.parseFriends(evalArray(parts[0])),
            males    = {},
            commerce = {};

        _.forOwn(friends, function(friend, VKID) {
            friend.sex == 2 ? males[VKID] = true : null;
            friend.commerce ? commerce[VKID] = true : null;
        });

        // -------------------------------------------------------------------------------------------------------------

        var cities = _.transform(evalArray(parts[2]), function(cities, props) {
            cities[Number(props[0])] = props[1];
        }, {});

        // -------------------------------------------------------------------------------------------------------------

        var calcUnivers = function(friends, mention) {
            var univers = _.pickBy(_.transform(friends, function(univers, friend, edu) {
                function isEdu(edu) {
                    return _.isNumeric(edu) && edu > 0 && edu < 1000000000;
                }

                isEdu(edu = friend.edu) ? univers[edu] = (univers[edu] || 0) + 1 : null;
            }), (n) => n > 2);

            return {
                univers : univers = _.slice(_.sortBy(_.keys(univers), function(id) {
                    return -univers[id];
                }), 0, 3),
                mention : _.grep(mention, function(name, edu) {
                    return univers.indexOf(edu) >= 0;
                })
            };
        }.try({});

        // -------------------------------------------------------------------------------------------------------------

        return _.assign({
            list     : friends,
            males    : males,
            commerce : commerce,
            cities   : cities
        }, calcUnivers(friends, JSON.parse(parts[1] || '{}')));
    }.try({});

    // -----------------------------------------------------------------------------------------------------------------

    this.parsePosts = function(data) {
        return _.map(XHR.lQuery(data).filter('.post.own'), function(post) {
            if ( !(post = $(post)).is('.post_copy') ) {
                var content = post.find('.wall_text'),
                    media   = content.find('.page_post_queue_narrow');
                if ( media.length ) {
                    var author    = content.first('.author').text(),
                        albumName = '���������� �� ����� ' + author,
                        desc      = _.map(content.find('.wall_post_text, .media_desc, > :eq(2)'), desc => desc.innerHTML).join('<br>');
                    if ( !API.isVoidAlbum(albumName, desc) ) {
                        var replies  = post.find('.replies'),
                            date     = replies.find('span.rel_date').first().text(),
                            comments = '<div class="wall_module wide_wall_module">' +
                                _.map(replies.find('div.reply'), reply => reply.outerHTML).join('') + '</div>';
                        return _.map(media.find('a'), function(link) {
                            var photo = {
                                date      : date,
                                albumName : albumName,
                                desc      : desc,
                                comments  : comments
                            }, href   = link.lockedAttr('href');
                            _.assign(photo, API.parseMediaURL(href), API.parseAction(link.getAttribute('onclick')));
                            if ( photo.type == 'photo' && photo.id ) {
                                if ( !photo.x_ && !photo.x_src ) {
                                    var img = link.querySelector('img');
                                    img ? photo.x_src = img.lockedAttr('src') : null;
                                }
                                return photo;
                            }
                        });
                    }
                }
            }
            return [];
        });
    }.try([]);

    // -----------------------------------------------------------------------------------------------------------------

    this.parseRecents = function(data) {
        return XHR.sQuery(data).children().map(function(row) {
            var divs = row.first('tr').children(),
                VKID = API.tryVKID(/-?\d+$/, row.attr('id')),
                ava  = divs[0].first('a'), name = divs[1];
            return {
                VKID : Number(VKID),
                date : row.dataset('date') * 1000,
                src  : ava.first('img').attr('src'),
                name : name.first('a').text().normalize()
            };
        });
    }.try([]);

    //this.parseRecents = function(data) {
    //    return XHR.sQuery(data).children().map(function(row) {
    //        var divs = row.first('tr').children(),
    //            ava  = divs[0].first('a'), name = divs[1],
    //            msg  = divs[2].child('.dialogs_msg_body');
    //
    //        var info = {
    //            date : row.dataset('date') * 1000,
    //            VKID : API.tryVKID(/-?\d+$/, row.attr('id')),
    //            src  : ava.first('img').attr('src'),
    //            name : name.first('a').text().normalize()
    //        };
    //
    //        info.chat = !ava.child('.dialogs_inline_chatter').isBlank();
    //        info.passive = LNK.noActive(info.src);
    //        info.online = !name.child('.dialogs_online').isBlank();
    //        info.readed = !row.is('.dialogs_new_msg') && !msg.is('.dialogs_new_msg');
    //        if ( info.own = !msg.child('.dialogs_inline_author').isBlank() ) {
    //            info.expected = isExpected(msg.innerText());
    //        }
    //        info.unread = !info.readed && !info.own;
    //        info.write = info.readed && info.own;
    //
    //        return info;
    //    });
    //}.try([]);

    this.collectRecents = function(data) {
        return XHR.sQuery(data).children().map(function(row) {
            var info = {
                date : row.dataset('date') * 1000
            };
            if ( info.date < INI.dialogsDateMin ) {
                return new sQuery();
            }
            var divs = row.first('tr').children(),
                ava  = divs[0].first('a'), name = divs[1],
                msg  = divs[2].child('.dialogs_msg_body');

            info.VKID = API.tryVKID(/-?\d+$/, row.attr('id'));
            info.src = ava.first('img').attr('src');

            info.chat = !ava.child('.dialogs_inline_chatter').isBlank();
            info.passive = LNK.noActive(info.src);
            info.online = !name.child('.dialogs_online').isBlank();
            info.name = name.first('a').text().normalize();
            info.readed = !row.is('.dialogs_new_msg') && !msg.is('.dialogs_new_msg');
            if ( info.own = !msg.child('.dialogs_inline_author').isBlank() ) {
                info.expected = isExpected(msg.innerText());
            }
            info.unread = !info.readed && !info.own;
            info.write = info.readed && info.own;

            ava.removeAttrs(DOM.events.onmouse);
            ava.dataset({
                id      : info.VKID,
                src     : info.src,
                date    : info.date,
                tooltip : info.name
            });
            ava.attr({
                href : LNK.toMail(info.VKID)
            }).addClass('recent');
            'write unread online passive expected'.split(/\s/)
                .forEach(cls => info[cls] ? ava.addClass('mark_' + cls) : false);
            return ava;
        });
    }.try([]);

    // -----------------------------------------------------------------------------------------------------------------

    this.parseMail = function(rows) {
        if ( (rows = $(XHR.extractHTML(rows)).filter('tr')).length ) {
            var mail = $('<table class="im_log_t"></table>').append(rows.each(function(i, row) {
                $(row).find('.im_gift').attr('src', function(i, src) {
                    return src.replace(/(gifts)\/256/, '$1/96');
                });
            }));
            var first   = rows.first(),
                gifted  = first.find('.im_gift_row'),
                outText = first.filter('.im_out').find('.im_msg_text').text();
            first.find('a.im_date_link').text(function(i, html) {
                return html + ' ' + (new Date(first.dataset('date') * 1000)).toLocaleTimeString();
            });
            rows.filter('.im_unread_bar_tr').prevAll().addClass('im_new_msg');
            rows.filter('.im_add_row').each(function(i, tr) {
                $(tr).nextAll().not('.im_add_row').first().after(tr);
            });
            return $('<div id="mail"></div>').addClass(isExpected(outText) && 'expected' || gifted.length && 'gifted' || '').append(mail);
        }
    }.try(null);

    this.parseHistory = function(data, im) {
        return (im = im || {}) && XHR.sQuery(data).child('.im_log_t').child('tbody').children('tr').map(function(row) {
                return row.find('.player').map(player => player.remove()) && im.entry(API.tryNumber(row.id()), row.outerHTML());
            }) && im;
    }.try({});

    // -----------------------------------------------------------------------------------------------------------------

    this.parseProfile = function(data) {

        var page = {
            links : []
        };

        HTML.eachHead(HTML.extractNode(data, 'head'), 'link', function(link) {
            page.links.push(HTML.extractAttr(link, 'href'));
        });

        var body = XHR.sQuery(HTML.extractNode(data, 'body'), {
            eachHead : function(html) {
                return html.lockEvents(API.ACT.essential);
            }
        }).child(0);

        page.script = body.last('script').text();
        page.body = lQuery(body.first('#page_body').outerHTML());

        return page;
    }.try({});

}

var parser = new Parser();