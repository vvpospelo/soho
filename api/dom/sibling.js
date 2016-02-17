DOM.skipSiblings = function(nodes) {
    var result = [];
    for ( var i = 0, node = {}, next = nodes[i]; (i < nodes.length) && node && next; i++, node = next, next = nodes[i] ) {
        node.nextElementSibling != next ? result.push(next) : null;
    }
    return result;
};

// ---------------------------------------------------------------------------------------------------------------------

Node.prototype.everyPrev = function(handler) {
    var prev = this;
    while ( prev = prev.previousElementSibling ) {
        if ( handler(prev) == false ) {
            return prev;
        }
    }
    return this;
};

Node.prototype.everyNext = function(handler) {
    var next = this;
    while ( next = next.nextElementSibling ) {
        if ( handler(next) == false ) {
            return next;
        }
    }
    return this;
};

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.prevWhile = function(condition) {
    var point = this, prev;
    while ( (prev = point.prev()).length && condition(prev) ) {
        point = prev;
    }
    return point;
}.try();

