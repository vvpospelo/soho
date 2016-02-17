function lQuery(html) {
    return $(html.lockLinks());
}

String.prototype.lockLinks = function() {
    function lockAttr(html, attr) {
        return HTML.renameAttrs(html, attr, function(attr) {
            return 'locked_' + attr;
        });
    }

    var html = HTML.eachHead(this, 'img script', function(html) {
        return lockAttr(html, 'src');
    });
    return HTML.eachHead(html, 'link', function(html) {
        return lockAttr(html, 'href');
    });
}.try('');

String.prototype.unlockLinks = function() {
    function unlockAttr(html, attr) {
        return HTML.renameAttrs(html, attr.replace(/(\w+)/gi, 'locked_' + '$1'), function(attr) {
            return attr.replace('locked_', '');
        });
    }

    var html = HTML.eachHead(this, 'img script', function(html) {
        return unlockAttr(html, 'src');
    });
    return HTML.eachHead(html, 'link', function(html) {
        return unlockAttr(html, 'href');
    });
}.try();

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.unlockLinks = function() {
    function unlockAttr(node, attr) {
        var value = node.getAttribute('locked_' + attr);
        if ( value ) {
            node.setAttribute(attr, value);
            node.removeAttribute('locked_' + attr);
        }
    }

    this.selfFind('img, script').each(function(index, node) {
        unlockAttr(node, 'src');
    });
    this.selfFind('link').each(function(index, node) {
        unlockAttr(node, 'href');
    });
    return this;
}.try();

jQuery.prototype.lockedAttr = function(attr) {
    return this.attr('locked_' + attr) || this.attr(attr);
}.try();

Node.prototype.lockedAttr = function(attr) {
    return this.getAttribute('locked_' + attr) || this.getAttribute(attr);
};

// ---------------------------------------------------------------------------------------------------------------------

String.prototype.lockEvents = function(filter) {
    return HTML.replaceAttrs(this, DOM.events.onmouse, function(value) {
        return filter && filter(value) ? value : 'return; ' + value;
    });
}.try('');

String.prototype.unlockEvents = function() {
    return HTML.replaceAttrs(this, DOM.events.onmouse, function(value) {
        return value.replace(/^return\; /i, '');
    });
}.try();

jQuery.prototype.unlockEvents = function() {
    DOM.events.onmouse.split(/[\s,]/).map(attr => this.attr(attr, function(i, value) {
        return value ? value.replace(/^return\; /i, '') : value;
    }));
    return this;
}.try();
