DOM.alert = function(data) {
    var alerts = DOM.alerts.find('.alert');
    if ( alerts.length >= 24 ) {
        alerts.first().remove();
    }
    var alert = $('<div class="alert"></div>').append('<div class="alert_title">Alert</div>').appendTo(DOM.alerts),
        modal = $('<div class="alert_modal"></div>').appendTo(alert);
    $('<div class="flat_button alert_button">Close</div>').appendTo(alert).click(function() {
        alert.remove();
    });
    $('<div class="flat_button alert_button">Clear</div>').appendTo(alert).click(function() {
        DOM.alerts.empty();
    });
    var htmlb = $('<div class="flat_button alert_button">HTML</div>').appendTo(alert).click(toHTML),
        textb = $('<div class="flat_button alert_button">TEXT</div>').appendTo(alert).click(toText);

    function toText() {
        modal.html($('<textarea class="alert_text"></textarea>').text(data));
        htmlb.show();
        textb.hide();
    }

    function toHTML() {
        modal.html(data);
        textb.show();
        htmlb.hide();
    }

    toText(data = _.ifString(data) || _.visual(data));
}.try(null);

DOM.ready.done(function() {
    window.alert = DOM.alert.bind(DOM);
});
