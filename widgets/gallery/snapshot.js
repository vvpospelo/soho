jQuery.prototype.fixSnapmatrix = function(box) {
    var self = this, square = self.square(),
        xpoint = square.left + DOM.scrollbar.width, horizont = [xpoint],
        ypoint = square.top, vertical = [ypoint];

    while ( (xpoint += box.width) < square.right ) {
        horizont.push(xpoint);
    }
    while ( (ypoint += box.height) < square.bottom ) {
        vertical.push(ypoint);
    }
    vertical.push(square.bottom - 1);

    self.snapshot = [];
    vertical.forEach(function(y) {
        horizont.forEach(function(x) {
            self.snapshot.push({
                x : x,
                y : y
            });
        });
    });
    return self.snapshot;
}.try();

jQuery.prototype.needSnapshot = function() {
    var self = this;
    self.snapshot = self.snapshot || [];
    self.lastSnapi = self.lastSnapi || 0;

    function changed(index) {
        var snap = self.snapshot[index];
        return snap && document.elementFromPoint(snap.x, snap.y) != snap.node;
    }

    if ( self.lastSnapi ) {
        if ( changed(self.lastSnapi) ) {
            return true;
        }
    }
    if ( (self.lastSnapi + 1) < self.snapshot.length ) {
        if ( changed(self.lastSnapi + 1) ) {
            return true;
        }
    }
    return changed(0);
}.try();

jQuery.prototype.makeSnapshot = function() {
    var self = this, container = self.elem();
    self.snapshot = self.snapshot || [];
    self.lastSnapi = 0;
    self.snapshot.every(function(snap, index) {
        var node = document.elementFromPoint(snap.x, snap.y);
        if ( !node || (node.parentNode != container) ) {
            while ( index < self.snapshot.length ) {
                self.snapshot[index++].node = null;
            }
            return false;
        } else {
            self.lastSnapi = index;
            snap.node = node;
            return true;
        }
    });
    return self.snapshot;
}.try();

