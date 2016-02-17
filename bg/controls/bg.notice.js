'use strict';
mixinTrial();

var notice = new function Notice() {
    var width    = 400,
        height   = 300,
        noticeId = null,
        ready    = null;

    // -----------------------------------------------------------------------------------------------------------------

    runtime.tabs.onMessage(function(msg, tab) {
        msg.ready && tab.windowId == noticeId && ready.resolve(noticeId);
    });

    var create = function() {
        !_.isPending(ready) && _.isNull(noticeId) && (ready = $.Trial()) && chrome.windows.create({
            url    : 'bg/controls/notice/notice.html',
            left   : Math.round(window.screen.availWidth - 18 - width),
            top    : Math.round(window.screen.availHeight - 18 - height),
            width  : width,
            height : height,
            type   : 'panel'
        }, window => noticeId = window.id);
        return ready;
    }.try(never);

    // -----------------------------------------------------------------------------------------------------------------

    chrome.windows.onRemoved.addListener(function(windowId) {
        windowId == noticeId && (noticeId = null);
    });

    chrome.windows.onFocusChanged.addListener(function() {
        !_.isNull(noticeId) && setTimeout(() => chrome.windows.getAll(function(windows) {
            !_.isNull(noticeId) && _.find(windows, window => window.id == noticeId) && chrome.windows.update(noticeId, {
                //drawAttention : true,
                //focused       : true
            });
        }), 99);
    });

    // -----------------------------------------------------------------------------------------------------------------

    Notice.prototype.define({
        alert : function(msg, timeout) {
            _.size(msg) && create().done(function() {
                runtime.sendMessage(_.assign({
                    notice : msg
                }, _.pickBy({
                    timeout : timeout
                }, _.is)));
            });
        }
    }.try(null));

};

