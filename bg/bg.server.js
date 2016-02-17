'use strict';

mixinTrial();

function Server() { }

Server.prototype.define({
    serve : function(msg, tab, server) {
        server = server || this;
        _.forOwn(_.pick(this.services, _.keys(msg)), function(service, key) {
            service(msg, tab, function(tabIDs, response) {
                (function(msg) {
                    _.size(msg) && server.post(tabIDs, msg);
                })(_.pickBy(_.assign(_.omit(msg, key), response)));
            })
        });
    }
}.try(null));

// ---------------------------------------------------------------------------------------------------------------------

function Port(services) {
    Port.superclass.constructor.apply(this, arguments);
    Port.prototype.defineValue('services', services);

    var ports  = {},
        server = this;

    function pick(tabIDs) {
        return _.omitBy(_.pick(ports, tabIDs), port => port.closed);
    }

    Port.prototype.define({
        post : function(tabIDs, msg) {
            _.map(pick(tabIDs), port => port.postMessage(msg));
        }
    }.try(null));

    runtime.onConnect(function(port) {
        var tab = port.sender.tab;
        port.onDisconnect.addListener(port => port.closed = true);

        ports[tab.id] = port;
        port.onMessage.addListener(msg => server.serve(msg, tab));
    });
}

Port.inherits(Server);

// ---------------------------------------------------------------------------------------------------------------------

function Live(services) {
    Live.superclass.constructor.apply(this, arguments);
    Live.prototype.defineValue('services', services);

    Live.prototype.define({
        post : function(tabIDs, msg) {
            runtime.tabs.sendMessage(tabIDs, msg);
        }
    }.try(null));

    runtime.tabs.onMessage(this.serve.bind(this));
}

Live.inherits(Server);

