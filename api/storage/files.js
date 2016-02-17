var FILES = API.FILES = new function() {

    var self = this,
        fs   = null;

    self.init = function(mb) {
        var ready = $.Trial();
        if ( !fs ) {
            function errorHandler(e) {
                ready.reject() && _.log(e.message);
            }

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            if ( window.requestFileSystem && navigator.webkitPersistentStorage.requestQuota &&
                window.File && window.FileReader && window.FileList && window.Blob ) {
                navigator.webkitPersistentStorage.requestQuota((mb || 99) * 1024 * 1024, function(grantedBytes) {
                    window.requestFileSystem(window.PERSISTENT, grantedBytes, function(fileSystem) {
                        fs = fileSystem;
                        ready.resolve(self);
                    }, errorHandler);
                }, errorHandler);
            }
            return ready;
        }
        return ready.resolve(self);
    };

    self.save = function(fileName, obj) {
        return self.init().then(function() {
            var trial = $.Trial();

            function errorHandler(e) {
                e.name != 'NotFoundError' ? trial.reject() && _.log(e.message) : null;
            }

            return fs.root.getFile(fileName, {
                    create : true
                }, function(fileEntry) {
                    fileEntry.createWriter(function(fileWriter) {
                        fileWriter.onerror = errorHandler;
                        fileWriter.onwriteend = trial.resolve.bind(trial);
                        fileWriter.write(new Blob([JSON.stringify(obj)], {
                            type : 'text/plain'
                        }));
                    }, errorHandler);
                }, errorHandler) || trial;
        });
    };

    self.read = function(fileName) {
        return self.init().then(function() {
            var trial = $.Trial();

            function errorHandler(e) {
                e.name != 'NotFoundError' ? trial.reject() && _.log(e.message) : null;
            }

            return fs.root.getFile(fileName, {}, function(fileEntry) {
                    fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            trial.resolve(JSON.parse(this.result));
                        };
                        reader.readAsText(file);
                    }, errorHandler);
                }, errorHandler) || trial;
        });
    };

};
