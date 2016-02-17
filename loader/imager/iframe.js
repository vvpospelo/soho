if ( window.top != window.self ) {

    var images = [], port = window.name;

    function listen(handler) {
        window.addEventListener('message', function(event) {
            event.data.port === port ? handler(event.data.msg) : null;
        }, false);
    }

    function answer(msg) {
        parent.postMessage({
            port : port,
            msg  : msg
        }, '*');
    }

    // -----------------------------------------------------------------------------------------------------------------

    function abort() {
        images.forEach(img => img.onload = img.onerror = null);
        images = [];
        window.stop();
    }

    // -----------------------------------------------------------------------------------------------------------------

    function onLoad() {
        answer({
            done : this.image
        });
    }

    function onError() {
        answer({
            fail : this.image
        });
    }

    function image(image) {
        var img = new Image();

        img.onload = onLoad;
        img.onerror = onError;

        images.push(img);
        img.image = image;
        img.src = image.src;
    }

    // -----------------------------------------------------------------------------------------------------------------

    listen(function(msg) {
        msg.abort ? abort() : msg.image ? image(msg.image) : null;
    });

}
