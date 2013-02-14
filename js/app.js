define([
	"jquery",
	"underscore",
	"backbone",
	"communicator",
	"home",
	"device",
    "location",
	"bootstrap"
], function($, _, Backbone, Communicator, Home, Device, Location) {

	// define the application router
	var AppRouter = Backbone.Router.extend({
        routes: {
            "" : "index"
        },

        // default route of the application
        index:function() {
            if (this.defaultView === undefined) {
                this.defaultView = new Location.Views.List();
            }
            this.defaultView.render();
        }
    });

	function initialize() {
		// Initialize the application-wide event dispatcher
        window.dispatcher = _.clone(Backbone.Events);

        // Setting the connection with the box
        window.communicator = new Communicator('ws://pandora.inrialpes.fr:1337');

        // Wait for the socket to be opened
        dispatcher.on("WebSocketOpen", function() {
            // Initialize the collection of locations
            window.locations = new Location.Collection();

            // Initialize the collection of devices
            window.devices = new Device.Collection();
        });

        // router of the application
        var appRouter;

    	// application router
        dispatcher.on("locationsReady", function() {
            dispatcher.on("devicesReady", function() {
                appRouter = new AppRouter();
                Backbone.history.start();

                if (navigator.splashscreen !== undefined) {
                    navigator.splashscreen.hide();
                }
            });
        });

	}

	return {
		initialize : initialize
	};
});