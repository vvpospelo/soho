function sQuery(source, tune) {

    var blank    = Boolean(!source),
        settings = _.assign({}, tune || {}),

        self     = this,
        tag      = null,

        head     = '',
        tail     = '',

        text     = [''],
        childs   = [],

        cache    = {
            attrs     : {},
            innerText : '',
            innerHTML : ''
        };

    self.isBlank = function() {
        return blank;
    };

    // --- sQuery access -----------------------------------------------------------------------------------------------

    self.fitHTML = function(html) {
        return head + (html instanceof HTMLElement ? html.outerHTML :
                       ( html instanceof sQuery || html instanceof jQuery ) ? html.outerHTML() : html || '') + tail;
    };

    self.remove = function() {
        tag = null;

        head = tail = '';

        text = [''];
        childs = [];

        cache = {
            attrs     : {},
            innerText : '',
            innerHTML : ''
        };
        return self;
    };

    // --- reparsable --------------------------------------------------------------------------------------------------

    self.innerHTML = function(nocache) {
        nocache = nocache || !settings.cache || !cache.innerHTML;
        var innerHTML = nocache ? text[0] + childs.map(function(child, index) {
            return child.outerHTML() + text[index + 1];
        }).join('') : cache.innerHTML;
        return nocache ? innerHTML : cache.innerHTML = innerHTML;
    };

    self.innerText = function(nocache) {
        nocache = nocache || !settings.cache || !cache.innerText;
        var innerText = nocache ? text[0] + childs.map(function(child, index) {
            return child.innerText() + text[index + 1];
        }).join('') : cache.innerText;
        return _.unescape(nocache ? innerText : cache.innerText = innerText);
    };

    self.outerHTML = function(nocache) {
        return self.fitHTML(self.innerHTML(nocache));
    };

    // -----------------------------------------------------------------------------------------------------------------

    self.html = function() {
        return self.fitHTML(text.join(''));
    };

    self.text = function() {
        return _.unescape(text.join(''));
    };

    // --- Attr Access Lib ---------------------------------------------------------------------------------------------

    self.tag = function() {
        return tag = tag || HTML.headTag(head);
    };

    self.attr = function(attr, value) {
        if ( _.isPlain(attr) ) {
            _.map(attr, (value, key) => self.attr(key, value));
            return self;
        } else {
            if ( _.is(value) ) {
                head = HTML.setAttr(head, attr, value);
                cache.attrs[attr] = value;
                return self;
            }
            return cache.attrs[attr] = cache.attrs[attr] ||
                HTML.extractAttr(head, attr);
        }
    };

    self.removeAttrs = function(attrs) {
        head = HTML.removeAttrs(head, attrs);
        cache.attrs = _.omit(cache.attrs, attrs);
        return self;
    };

    // -----------------------------------------------------------------------------------------------------------------

    self.id = function(value) {
        return self.attr('id', value);
    };

    self.classes = function(value) {
        return self.attr('class', value);
    };

    self.hasClass = function(value) {
        return HTML.hasClass(self.classes(), value);
    };

    self.addClass = function(classes) {
        return self.classes(HTML.addClass(self.classes(), classes));
    };

    self.dataset = function(data, value) {
        if ( _.isPlain(data) ) {
            _.map(data, (value, key) => self.dataset(key, value));
        } else {
            return self.attr('data-' + data, value);
        }
        return self;
    };

    // --- sQuery Array --------------------------------------------------------------------------------------------------

    self.children = function(selector, selected) {
        selected = selected || [];
        !blank ? childs.forEach(elem => elem.is(selector) ? selected.push(elem) : false) : null;
        return selected;
    };

    self.find = function(selector, selected) {
        selected = self.children(selector, selected);
        !blank ? childs.forEach(elem => elem.find(selector, selected)) : null;
        return selected;
    };

    // --- Find sQuery ---------------------------------------------------------------------------------------------------

    self.child = function(selector) {
        if ( !blank ) {
            if ( _.isNumeric(selector) ) {
                return childs[selector] || new sQuery();
            }
            for ( var i = 0; i < childs.length; i++ ) {
                var selected = childs[i];
                if ( selected.is(selector) ) {
                    return selected;
                }
            }
        }
        return new sQuery();
    };

    self.first = function(selector) {
        if ( !blank ) {
            if ( selector ) {
                for ( var i = 0; i < childs.length; i++ ) {
                    var selected = childs[i];
                    if ( selected.is(selector) ) {
                        return selected;
                    } else {
                        selected = selected.first(selector);
                        if ( !selected.isBlank() ) {
                            return selected;
                        }
                    }
                }
            } else {
                return childs[0] || new sQuery();
            }
        }
        return new sQuery();
    };

    self.last = function(selector) {
        if ( !blank ) {
            if ( selector ) {
                for ( var i = childs.length - 1; i >= 0; i-- ) {
                    var selected = childs[i];
                    if ( selected.is(selector) ) {
                        return selected;
                    } else {
                        selected = selected.last(selector);
                        if ( !selected.isBlank() ) {
                            return selected;
                        }
                    }
                }
            } else {
                return childs[childs.length - 1] || new sQuery();
            }
        }
        return new sQuery();
    };

    // -----------------------------------------------------------------------------------------------------------------

    self.is = function(selector) {
        var match = !blank;
        match && selector ? (selector.match(/[\#\.]?\w+/gm) || []).every(function(param) {
            switch ( param.charAt(0) ) {
                case '.' :
                    if ( !self.hasClass(param.slice(1)) ) {
                        return match = false;
                    }
                    break;
                case '#' :
                    if ( self.id() != param.slice(1) ) {
                        return match = false;
                    }
                    break;
                default :
                    if ( self.tag() != param ) {
                        return match = false;
                    }
            }
            return true;
        }) : null;
        return match;
    };

    // --- Utils -------------------------------------------------------------------------------------------------------

    self.size = function() { // approximately
        return !blank ? head.length + tail.length + JSON.stringify(text).length +
        (childs.length ? eval(childs.map(child => child.size()).join('+')) : 0) + JSON.stringify(cache).length : 0;
    };

    self.visual = function(tune, depth) {
        depth = depth || 0;
        return (function decor(tree) {
            return _.size(_.lines(tree)) > 7 ? tree.replace(/^\d/m, '.') : tree.replace(/^\d/gm, ' ');
        })(_.visual(childs.map(function(child, index) {
            return (child.visual(tune, depth + 1) + text[index + 1]);
        }), {
            comma    : ' ',
            eoline   : true,
            quotes   : ['', ''],
            space    : String(depth).slice(-1) + '   ',
            brackets : [_.unescape(head) + text[0], tail]
        }));
    };

    // --- Atom Type ---------------------------------------------------------------------------------------------------

    if ( !blank ) {

        const atomBlank  = 0,
              atomHead   = 1,
              atomOpened = 2,
              atomScript = 3,
              atomText   = 4,
              atomTail   = 5;

        function textTag(tag) {
            return tag == 'br';
        }

        function closedTag(tag) { // http://ejohn.org/files/htmlparser.js
            return ['img', 'link', 'area', 'base', 'basefont', 'br', 'col', 'frame',
                    'hr', 'input', 'isindex', 'meta', 'param', 'embed'].indexOf(tag) >= 0;
        }

        function atomType(atoms, atom) {
            if ( _.isBlank(atom) ) {
                return atomBlank;
            }
            var tail = HTML.tailTag(atom);
            if ( tail ) {
                if ( closedTag(tail) ) {
                    return atomBlank;
                } else {
                    if ( tail == self.tag() ) {
                        return atomTail;
                    } else {
                        atoms.unshift('</' + self.tag() + '>');
                        return atomOpened;
                    }
                }
            } else {
                var head = HTML.headTag(atom);
                if ( head && !textTag(head) ) {
                    return atomHead;
                } else {
                    return self.tag() == 'script' ? atomScript : atomText;
                }
            }
        }

        function joinScript(atoms) {
            var script = '';
            while ( atoms.length ) {
                if ( HTML.tailTag(atoms[0]) == 'script' ) {
                    return script;
                } else {
                    if ( HTML.headTag(atoms[0]) == 'script' ) {
                        script += atoms.shift() + joinScript(atoms);
                    }
                    script += atoms.shift();
                }
            }
            return script;
        }

        // -----------------------------------------------------------------------------------------------------------------

        var atoms = [];

        if ( _.isArray(source) ) {
            atoms = source;
            head = atoms.shift();
            if ( settings.eachHead ) {
                head = settings.eachHead(head);
            }
        } else {
            atoms = source.split(/(\<\s*\w+[^\>]*\>|\<\s*\/\s*\w+\s*\>)/gm);
            head = '<html>';
            tail = '</html>';
        }

        return !closedTag(tag = self.tag()) && !HTML.isClosedHead(head) ? (function joinAtoms(atoms) {
            if ( _.isString(atoms[0]) ) {
                var type = atomType(atoms, atoms[0]);
                if ( type == atomBlank ) {
                    atoms.shift();
                } else {
                    if ( type != atomOpened ) {
                        if ( type == atomTail ) {
                            tail = atoms.shift();
                            return self;
                        } else {
                            if ( type == atomScript || type == atomText ) {
                                var atom = atoms.shift();
                                if ( type == atomScript ) {
                                    atom += joinScript(atoms);
                                }
                                text[text.length - 1] += atom;
                                if ( settings.cache ) {
                                    cache.innerText += atom;
                                    cache.innerHTML += atom;
                                }
                            } else {
                                text.push('');
                                var child = new sQuery(atoms, settings);
                                childs.push(child);
                                if ( settings.cache ) {
                                    cache.innerText += child.innerText();
                                    cache.innerHTML += child.outerHTML();
                                }
                            }
                        }
                    }
                }
                joinAtoms(atoms);
            }
            return self;
        })(atoms) : self;
    }

    return self;

}

