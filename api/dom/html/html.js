var HTML = API.HTML = new function() {

    var cache = new function() {

        var regNodes = {},
            regHeads = {},
            regAttrs = {},
            regExact = {};

        this.nodeRegexp = function(tag, flags) {
            flags = flags || 'gmi';
            return regNodes[tag + flags] = regNodes[tag + flags] ||
                new RegExp('(<\\s*' + tag + '(\\s[^>]*|)>)([\\s\\S]*?)(<\\s*\\/\\s*' + tag + '\\s*>)', flags);
        }.try(null);

        this.headRegexp = function(tags, flags) {
            flags = flags || 'gmi';
            return regHeads[tags + flags] = regHeads[tags + flags] ||
                new RegExp('(<\\s*(' + tags.replace(/[\s,]/g, '|') + ')\\s)([^>]*>)', flags);
        }.try(null);

        this.attrsRegexp = function(attrs, flags) {
            flags = flags || 'gmi';
            return regAttrs[attrs + flags] = regAttrs[attrs + flags] ||
                new RegExp('((' + attrs.replace(/[\s,]/g, '|') + ')\\s*=\\s*"([^"]*)")\\s*', flags);
        }.try(null);

        this.exactRegexp = function(word, flags) {
            flags = flags || 'gmi';
            return regExact[word + flags] = regExact[word + flags] ||
                new RegExp('(^|\\s)(' + word.replace(/[\s,]/g, '|') + ')($|\\s)', flags);
        }.try(null);

    };

    // --- Nodes Manipulate Lib ----------------------------------------------------------------------------------------

    this.extractNode = function(html, tag) {
        return (html.match(cache.nodeRegexp(tag)) || [])[0] || '';
    }.try('');

    this.headTag = function(head) {
        return (head = (head.match(/^(\<\s*(\w+)[^\>]*\>)$/m) || [])[2]) ? head.toLowerCase() : null;
    }.try(null);

    this.isClosedHead = function(head) {
        return /\/\s*\>$/im.test(head);
    }.try(false);

    this.tailTag = function(tail) {
        return (tail = (tail.match(/^(\<\s*\/\s*(\w+)\s*\>)$/m) || [])[2]) ? tail.toLowerCase() : null;
    }.try(null);

    this.eachHead = function(html, tags, replacer) {
        return _.isFunction(replacer) ? html.replace(cache.headRegexp(tags), function(match) {
            return replacer(match);
        }) : html;
    }.try('');

    // --- Attr Manipulate Lib -----------------------------------------------------------------------------------------

    this.extractAttr = function(html, attr) {
        return (html.match(cache.attrsRegexp(attr, 'mi')) || [])[3] || '';
    }.try('');

    this.setAttr = function(html, attr, value) {
        return html.replace(cache.headRegexp('\\w+', 'mi'), function() {
            return arguments[1] + attr + '="' + value + '" ' + arguments[3].replace(cache.attrsRegexp(attr), '');
        });
    }.try('');

    // --- Attrs Manipulate Lib ----------------------------------------------------------------------------------------

    this.replaceAttrs = function(html, attrs, replacer) {
        return html.replace(cache.attrsRegexp(attrs), _.isFunction(replacer) ? function(match, full, attr, value) {
            return attr + '="' + replacer(value) + '" ';
        } : replacer);
    }.try('');

    this.renameAttrs = function(html, attrs, replacer) {
        return html.replace(cache.attrsRegexp(attrs), _.isFunction(replacer) ? function(match, full, attr, value) {
            return replacer(attr) + '="' + value + '" ';
        } : replacer);
    }.try('');

    this.removeAttrs = function(html, attrs) {
        return html.replace(cache.attrsRegexp(attrs), '');
    }.try('');

    this.extractAttrs = function(html, attrs) {
        return html.match(cache.attrsRegexp(attrs)) || [];
    }.try([]);

    // --- Classes Manipulate Lib --------------------------------------------------------------------------------------

    this.hasClass = function(classes, cls) {
        return cache.exactRegexp(cls, 'mi').test(classes);
    }.try(false);

    this.addClass = function(classes, value) {
        (value || '').split(/\s/).forEach(cls => !HTML.hasClass(classes, cls) ? classes += ' ' + cls : false);
        return classes;
    };

};

