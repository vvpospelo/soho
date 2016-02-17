window.onload = function() {

    var runtime = chrome.runtime,
        closeTimeout, forecast, countInt,
        notice  = document.querySelector('#notice'),
        counter = document.querySelector('#counter');

    function countdown(timeout, gap) {
        function timeLeft(ms, days) {
            return ((days = Math.floor(ms / 86400000)) ? days + 'd ' : '') +
                new Date(ms - days * 86400000).toUTCString().split(' ')[4];
        }

        clearTimeout(countInt);
        countInt = setInterval(function() {
            counter.innerText = timeLeft(timeout -= gap);
        }, gap = gap || 99);
    }

    function showTime(timeout, now) {
        clearTimeout(closeTimeout);
        now = new Date().getTime();
        forecast = Math.max(forecast || 0, now + (timeout || 4000));
        closeTimeout = setTimeout(window.close, forecast - now);
        countdown(forecast - now);
    }

    runtime.onMessage.addListener(function(msg) {
        if ( msg.notice ) {
            showTime(msg.timeout);
            for ( var key in msg.notice ) {
                var row = notice.querySelector('#' + key);
                if ( !row ) {
                    row = document.createElement('tr');
                    row.innerHTML = '<td class="title">' + key + '<td><td class="notice"><td>';
                    notice.appendChild((row.id = key) && row);
                }
                row.querySelector('.notice').innerHTML = msg.notice[key];
            }
        }
    });

    document.onkeydown = function(e) {
        e.shiftKey && e.ctrlKey && [37, 38, 39, 40].indexOf(e.keyCode) >= 0 && window.close();
    };

    runtime.sendMessage({
        ready : true
    }, function() {});

};
