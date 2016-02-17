mixinDebug();

_.assign(TIME, INI.timeout = {

    atom    : 9, // smallest time period for CPU health
    enter   : 149, // comfort UI reaction
    pause   : 199, // comfort pause for next request sets
    error   : 1499, // error request pause
    guarant : 1699, // guaranteed time for one request before next one > then 1 second!
    retry   : 3.000 * 1000 * 60, // check retry pause
    check   : 21.00 * 1000 * 60,

    // -----------------------------------------------------------------------------------------------------------------

    year   : 1000 * 60 * 60 * 24 * 365,
    month  : 1000 * 60 * 60 * 24 * 31,
    week   : 1000 * 60 * 60 * 24 * 7,
    day    : 1000 * 60 * 60 * 24,
    hour   : 1000 * 60 * 60,
    minute : 1000 * 60,
    second : 1000,
    fast   : 200,
    slow   : 600,

    // -----------------------------------------------------------------------------------------------------------------

    never  : Date.parse('01 Jan 2001 00:00'),
    future : Date.parse('23 Dec 2033 00:00'),

    // -----------------------------------------------------------------------------------------------------------------

    maxTimeout : 0x7FFFFFFF,
    notice     : 1000 * 4

});

// ---------------------------------------------------------------------------------------------------------------------

INI.timeViewed = 5 * TIME.day;
INI.ignoredFlag = -1;
INI.hiddenFlag = -2;

TIME.ifViewed = function(time) {
    return ((time = time || 0) < 0 && _.now() || time ) - _.now() + INI.timeViewed;
}.try(false);

TIME.isViewed = function(time) {
    return TIME.ifViewed(time) >= 0;
}.try(false);

// ---------------------------------------------------------------------------------------------------------------------

INI.redirectFlag = true;

INI.activeTimeLimit = new Date() - 93 * TIME.day;

INI.max_alerts = 24;

// ---------------------------------------------------------------------------------------------------------------------

INI.recentsLimit = 9900;
INI.dialogsDateMin = Date.parse('23 Dec 2006 00:00');

// --- Secure Utils ----------------------------------------------------------------------------------------------------

INI.isExpected = function(text) {
    return INI.phrasesRegExp && INI.phrasesRegExp.test(text);
};

// --- Cover Logic -----------------------------------------------------------------------------------------------------

INI.keyUncover = function(keydown) {
    return _.isPlain(keydown) && DOM.keyPressed(INI.uncoverKey, keydown) && ( INI.coverTimeout || TIME.year )
};

INI.tryUncover = function(openerTabId) {
    return !_.size(INI.uncoverKey) || openerTabId && (INI.coverTimeout || true)
};
