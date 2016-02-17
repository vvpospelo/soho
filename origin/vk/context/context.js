DOM.patterns = {};

DOM.patterns.recent = {
    is        : DOM.context('recent'),
    container : '#im_dialogs',
    card      : 'a',
    tryVKID   : function() {
        return API.tryVKID(/-?\d+$/, this.attr('href'));
    },
    summary   : '#im_dialogs_summary div.summary',
    more      : '#im_more_dialogs'
};

{ // Many containers in one "im" dialog page

    DOM.patterns.dialog = {
        is        : DOM.context('dialog'),
        container : '#im_dialogs',
        card      : 'div.dialogs_row',
        tryVKID   : DOM.patterns.recent.tryVKID,
        summary   : '#im_dialogs_summary div.summary',
        more      : '#im_more_dialogs'
    };

    DOM.patterns.write = {
        is        : DOM.patterns.dialog.is,
        container : 'table.im_log_t',
        card      : 'tr.im_in, tr.im_out',
        tryVKID   : function() {
            return API.tryVKID(/^-?\d+$/, this.data('from'));
        },
        more      : 'a.im_morenew'
    };

    DOM.patterns.dialog_search = {
        is        : DOM.patterns.dialog.is,
        container : '#im_friends',
        card      : 'div.im_friend',
        prepare   : function(card) {
            card.children().wrap('<a href="/id' + this.tryVKID.apply(card) + '"></a>');
        },
        tryVKID   : function() {
            return API.tryVKID(/-?\d+$/, this.attr('id')) ||
                API.tryVKID(/-?\d+/, this.attr('onclick'));
        }
    };

}

DOM.patterns.friends = {
    is        : DOM.context('friends'),
    container : '#list_content',
    card      : 'div.user_block',
    prepare   : function() {
        Friends.bigphOver = function() { return false; }
    },
    tryVKID   : function() {
        return API.tryVKID(/-?\d+$/, this.attr('id')) ||
            API.tryVKID(/-?\d+$/, this.find('.lists').attr('id')) ||
            API.tryVKID(/-?\d+$/, this.find('.deny_request').attr('id')) ||
            API.tryVKID(/-?\d+/, this.find('.friends_bigph_wrap').attr('onmouseover'));
    },
    summary   : '#friends_summary',
    more      : '#show_more',
    editable  : true
};

DOM.patterns.search = {
    is        : DOM.context('people'),
    container : '#results',
    card      : 'div.people_row, div.groups_row',
    prepare   : function() {
        Searcher.bigphOver = function() { return false; }
    },
    tryVKID   : function() {
        return API.tryVKID(/-?\d+$/, this.find('.search_sub').attr('id')) ||
            API.tryVKID(/-?\d+/, this.find('.search_bigph_wrap').attr('onmouseover'));
    },
    summary   : '#summary',
    more      : '#show_more_link',
    editable  : true
};

DOM.patterns.gifts = {
    is      : true,
    card    : 'div.gift_row',
    tryVKID : function() {
        return API.tryVKID(/-?\d+$/, this.find('span.gift_actions a').ref());
    }
};

DOM.patterns.fave = {
    is        : DOM.context('fave'),
    container : '#users_content, #users_online_content',
    card      : 'div.fave_user_div',
    tryVKID   : function() {
        return API.tryVKID(/-?\d+/, this.attr('id')) ||
            API.tryVKID(/-?\d+/, this.find('div.fave_uph_wrap').attr('onmouseover'));
    }
};

{
    DOM.patterns.post = {
        is      : true,
        card    : 'div.post',
        tryVKID : function() {
            return API.tryVKID(/-?\d+/, this.find('a.author').data('from-id')) ||
                API.tryVKID(/-?\d+/, (/(-?\d+)_\d+$/.exec(this.attr('id') || '') || [])[1]);
        }
    };

    DOM.patterns.pub = {
        is      : true,
        card    : 'table.published_by_wrap',
        tryVKID : function() {
            return API.tryVKID(/-?\d+/, this.find('a.published_by_date').ref()) ||
                API.tryVKID(/-?\d+/, this.find('a.published_by_date').attr('onclick'));
        }
    };

    DOM.patterns.replay = {
        is      : true,
        card    : 'div.reply',
        tryVKID : function() {
            return API.tryVKID(/-?\d+/, this.find('a.author').data('from-id'));
        }
    };
}

DOM.patterns.feed = {
    is        : DOM.context('feed'),
    container : '#feed_rows',
    card      : 'div.feed_row',
    tryVKID   : function() {
        return DOM.patterns.post.tryVKID.apply(this.find('div.post'), arguments);
    },
    more      : '#show_more_link'
};

{
    DOM.patterns.fans = {
        is      : true,
        card    : 'div.fans_fan_row, div.fans_idol_row',
        tryVKID : function() {
            return API.tryVKID(/-?\d+$/, this.attr('id')) ||
                API.tryVKID(/-?\d+/, this.find('div[class*="ph_wrap"]').attr('onmouseover'));
        }
    };

    DOM.patterns.comment = {
        is      : true,
        card    : 'div.pv_comment',
        tryVKID : function() {
            return API.tryVKID(/-?\d+/, this.attr('onclick'));
        }
    };

    DOM.patterns.common = {
        is   : true,
        card : 'div.people_cell'
    };
}

// ---------------------------------------------------------------------------------------------------------------------

DOM.whenContext = function(patterns) {

    var cardVKID    = function(card) {
            return card.cardVKID() || this.tryVKID && card.cardVKID(this.tryVKID.apply(card));
        }.try(null),

        cardPrepare = function(event) {
            if ( !this.dataset.prepared ) {
                var card = $(this),
                    context = event.data;
                _.assign(this.dataset, {
                    prepared : true,
                    editable : context.editable || false
                });
                context.prepare ? context.prepare(card) : null;
                card.cardRedirect(context.cardVKID(card)).initLinks().initInfo();
            }
        }.try(null),

        whenContext = function(context) {
            function cardContext(container) {
                if ( context.card ) {
                    context.cardVKID = cardVKID;
                    container.off('mouseenter', context.card).on('mouseenter', context.card, context, cardPrepare);
                }
                return context;
            }

            return context.container ? DOM.content.onAppearance(context.container + ', div.title').then(function(container) {
                DOM.container = DOM.container ? DOM.container.add(container) : container;
                container.data(cardContext(DOM.content));
            }) : (DOM.container = $()) && cardContext(DOM.html) && 0 || already;
        }.try(never);

    return $.when.apply($, _.map(patterns, pattern => pattern.is ? whenContext(pattern) : already)).then(DOM.context);

}.try(never);
