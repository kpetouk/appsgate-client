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
			this.showMenuView(new Location.Views.Menu());
			this.showView(new Location.Views.Details({ model : locations.at(0) }));
        },

		// update the side menu w/ new content
		showMenuView:function(menuView) {
			// remove and unbind the current view for the menu
			if (this.currentMenuView) {
				this.currentMenuView.close();
			}
			
			this.currentMenuView = menuView;
			this.currentMenuView.render();
			$(".aside-menu-content").html(this.currentMenuView.$el);
		},

        showView:function(view) {
			// remove and unbind the current view
            if (this.currentView) {
				// manage raphaeljs objects
				if (typeof colorWheel !== "undefined") {
					colorWheel.remove();
					delete colorWheel;
				}
                this.currentView.close();
            }
			
			$("#edit-device-modal").remove();

            this.currentView = view;
			$(".body-content").html(this.currentView.$el);
			this.currentView.render();
        }
    });

	function initialize() {
		// Initialize the application-wide event dispatcher
        window.dispatcher = _.clone(Backbone.Events);

        // Setting the connection with the box
		window.communicator = new Communicator('ws://prima16.inrialpes.fr:8080');
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
			
			// dispatcher.off("WebSocketOpen");
        });

        // main router of the application
        window.appRouter; // = new AppRouter();

    	// application router
        dispatcher.on("locationsReady", function() {
            dispatcher.on("devicesReady", function() {
                // dispatcher.on("programsReady", function() {
				
					// remove potential duplicated entries of devices in a place
					locations.forEach(function(l) {
						l.set({ devices : _.uniq(l.get("devices")) });
					});
					
                    window.appRouter = new AppRouter();
                    Backbone.history.start();

                    if (navigator.splashscreen !== undefined) {
                        navigator.splashscreen.hide();
                    }
					
					dispatcher.off("locationsReady");
					dispatcher.off("devicesReady");
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
		
		// listen to the event coming from the valid button of the modal window for the settings
		$("#settings-modal #valid-button").bind("click", onValidSettings);
		$("#settings-modal .addr-server").bind("keyup", onValidSettings);
		
		// set current server address in the modal
		$("#settings-modal .addr-server").val(communicator.getServerAddr());
	}
	
	/**
	 * Callback when the user has validated new settings
	 * 
	 * @param e JS event
	 */
	function onValidSettings(e) {
		if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
			dispatcher.on("locationsReady", function() {
				dispatcher.on("devicesReady", function() {
					// remove potential duplicated entries of devices in a place
					locations.forEach(function(l) {
						l.set({ devices : _.uniq(l.get("devices")) });
					});

					$("#settings-modal").modal("hide");
					Backbone.history.stop();
					Backbone.history.start();
				});
			});

			// set the new server address
			communicator.close();
			communicator.setServerAddr($("#settings-modal .addr-server").val());
			communicator.initialize();

			// set current server address in the modal
			$("#settings-modal .addr-server").val(communicator.getServerAddr());
		}
	}

	return {
		initialize : initialize
	};
});
