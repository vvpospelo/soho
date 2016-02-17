'use strict';

// --- Port (Long-lived connections) // https://developer.chrome.com/extensions/messaging#connect ----------------------

function PortListener() {

    var sender   = $('#port_sender'),
        receiver = $('#port_receiver');

    PortListener.superclass.constructor.apply(this, _.concat([function() {
        receiver.onChildMutation(function(addedNodes) {
            _.map(addedNodes, node => this.invoke(JSON.parse(node.textContent)));
        }.bind(this));
    }.bind(this), arguments]));

    this.define({
        post  : (msg) => sender.append(document.createTextNode(JSON.stringify(msg))),
        empty : () => _.map([receiver, sender], node => node.empty())
    }.try(null));

}

// --- Live (Simple one-time requests) // https://developer.chrome.com/extensions/messaging#simple ---------------------

function LiveListener() {

    var sender   = $('#live_sender'),
        receiver = $('#live_receiver');

    LiveListener.superclass.constructor.apply(this, _.concat([function() {
        receiver.onChildMutation(function(addedNodes) {
            _.map(addedNodes, node => this.invoke(JSON.parse(node.textContent)));
        }.bind(this));
    }.bind(this), arguments]));

    this.define({
        post  : (msg) => sender.append(document.createTextNode(JSON.stringify(msg))),
        empty : () => _.map([receiver, sender], node => node.empty())
    }.try(null));

}

// --- Window ----------------------------------------------------------------------------------------------------------

function WindowListener() {

    WindowListener.superclass.constructor.apply(this, _.concat([function() {
        window.addEventListener('message', event => this.invoke(event.data));
    }.bind(this), arguments]));

}

// --- Frame -----------------------------------------------------------------------------------------------------------

function FrameListener(contentWindow, portId) {
    portId = portId || _.uniqueId('port');

    FrameListener.superclass.constructor.apply(this, _.concat([function() {
        DOM.listener.listen(function(data) {
            data.portId == portId && this.invoke(data.msg);
        }.bind(this));
    }.bind(this), arguments]));

    this.define({
        post : function(msg) {
            contentWindow.postMessage({
                portId : portId,
                msg    : msg
            }, '*');
        }
    }.try(null));

}

// --- Storage --- // http://stackoverflow.com/questions/4679023/bug-with-chromes-localstorage-implementation ----------

function StorageListener(storage) {

    StorageListener.superclass.constructor.apply(this, _.concat([function() {
        window.addEventListener('storage', function(e) {
            this.invoke({}.entry(e.key, JSON.parse(e.newValue)));
        }.bind(this));
    }.bind(this), arguments]));

    this.define({
        post : function(msg) {
            _.forOwn(msg, (value, key) => storage.setItem(key, JSON.stringify(value)));
        }
    }.try(null));

}

// ---------------------------------------------------------------------------------------------------------------------
// --- ClientListener --------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

function ClientListener() {

    var listeners = {
        live : new LiveListener(),
        port : new PortListener()
        // window  : new WindowListener(),
        // storage : new StorageListener(localStorage),
        // session : new StorageListener(sessionStorage)
    };

    var map = function(type, method) {
        var args = _.drop(arguments, 2);
        _.map(_.is(type) && _.pick(listeners, type) || listeners, listener => (function(method) {
            _.isFunction(method) && method.apply(listener, args);
        })(listener[method]));
        return this;
    }.bind(this);

    this.define({

        listen : function(handler, type) { return map(type, 'listen', handler); },
        remove : function(handler, type) { return map(type, 'remove', handler); },
        clear  : function(type) { return map(type, 'clear'); },
        post   : function(msg, type) { return map(type, 'post', msg); }.argObj(true),
        empty  : function(type) { return map(type, 'empty'); }

    }.try());

}
