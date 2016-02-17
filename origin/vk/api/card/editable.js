jQuery.prototype.editable = function(locked) {
    var dataset = this.elem().dataset;
    _.is(locked) ? dataset.locked = locked : null;
    return (dataset.locked != 'true') && (dataset.editable == 'true');
}.try(false);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.divInfo = function() {
    return this.find('div.info, div.info_no_actions');
}.try($());

DOM.labelSelector = function(label) {
    return '.' + label + '_label';
}.try('');

jQuery.prototype.provideLabel = function(label, prepend) {
    return this.provide(DOM.labelSelector(label), '<div class="labeled ' + label + '_label" ></div>', prepend);
}.try();

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.newLabeled = function(label, prepend) {
    return this.divInfo().provideLabel(label, prepend);
}.try($());

jQuery.prototype.getLabeled = function(label) {
    return this.divInfo().children(DOM.labelSelector(label)).first();
}.try($());

jQuery.prototype.addInfo = function(info, prepend) {
    if ( this.editable() ) {
        var divInfo = this.divInfo();
        _.forOwn(info, function(value, key) {
            var labeled = divInfo.provideLabel(key, prepend);
            _.is(value) ? _.isFunction(value) ? value(labeled) : labeled.html(_.isJQuery(value) ? value.outerHTML() : String(value)) : null;
        });
    }
    return this;
}.argObj();

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.initInfo = function() {
    if ( this.editable() ) {
        this.divInfo().children().addClass('labeled').each(function(index, labeled) {
            if ( index == 0 ) {
                labeled.classList.add('name_label');
            } else {
                var value = labeled.innerText;
                if ( /\d (лет|год|года)$/.test(value) ) {
                    labeled.classList.add('age_label');
                } else {
                    if ( /Online/i.test(value) ) {
                        labeled.classList.add('activity_label');
                    }
                }
            }
            return true;
        });
        this.addInfo({
            sites    : '',
            age      : null,
            text     : '',
            error    : '',
            photos   : '',
            status   : '',
            activity : null,
            friends  : '',
            location : '',
            univers  : '',
            sexratio : '',
            role     : ''
        });
        this.getLabeled('activity').insertAfter(this.getLabeled('status'));
        this.getLabeled('location').click(function() {
            $(this).next().toggleClass('shown');
        });
    }
    return this;
}.try();

