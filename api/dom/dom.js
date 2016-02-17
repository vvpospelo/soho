// --- New Queries -----------------------------------------------------------------------------------------------------

jQuery.prototype.selfFind = function(query) {
    return this.find(query).add(this.filter(query));
}.try();

jQuery.prototype.selfChild = function(query) {
    return this.children(query).add(this.filter(query));
}.try();

jQuery.prototype.selfFirst = function(query) {
    return this.is(query) ? this : this.find(query).first();
}.try();

// --- Attributes ------------------------------------------------------------------------------------------------------

jQuery.prototype.src = function(value) {
    return jQuery.prototype.attr.apply(this.selfFirst('img'), ['src'].concat(Array.from(arguments))) || '';
}.try();

jQuery.prototype.ref = function(value) {
    return jQuery.prototype.attr.apply(this.selfFirst('a'), ['href'].concat(Array.from(arguments))) || '';
}.try();

Node.prototype.ref = function(value) { // ! Don't use .href -> decodeURI error
    return _.is(value) ? this.setAttribute('href', String(value)) : this.getAttribute('href');
};

Node.prototype.remove = function() {
    this.parentNode && this.parentNode.removeChild(this);
};

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.dataset = function(set) {
    var elem = this.elem();
    if ( _.no(set) ) {
        return elem.dataset || {};
    }
    if ( !_.size(_.pickBy(set, _.is)) ) {
        return elem.dataset[_.keys(set)[0]];
    }
    _.assign(elem.dataset, set);
    return this;
}.argObj();

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.outerHTML = function(value) {
    return _.no(value) ? _.map(this, elem => elem.outerHTML || '').join('') : this.elem().outerHTML = value;
}.try('');

jQuery.prototype.selfText = function(value) {
    var texts = this.contents().filter(function() {
        return this.nodeType == 3;
    });
    if ( _.is(value) ) {
        return !texts.length ? this.prepend(document.createTextNode(value)) : texts[0].data = value
    }
    return _.map(texts, text => text.data || '').join('');
}.try('');

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.provide = function(selector, html, prepend) {
    return (selector = this.children(selector)).length && selector ||
        $(html)[prepend ? 'prependTo' : 'appendTo'](this);
}.try($());

jQuery.prototype.instead = function(selector, node, prepend) {
    return (selector = this.selfChild(selector)).length && selector.after(node).remove() && this ||
        this[prepend && 'prepend' || 'append'](node);
}.try();

// ---------------------------------------------------------------------------------------------------------------------

DOM.getStyle = function(elem) {
    return window.getComputedStyle ? document.defaultView.getComputedStyle(elem, null) : ( elem.currentStyle ? elem.currentStyle : null );
}.try({});

DOM.getProperty = function(elem, prop) {
    return DOM.getStyle(elem).getPropertyValue(prop);
}.try(null);

DOM.getPropertyValue = function(elem, prop) {
    return _.ifNumeric((/^-?[\d\.]+/.exec(DOM.getProperty(elem, prop) || '') || [])[0]);
}.try(null);

jQuery.prototype.getStyle = function() {
    return DOM.getStyle(this.elem());
}.try({});

jQuery.prototype.getProperty = function(prop) {
    return DOM.getProperty(this.elem(), prop);
}.try(null);

jQuery.prototype.getPropertyValue = function(prop) {
    return DOM.getPropertyValue(this.elem(), prop);
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

DOM.addStyle = function(selector, style) {
    DOM.head.instead('style.styler:contains("' + selector.replace(/\(.*\)/g, '') + '")',
        '<style class="styler">' + selector + ' ' + (_.isPlain(style) ? _.visual(_.transform(style, function(style, value, key) {
            style[key] = value + ';';
        }), {
            comma : ' '
        }).replace(/'/g, '') : style) + '</style>');
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

DOM.loadImage = function(src, attempts) {
    var img   = new Image(),
        trial = $.Trial().always(function() {
            img.onload = img.onerror = null;
        });
    img.onload = function() {
        trial.resolve(this);
    };
    img.onerror = function() {
        this.attempts-- > 1 ? (this.src = null) || (this.src = src) : trial.reject(this);
    };
    img.attempts = attempts || 0;
    img.src = src;
    return trial;
}.try(never);

DOM.imageLoaded = function(img, src) {
    return (LNK.parse(img.src).pathname == LNK.parse(src).pathname) && (img.naturalWidth * img.naturalHeight != 0);
}.try(false);
