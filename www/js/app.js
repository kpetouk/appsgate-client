define([
	"jquery",
	"underscore",
	"backbone",
	"raphael",
	"communicator",
	"home",
	"device",
    "location",
    "program",
	"bootstrap"
], function($, _, Backbone, Raphael, Communicator, Home, Device, Location, Program) {

	// define the application router
	var AppRouter = Backbone.Router.extend({
        routes: {
            "" : "index"
        },

        // default route of the application
        index:function() {
            this.showView(new Location.Views.List());
        },

        showView:function(view) {
            if (this.currentView) {
				// manage raphaeljs objects
				if (typeof colorWheel !== "undefined") {
					colorWheel.remove();
					delete colorWheel;
				}
				
                this.currentView.remove();
                this.currentView.unbind();
            }

            this.currentView = view;
			$(".body-content").html(this.currentView.el);
			this.currentView.render();
        }
    });

	function initialize() {
		// Initialize the application-wide event dispatcher
        window.dispatcher = _.clone(Backbone.Events);

        // Setting the connection with the box
		window.communicator = new Communicator('ws://prima22.inrialpes.fr:8080');
        // window.communicator = new Communicator("ws://placetouch-0c60a.local:8080");
        // window.communicator = new Communicator("ws://192.168.2.3:8080");
		// window.communicator = new Communicator("ws://194.199.23.138:8080");
		// window.communicator = new Communicator("ws://127.0.0.1:8080");

        // Wait for the socket to be opened
        dispatcher.on("WebSocketOpen", function() {
            // Initialize the collection of locations
            window.locations = new Location.Collection();

            // Initialize the collection of devices
            window.devices = new Device.Collection();

            // Initialize the collection of programs
            // window.programs = new Program.Collection();
        });

        // main router of the application
        window.appRouter; // = new AppRouter();

    	// application router
        dispatcher.on("locationsReady", function() {
            dispatcher.on("devicesReady", function() {
                // dispatcher.on("programsReady", function() {
					console.log("ok");
                    window.appRouter = new AppRouter();
                    Backbone.history.start();

                    if (navigator.splashscreen !== undefined) {
                        navigator.splashscreen.hide();
                    }
                // });
            });
        });
		
		// hide the button to flash devices if there is no camera
		if (!navigator.camera) {
			$("#flash-device-button").hide();
		}
		
		// listen to the event coming from the button to flash a device
		$("#flash-device-button").on("click", function() {
			// launch the window to flash a device
			window.plugins.barcodeScanner.scan(
				function(result) {
					if (result.cancelled) {
						console.log("the user cancelled the scan");
					} else {
						if (typeof devices.get(result.text) !== "undefined") {
							appRouter.navigate("#devices/" + result.text, { trigger : true });
						} else {
							navigator.notification.alert(
								"Dispositif non reconnu",
								null,
								"Information"
							);
						}
					}
				},
				function(error) {
					console.log("scanning failed: " + error);
				}
			);
		});

	}

	return {
		initialize : initialize
	};
});
