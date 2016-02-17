var XHR = API.XHR = {
    regexp : {}
};

XHR.isAborted = function(xhr) {
    return _.is(xhr) && !xhr.getAllResponseHeaders();
}.try(false);

XHR.abort = function(xhr) {
    if ( _.is(xhr) && _.is(xhr.readyState) && (xhr.readyState != 4) ) {
        TIME.reject(xhr.abort());
    }
    return xhr;
}.try(null);

// --- Requests lib ----------------------------------------------------------------------------------------------------

XHR.visualRequest = function(options) {
    return ((options.url ? options.url : '') + (options.data ? ' ' + _.visual(options.data) : '')).normalize()
}.try('');

XHR.noResponse = function(source) {
    return !_.isString(source) || Boolean(source.indexOf('<title>Ошибка</title>') >= 0) || Boolean(source.indexOf('<title>404 Not Found</title>') >= 0);
}.try(true);

// ---------------------------------------------------------------------------------------------------------------------

XHR.splitResponse = function(source) {
    if ( !_.isString(source) ) {
        return [];
    }
    return source.split(/\<\!(int|json|bool|)\>/gmi) || [];
}.try([]);

XHR.searchResponse = function(source, key) {
    var result = [], is = false;
    XHR.splitResponse(source).forEach(function(part) {
        if ( is ) {
            result.push(part);
            is = false;
        }
        if ( part == key ) {
            is = true;
        }
    });
    return result;
}.try([]);

// ---------------------------------------------------------------------------------------------------------------------

XHR.regexp.html = /^\s*\<\s*(\!|)(\w+)[^\>]*\>([\s\S]*?)\<\s*\/(\w+)\s*\>\s*$/i;

XHR.isHTML = function(string) {
    return _.isString(string) && XHR.regexp.html.test(string);
}.try(false);

XHR.extractHTML = function(source) {
    return _.isString(source) ? XHR.splitResponse(source).map(string => XHR.isHTML(string) ? string : '').join('') : '';
}.try('');

// --- Safe Unlinked (Locked) jQuery -----------------------------------------------------------------------------------

XHR.lQuery = function(source) {
    return new lQuery('<div style="display : none; visibility: hidden;">' + XHR.extractHTML(source || '') + '</div>').children();
}.try($());

XHR.sQuery = function(source, tune) {
    return new sQuery(XHR.extractHTML(source || ''), tune);
}.try($());

// ---------------------------------------------------------------------------------------------------------------------

XHR.extractJSON = function(source) {
    return _.head(_.map(XHR.searchResponse(source, 'json'), JSON.parse));
}.try([]);

// ---------------------------------------------------------------------------------------------------------------------

XHR.responseHeader = function(source) {
    var header = XHR.searchResponse(source, 'int');
    return {
        offset : header.pop() || 0,
        volume : header.pop() || 0
    };
}.try({});

