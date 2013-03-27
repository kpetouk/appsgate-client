require([
    "domReady",
    "app"
], function (domReady, App) {

    // add a close method to all the views for convenience - see appRouter for usage
    Backbone.View.prototype.close = function() {
        this.remove();
        this.unbind();
    };

    // domReady is RequireJS plugin that triggers when DOM is ready
    domReady(function () {
        function onDeviceReady(desktop) {
            // Initialize the application-wide event dispatcher
            App.initialize();

            // Hiding splash screen when app is loaded
            if (desktop !== true) {
                navigator.splashscreen.hide();
            }
        }

        if (navigator.userAgent.toLowerCase().match(/(ipad|ipod|iphone|android|blackberry)/)) {
            // This is running on a device so waiting for deviceready event
            document.addEventListener('deviceready', onDeviceReady, false);
        } else {
            // On desktop don't have to wait for anything
            onDeviceReady(true);
        }
    });
});