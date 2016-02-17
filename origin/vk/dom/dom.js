DOM.document = $(document);
DOM.window = $(window);

DOM.reload = $('#reload');
DOM.cover = $('#cover');
DOM.html = $('html');
DOM.head = $('head');

DOM.locationLink = $('<a href="' + location.href + '"></a>');
DOM.blocker = $('<div id="blocker"></div>').appendTo(DOM.html);

DOM.viewer = $('<div id="viewer"></div>').appendTo(DOM.html);
DOM.avatars = $('<div id="avatars"></div>').prependTo(DOM.viewer);
DOM.albums = $('<div id="photos_albums"></div>').insertAfter(DOM.avatars);
DOM.photos = $('<div id="previews"></div>').insertAfter(DOM.albums);

DOM.alerts = $('<div id="alerts"></div>').appendTo(DOM.html);

DOM.profiler = $('<div id="profiler"></div>').appendTo(DOM.viewer);
DOM.watcher = $('<div id="watcher"></div>').appendTo(DOM.viewer);
DOM.birthday = $('<div id="birthday"></div>').appendTo(DOM.viewer);

DOM.leftWatcher = $('<div id="left_watcher" data-editable="true"></div>').prependTo(DOM.watcher);
DOM.rightWatcher = $('<div id="right_watcher" data-editable="true"></div>').appendTo(DOM.watcher);

DOM.cursor = {};

// ---------------------------------------------------------------------------------------------------------------------

DOM.joined.done(function() {

    DOM.listener = new ClientListener();

    DOM.html.onChildAppearance('body').then(function(body) {
        DOM.body = body;
        DOM.scrollbar = {
            width : DOM.scrollbarWidth()
        };
        DOM.scrollBody = API.userAgent('chrome') ? DOM.body : DOM.html;
        return DOM.body.onAppearance('#page_layout').then(function(pageLayout) {
            DOM.pageLayout = pageLayout;
            return $.when(
                DOM.pageLayout.onChildAppearance('#page_body').then(function(pageBody) {
                    DOM.pageBody = pageBody;
                }),
                DOM.pageLayout.onAppearance('#content > div').then(function(content) {
                    DOM.content = content.parent();
                }),
                DOM.pageLayout.onChildAppearance('#page_header').then(function(header) {
                    DOM.header = header;
                }),
                DOM.pageLayout.onChildAppearance('#footer_wrap').then(function(footer) {
                    DOM.footer = footer;
                })).then(function() {
                DOM.footer.prepend('<div id="versions"> © ' + _.map(API.versions(), function(version, module) {
                        return version ? module + ' : <b>' + version + '</b>' : '';
                    }).join(' | ') + '</div>');
            });
        });
    }).then(function() {
        return DOM.whenContext(DOM.patterns).then(DOM.ready.resolve);
    });

});

// ---------------------------------------------------------------------------------------------------------------------

DOM.ready.done(function() {
    function menuWrap() {
        return $('<td></td>').append($('<nobr></nobr>').append(_.toArray(arguments)));
    }

    let topMenu = $('#top_links').find('tr').first();

    DOM.timer = $('<div id="timer" class="tracer"></div>');
    DOM.tracer = $('<div id="tracer" class="tracer"></div>');

    DOM.redirector = $('<input type="checkbox" name="redirect" checked="checked" />');
    DOM.counterbar = $('<div id="counterbar" class="bg1"></div>');
    DOM.flasher = $('<div id="flash" class="bg1"></div>');
    DOM.logo = $('<div id="logo"></div>');

    (function() {
        topMenu.prepend(menuWrap(DOM.counterbar, DOM.flasher), DOM.reload);
        topMenu.append(menuWrap(DOM.redirector.change(function(event) {
            INI.redirectFlag = $(event.currentTarget).prop('checked');
        })));
        topMenu.append(menuWrap(DOM.logo));
    })();

    DOM.body.onAppearance('#side_bar').done(function(sideBar) {

        DOM.birthday.html($('#left_blocks div.attention > div', sideBar).html());

        sideBar.onAppearance('ol li').done(function(menu) {

            var firstItem = topMenu.children('td.top_back_link_td').next(),
                itemHTML  = firstItem.outerHTML();

            firstItem
                .before(menuWrap(DOM.tracer))
                .before(menuWrap(DOM.timer))
                .before(menuWrap($('#warn_debug').notice('warn_notice')))
                .before(menuWrap($('#error_debug').notice('error_notice')));

            function cloneMenuItem(source) {
                var menuItem = $(itemHTML);
                firstItem.before(menuItem);
                menuItem.find('a').ref(source.ref()).text(source.innerText || source.textContent).text(function(index, text) {
                    text = text.replace(/^(\+|\.+|)(\d+|)(... )(.*)$/, '$4 $2').toLowerCase();
                    if ( / \d+$/.test(text) ) {
                        this.classList.add('important');
                    }
                    return text;
                });
                return menuItem;
            }

            var links = $('a', topMenu);
            menu.reverse().each(function(index, menuTab) {
                menuTab = $(menuTab);
                if ( (menuTab.css('display') != 'none') && !menuTab.find('a[href*="/app"]').length ) {
                    menuTab.find('a').each(function() {
                        this.ref(this.ref()
                            .replace(/(\/fave)/, '$1?section=users')
                            .replace(/(\/friends)/, '$1?section=all'));
                        for ( var j = 0; j < links.length; j++ ) {
                            if ( links[j].href == this.href ) {
                                return;
                            }
                        }
                        cloneMenuItem(this);
                    });
                }
            });

            var calendar = $('<a href="friends?w=calendar">календарь</a>'),
                events   = DOM.birthday.find('a').length - 1;
            if ( events > 0 ) {
                calendar.addClass('important').text(function(index, text) {
                    return text + ' ' + events;
                });
            }
            cloneMenuItem(calendar.elem());
            cloneMenuItem($('<a href="https://docs.google.com/spreadsheet/ccc?' +
                'key=0Aue65zAcjltYdG1KOExlbnVWV2M5NEFVMTdxR05NZEE#gid=0">wiki 1</a>').elem());

            $('a', topMenu).each(function(index, link) {
                $(link).clearOnMouse();
            });

        });
    });

});


