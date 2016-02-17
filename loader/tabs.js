function Tabs(server) {

    var opened = {},
        self   = this;

    function extend(msg) {
        return _.assign(msg, _.pickBy({
            openerTabId : _.toNumber(API.dataset.opener)
        }, _.is));
    }

    // -------------------------------------------------------------------------------------------------------------

    self.open = function(url, options) {
        return server.serve({
            open : _.assign(extend({
                url : url
            }), options || {})
        }, JSON.stringify(url)).then(function(tab) {
            opened[tab.id] = tab;
            return tab.id;
        });
    }.try(never);

    self.reload = function() {
        return self.open(window.location.href, {
            reload : true
        });
    }.try(never);

    self.unbind = function(tabIDs) {
        opened = _.omit(opened, tabIDs);
    }.try(null);

    // -------------------------------------------------------------------------------------------------------------

    self.close = function(tabIDs) {
        return server.serve({
            close : _.no(tabIDs) || _.asArray(tabIDs)
        }, 'closed').then(self.unbind);
    }.try(never);

    self.closeAll = function() {
        return self.close(_.keys(opened));
    }.try(never);

    // -------------------------------------------------------------------------------------------------------------

    self.opener = function(msg) {
        return server.serve({
            opener : extend(msg)
        });
    }.try(never);

}

