DOM.events = {
    mouse   : 'mouseover mouseenter mouseleave mouseout click mousedown mousemove',
    onmouse : 'onmouseover onmouseenter onmouseleave onmouseout onclick onmousedown onmousemove',
    onclick : 'onclick onmousedown',
    ontouch : 'ontouchstart ontouchmove',
    wheel   : ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll']
};

// ---------------------------------------------------------------------------------------------------------------------

DOM.stopEvent = function(event) {
    event.preventDefault();
};

DOM.eventsOff = function(events) {
    for ( var event of  events )
        document.addEventListener(event, DOM.stopEvent, false);
};

DOM.eventsOn = function(events) {
    for ( var event of  events )
        document.removeEventListener(event, DOM.stopEvent, false);
};

// ---------------------------------------------------------------------------------------------------------------------

DOM.wheelOff = function() {
    return DOM.eventsOff(DOM.events.wheel);
};

DOM.wheelOn = function() {
    return DOM.eventsOn(DOM.events.wheel);
};

// ---------------------------------------------------------------------------------------------------------------------

DOM.cancelDefault = function(event) {
    event.cancelBubble = true;
    if ( event.stopPropagation ) {
        event.stopPropagation();
    }
    if ( event.preventDefault ) {
        event.preventDefault();
    }
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

DOM.fireEvent = function(element, event) {
    if ( document.createEventObject ) {
        return element.fireEvent('on' + event, document.createEventObject());
    } else {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(event, true, true);
        return !element.dispatchEvent(evt);
    }
}.try(null);

jQuery.prototype.fire = function(event) {
    this.each(function() {
        DOM.fireEvent(this, event);
    });
    return this;
}.try();

// ------------------------------------------------------------------------------------------------

String.prototype.clearOnMouse = function() {
    return HTML.removeAttrs(this, DOM.DOM.events.onmouse);
}.try();

String.prototype.clearOnClick = function() {
    return HTML.removeAttrs(this, DOM.events.onclick);
}.try();

// ------------------------------------------------------------------------------------------------

DOM.attrHandler = function(elem, attrs, handler) {
    (_.ifArray(attrs) || attrs.split(/[\s,]/)).forEach(function(attr) {
        var value = elem.getAttribute(attr);
        value ? elem.setAttribute(attr, handler(attr, value) || value) : null;
    });
    return elem;
}.try(null);

DOM.clearAttr = function(elem, attrs, noChilds) {
    attrs = _.ifArray(attrs) || attrs.split(/[\s,]/);
    !noChilds ? Array.from(elem.childNodes,
        child => child.nodeType == document.ELEMENT_NODE ? DOM.clearAttr(child, attrs, noChilds) : false) : null;
    attrs.forEach(attr => elem.removeAttribute(attr));
    return elem;
}.try(null);

// ------------------------------------------------------------------------------------------------

jQuery.prototype.clearAttr = function(attrs, noChilds) {
    return this.each(function() {
        DOM.clearAttr(this, attrs, noChilds);
    });
}.try();

jQuery.prototype.clearOnMouse = function(noChilds) {
    return this.clearAttr(DOM.events.onmouse, noChilds);
}.try();

jQuery.prototype.clearOnClick = function(noChilds) {
    return this.clearAttr(DOM.events.onclick, noChilds);
}.try();

jQuery.prototype.noClick = function(noChilds) {
    return this.clearOnClick(noChilds).removeAttr('href target');
}.try();

// ------------------------------------------------------------------------------------------------

DOM.keyPressed = function(pattern, keydown) {
    function diffKeys(obj, src) {
        return _.keys(_.pickBy(_.assignWith(_.pickBy(obj), _.pickBy(src), function(objValue, srcValue) {
            return !_.size(_.intersection(_.asArray(objValue), _.asArray(srcValue)));
        })));
    }

    return !_.size(diffKeys(pattern, keydown));
}.try();
