DOM.ready.done(function() {
    _.isArray(INI.phrases) && DOM.content.onAppearance('#im_tabs div.im_tab_selected').done(function(tab) {
        var name = /\S+/i.exec((tab.text() || '').normalize()) [0];
        DOM.content.onAppearance('#im_resizer_wrap').done(function(container) {
            var phrases = $('<div id="custom_phrases"></div>').insertBefore(container);
            INI.phrases.forEach(function(phrase) {
                phrase = phrase.replace(/\.\.\./, name);
                phrases.append(phrase ? $('<a class="custom_phrase"></a><br>')
                    .html(phrase).click(function() {
                        $('div.im_editable').append(' ' + $(this).html()).focus();
                    }) : $('<br>'));
            });
            $('<div id="toggle_phrases" class="button_blue"></div>').append($('<button>Фразы</button>').click(function() {
                phrases.toggleClass('shown');
                this.style.display = 'none';
                IM.toEnd();
            })).appendTo('#im_send_wrap');
            IM.toEnd();
        });
    });
});

