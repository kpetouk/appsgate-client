define([
	"jquery",
	"underscore",
	"backbone",
	"communicator",
	"home",
	"device",
    "location",
    "program",
	"bootstrap"
], function($, _, Backbone, Communicator, Home, Device, Location, Program) {

	// define the application router
	var AppRouter = Backbone.Router.extend({
        routes: {
            "" : "index"
        },

        /* initialize:function() {
            this.currentView = 
        }, */

        // default route of the application
        index:function() {
            /* if (this.defaultView === undefined) {
                this.defaultView = new Location.Views.List();
            }
            this.defaultView.render(); */
            this.showView(new Location.Views.List());
        },

        showView:function(view) {
            if (this.currentView) {
                this.currentView.remove();
                this.currentView.unbind();
            }

            this.currentView = view;
            this.currentView.render();
            // console.log(this.currentView.el);
            $("#container").html(this.currentView.el);
        }
    });

	function initialize() {
		// Initialize the application-wide event dispatcher
        window.dispatcher = _.clone(Backbone.Events);

        // Setting the connection with the box
        // window.communicator = new Communicator('ws://prima5.inrialpes.fr:1337');
        // window.communicator = new Communicator("ws://placetouch-0c60a.local:8080");
        window.communicator = new Communicator("ws://192.168.2.3:8080");
        // window.communicator = new Communicator("ws://:8080");
        // window.communicator = new Communicator("ws://192.168.2.4:1337");

        // Wait for the socket to be opened
        dispatcher.on("WebSocketOpen", function() {
            // Initialize the collection of locations
            window.locations = new Location.Collection();
            // window.locations = {};

            // Initialize the collection of devices
            window.devices = new Device.Collection();

            // Initialize the collection of programs
            // window.programs = new Program.Collection();
        });

        // router of the application
        // window.appRouter;

        // main router of the application
        window.appRouter; // = new AppRouter();

    	// application router
        dispatcher.on("locationsReady", function() {
            dispatcher.on("devicesReady", function() {

                window.appRouter = new AppRouter();
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