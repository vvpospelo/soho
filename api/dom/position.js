DOM.inPage = function(node) {
    return (node === document.documentElement) ? false : ((node.nodeType == 1) ? document.documentElement.contains(node) : false);
};

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.fixRect = function() {
    return this.removeAttr('style').css({
        width  : this.width(),
        height : this.height()
    });
}.try();

// ---------------------------------------------------------------------------------------------------------------------

DOM.windowRect = function(elem) {
    return elem.getBoundingClientRect();
};

jQuery.prototype.windowRect = function() {
    return DOM.windowRect(this.elem());
};

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.square = function() {
    var box     = this.windowRect(),
        style   = this.getStyle(),
        padding = {
            top    : _.trimEnd(style.paddingTop, 'px'),
            left   : _.trimEnd(style.paddingLeft, 'px'),
            bottom : _.trimEnd(style.paddingBottom, 'px'),
            right  : _.trimEnd(style.paddingRight, 'px')
        },
        border  = {
            top    : _.trimEnd(style.borderTopWidth, 'px'),
            left   : _.trimEnd(style.borderLeftWidth, 'px'),
            bottom : _.trimEnd(style.borderBottomWidth, 'px'),
            right  : _.trimEnd(style.borderRightWidth, 'px')
        },
        window  = {
            top    : 0,
            left   : 0,
            bottom : DOM.window.height(),
            right  : DOM.window.width()
        };
    return {
        top    : Math.min(Math.max(box.top + padding.top + border.top, window.top), window.bottom),
        left   : Math.min(Math.max(box.left + padding.left + border.left, window.left), window.right),
        bottom : Math.max(Math.min(box.bottom - padding.bottom - border.bottom, window.bottom), window.top),
        right  : Math.max(Math.min(box.right - padding.right - border.right, window.right), window.left)
    };
}.try({});

// ---------------------------------------------------------------------------------------------------------------------

Node.prototype.squareBottom = function() {
    return this.offsetHeight + this.scrollTop;
};

Node.prototype.squareVertical = function() {
    return {
        top    : 0,
        bottom : this.squareBottom()
    };
};

Node.prototype.offsetVertical = function() {
    var top = this.offsetTop;
    return {
        top    : top,
        bottom : top + this.offsetHeight
    };
};

// ---------------------------------------------------------------------------------------------------------------------

DOM.isVisible = function(elem, partial, parent) {
    var style = DOM.getStyle(elem);
    if ( '0' === style.opacity || 'none' === style.display || 'hidden' === style.visibility ) {
        return false;
    }

    var rect = DOM.windowRect(elem);
    if ( rect.top == rect.bottom ) {
        return false;
    }

    var top = partial ? rect.bottom : rect.top;
    var bottom = partial ? rect.top : rect.bottom;

    var viewRect = DOM.windowRect(parent || elem.parentNode);
    return ((bottom <= viewRect.bottom) && (top >= viewRect.top));
}.try(false);

jQuery.prototype.isVisible = function(partial) {
    return DOM.isVisible(this.elem(), partial);
}.try(false);

// ---------------------------------------------------------------------------------------------------------------------

DOM.scrollbarWidth = function() {
    var div = document.createElement('div');
    div.className = 'scrollbar-measure';
    document.body.appendChild(div);
    var width = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return width;
}.try(null);
