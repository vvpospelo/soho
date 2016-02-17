'use strict';

function Imager(dataset, progress) {

    var self  = this,
        decor = API.dataset.root + 'require/png/bg/bg2.png';

    // -----------------------------------------------------------------------------------------------------------------

    var queue  = new Queue(),
        inload = new Queue(),
        inwork = new Queue((photo) => photo.stop && photo.stop());

    queue.rule(function() {
        return inload.length() < dataset.capacity;
    });

    iTube.reg({
        queue  : queue,
        inload : inload
    }, dataset.priority);

    // -----------------------------------------------------------------------------------------------------------------

    var showProgress = _.ifFunction(progress) && function() {
            progress(inload.state(), queue.state());
        } || function() { };

    function nextWhile() {
        iTube.nextWhile();
        showProgress();
    }

    // -----------------------------------------------------------------------------------------------------------------

    function Photo(node, src, priority, attempts) {

        var photo = this;

        function pickStyle(img) {
            function bg() {
                return Array.from(arguments, url => 'url(' + url + ')').join(', ');
            }

            var xRatio = (node.clientWidth - img.naturalWidth) / node.clientWidth,
                yRatio = (node.clientHeight - img.naturalHeight) / node.clientHeight;
            if ( xRatio > 0.09 || yRatio > 0.09 ) {
                if ( xRatio > 0.39 || yRatio > 0.39 ) {
                    node.classList.add('bg_extended');
                    node.style.background = bg(decor, img.src);
                } else {
                    node.classList.add(yRatio > 0 ? 'bg_natural_center' : 'bg_natural');
                    node.style.background = bg(img.src, decor, img.src);
                }
            } else {
                node.style.background = bg(img.src);
            }
        }

        function onLoad() {
            src.shift();
            node && pickStyle(this);
            src.length && new Photo(null, src, priority + 1);
            inload.shift(priority);
            nextWhile();
        }

        function onError() {
            node ? (--attempts > 0) ? queue.push(photo, priority) : node.classList.add('img_error') : null;
            inload.shift(priority);
            nextWhile();
        }

        // -------------------------------------------------------------------------------------------------------------

        if ( src = (function pickSRC(src) {
                return src && _.asArray(src).map(src => _.isFunction(src) ? src($.data(node), dataset) : src);
            })(src || node.dataset.src || node.src) ) {

            priority = priority || 0;
            attempts = dataset.attempts || 0;

            photo.load = function() {
                var image = new Image();

                image.onload = onLoad;
                image.onerror = onError;

                photo.stop = function() {
                    image.onload = image.onerror = null;
                };

                inwork.push(photo, priority);
                inload.push(null, priority);

                image.src = src[0];
            };

            photo.visual = function() {
                return src;
            };

            queue.push(photo, priority);
        }
    }

    self.define({
        queuePhotos : function(nodes) {
            _.map(nodes, node => new Photo(node));
            nextWhile();
        }.try(null),
        reset       : function() {
            _.map([inwork, queue, inload], queue => queue.reset());
            showProgress();
            return already;
        }.try(never)
    }).reset();

    return $.Trial().resolve(self);

}

