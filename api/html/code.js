var STR = API.STR = new function() {

    this.encodeEntities = function(string) {
        return jQuery('<div></div>').text(string || '').html();
    };

    this.decodeEntities = function(string) {
        return $('<div></div>').html(string || '').text();
    };

    this.normEOL = function(string) {
        return string.replace(/\r?\n/gim, '\n');
    };

    this.stripEOL = function(string) {
        return string.replace(/[\r\n]/gim, '');
    };

    this.regexp = {
        invisibleChars     : XRegExp('([\\p{C}])', 'gim'),
        nonNativeChars     : XRegExp('([^а-яёє-їґ\\w\\s])', 'gim'),
        insignificantChars : XRegExp('([^\\s\\p{L}])', 'gim')
    };

    this.unslash = function(str) {
        var regexp = /\\(([abfnrtv])|o?([0-7]{1,3})|x([\da-fA-F]{1,2})|.)/g;
        var symbols = { a : '\7', b : '\10', f : '\14', n : '\n', r : '\r', t : '\t', v : '\13' };
        return str.replace(regexp, function(full, asis, seq, oct, hex) {
            if ( seq ) {
                return symbols[seq] || seq;
            } else if ( oct || hex ) {
                return String.fromCharCode(parseInt(oct, oct ? 8 : 18));
            } else {
                return asis;
            }
        });
    };

    this.queryEncode = function(str) { // http://unicode-table.com/ru/#control-character
        var result = str.replace(STR.regexp.nonNativeChars, ' ');
        for ( var i = 0; i < result.length; i++ ) {
            var encoded = encodeURIComponent(String(result[i]));
            result = result.substring(0, i) + encoded + result.substring(i + 1, result.length);
            i += encoded.length;
        }
        return result;
    };

};

