require([
    "domReady",
    "app"
], function (domReady, App) {

    Backbone.View.prototype.close = function() {
        this.remove();
        this.unbind();
    };

    // domReady is RequireJS plugin that triggers when DOM is ready
    domReady(function () {
        function onDeviceReady(desktop) {
            // Initialize the application-wide event dispatcher
            // window.dispatcher = _.clone(Backbone.Events);
            App.initialize();

            // Hiding splash screen when app is loaded
            if (desktop !== true) {
                navigator.splashscreen.hide();
            }
        }

        if (navigator.userAgent.match(/(iPad|iPod|iPhone|Android|Blackberry)/)) {
            // This is running on a device so waiting for deviceready event
            document.addEventListener('deviceready', onDeviceReady, false);
        } else {
            // On desktop don't have to wait for anything
            onDeviceReady(true);
        }
    });
});