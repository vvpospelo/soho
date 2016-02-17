jQuery.prototype.initLinks = function() {
    if ( !this.data('linked') ) {
        var ava, name;
        this.selfFind('a').filter(':visible').each(function(index, link) {
            link.dataset.initial = true;
            switch ( index ) {
                case 0:
                    link.getElementsByTagName('img').length ? ava = link : null;
                    break;
                case 1:
                    ava && !link.getElementsByTagName('img').length ? name = link : null;
                    break;
            }
        });
        ava && API.tryPageID(ava.href) ? ava.dataset.ava = true : null;
        ava && name && (name.href == ava.href) ? name.dataset.name = true : null;
        this.dataset('linked', true);
    }
    return this;
}.try();

jQuery.prototype.cardAva = function() {
    return this.initLinks().find('a[data-ava]');
}.try($());

jQuery.prototype.cardName = function() {
    return this.initLinks().find('a[data-name]');
}.try($());

jQuery.prototype.linkCard = function() {
    return this.data('initial') ? this.closest('[data-linked]') : null;
}.try(null);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.cardRedirect = function(VKID, ready) {
    if ( VKID = API.ifVKID(VKID) && this.cardVKID(VKID) || this.cardVKID() ) {
        var ava  = this.cardAva(),
            name = this.cardName();
        if ( API.isProfile(VKID) ) {
            ava.ref(LNK.toMail(VKID)).actionVKID(VKID);
            !ready ? name.css('cursor', 'pointer').removeAttr('onclick').ref(LNK.toPage(VKID)).pageVKID(VKID) :
                name.css('cursor', 'help').removeAttr('href').attr('onclick', 'profiler.check();').actionVKID(VKID);
        } else {
            ava.ref(LNK.toPage(VKID)).pageVKID(VKID);
            name.ref(LNK.toPage(VKID)).pageVKID(VKID);
        }
    }
    return this;
}.try();

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.cardEnter = function() {
    var trial = $.Trial().setTimeout(TIME.minute), self = this,
        ava   = self.is('a') ? self : self.trigger('mouseenter').cardAva();
    $.when((LNK.noActive(ava.src()) || marker.isHidden(self.cardVKID())) ? self.tabuSwat() : self.markName()).always(function() {
        self.is(':visible') ? ava.trigger('mouseenter', trial) : trial.reject();
    });
    return trial;
}.try(already);

// ---------------------------------------------------------------------------------------------------------------------

jQuery.prototype.mark = function(cls) {
    return this.removeClass('nice warn tabu').addClass(cls || '') && already;
}.try(already);

jQuery.prototype.nice = function(hl) {
    return $(hl || this).mark('nice') && already;
}.try(already);

jQuery.prototype.warn = function(hl) {
    return $(hl || this).mark('warn') && already;
}.try(already);

jQuery.prototype.tabu = function(hl) {
    return $(hl || this).mark('tabu') && (hl ? this.mark('gray') : already);
}.try(already);

jQuery.prototype.swat = function(hl) {
    return this.tabu(hl) && this.fadeOut(TIME.fast) && $.Trial().setTimeout(TIME.fast + TIME.atom);
}.try(already);

jQuery.prototype.tabuSwat = function(hl) {
    return DOM.block.is ? this.swat(hl) : this.tabu(hl);
}.try(already);

