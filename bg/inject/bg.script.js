'use strict';

function injectData(dataset) {
    return "Object.assign(document.documentElement.dataset, JSON.parse('" + JSON.stringify(dataset) + "'));\r\n";
}

function injectCode() { // --- On this stage don't use head or body tags ! ---------------------------------------------

    var html    = document.documentElement,
        dataset = html.dataset;

    if ( window.top == window.self && chrome && chrome.runtime && !dataset.connected ) {

        (function(listener) {

            var host = dataset.host;

            // --- Once (Simple one-time requests) // https://developer.chrome.com/extensions/messaging#simple ---------
            function send(msg) { // safety send
                chrome.runtime && chrome.runtime.getManifest() && chrome.runtime.sendMessage(host, msg, function() { });
            }

            // --- Port (Long-lived connections) // https://developer.chrome.com/extensions/messaging#connect ----------
            var port = chrome.runtime.connect(host, {});
            port.onDisconnect.addListener(() => (port.closed = true) && delete dataset.connected);

            function post(msg) { // safety post
                !port.closed && port.postMessage(msg);
            }

            dataset.connected = true; // -------------------------------------------------------------------------------

            // --- JSON node mutation link -----------------------------------------------------------------------------

            function onMutation(type, role, handler) {
                new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        Array.from(mutation.addedNodes).map(function(node) {
                            try {
                                handler(JSON.parse(node.textContent));
                            } catch ( e ) { }
                        });
                    });
                }).observe(listener.querySelector('#' + type + '_' + role), {
                    childList : true
                });
            }

            function pass(type, role, msg) {
                return listener.querySelector('#' + type + '_' + role).appendChild(document.createTextNode(JSON.stringify(msg))) || msg;
            }

            // ---------------------------------------------------------------------------------------------------------

            if ( !listener ) {

                listener = document.createElement('div');
                listener.hidden = true;
                listener.innerHTML =
                    '<div id="live_sender" hidden></div><div id="live_receiver" hidden></div> \
                    <div id="port_sender" hidden></div><div id="port_receiver" hidden></div> \
                    <div id="error_debug" hidden></div><div id="warn_debug" hidden></div>';
                html.appendChild((listener.id = 'listener') && listener);

                dataset.host = dataset.host || location.host;
                dataset.root = dataset.root || location.origin + '/';
                dataset.start = dataset.start || new Date().getTime();

                window.onkeydown = function(e) {
                    pass('live', 'sender', {
                        keydown : {
                            keyCode  : e.keyCode,
                            shiftKey : e.shiftKey,
                            ctrlKey  : e.ctrlKey,
                            altKey   : e.altKey
                        }
                    });
                };

                (function() { // --- closure cover logic ---------------------------------------------------------------

                    let reload = document.createElement('div');
                    html.appendChild((reload.id = 'reload') && reload);
                    reload.onclick = location.reload;

                    let cover = document.createElement('div');
                    html.appendChild((cover.id = 'cover') && cover);

                    let coverTimeout, iCover,
                        recover = function recover(msg) {
                            if ( coverTimeout ) {
                                ['keydown', 'dialogs', 'ready', 'uncover'].map(function(key) {
                                    if ( msg[key] ) {
                                        clearTimeout(iCover);
                                        iCover = setTimeout(() => html.classList.remove('uncover'), coverTimeout);
                                    }
                                });
                            }
                        },
                        uncover = function uncover(msg) {
                            ['ready', 'uncover'].map(function(key, value) {
                                if ( value = msg[key] || 0 ) {
                                    value > 1 && (coverTimeout = value);
                                    html.classList.add(key);
                                    window.focus();
                                }
                            });
                            recover(msg);
                        };

                    setTimeout(() => ['live', 'port'].map(function(type) {
                        onMutation(type, 'sender', recover);
                        onMutation(type, 'receiver', uncover);
                    }), 0);

                })();

                setTimeout(() => ['live', 'port'].map(function(type) { // --- closure exception logic ------------------
                    onMutation(type, 'receiver', function debug(msg) {
                        ['error', 'warn'].map(function(etype, stack) {
                            if ( stack = msg[etype] ) {
                                html.classList.add('ready');
                                pass(etype, 'debug', stack);
                                pass(type, 'sender', {
                                    opener : msg
                                });
                            }
                        });
                    });
                }), 0);

                setTimeout(() => [send, post].map(handler => handler({
                    inject : true
                })), 9);

            }

            // ---------------------------------------------------------------------------------------------------------

            function onListener(type, role, handler) {
                handler(function(msg) {

                    function apply(srcs) {
                        srcs.map(function(src) {
                            var script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('src', dataset.root + src);
                            script.onload = () => html.removeChild(script);
                            html.appendChild(script);
                        });
                    }

                    function inject(code, script) {
                        script = document.createElement('script');
                        script.setAttribute('type', 'text/javascript');
                        script.appendChild(document.createTextNode(code));
                        html.appendChild(script);
                        html.removeChild(script);
                    }

                    msg.code ? eval(msg.code) :
                    msg.apply ? apply(msg.apply) :
                    msg.inject ? inject(msg.inject) : pass(type, role, msg);

                });
            }

            setTimeout(function() {

                onMutation('live', 'sender', send);
                onListener('live', 'receiver', handler => chrome.runtime.onMessage.addListener((msg, sender) => sender.id == host && handler(msg)));

                onMutation('port', 'sender', post);
                onListener('port', 'receiver', handler => port.onMessage.addListener(handler));

            }, 0);

        })(html.querySelector('#listener'));
    }
}
