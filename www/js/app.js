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
		window.communicator = new Communicator('ws://prima16:8080');

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
		$("#settings-modal #valid-button").bind("click", onValidSettingsButton);
		$("#settings-modal .addr-server").bind("keyup", onValidSettingsButton);
		
		// listen to the event coming from the modal to handle network errors
		$("#lost-connection-modal #change-addr-server").bind("click", onChangeAddrServerButton);
		$("#lost-connection-modal #reconnect-button").bind("click", onReconnectButton);
		
		// listen to the communicator event when the connection has been lost and display an alert
		dispatcher.on("WebSocketClose", function() {
			$("#lost-connection-modal p.text-info").hide();
			$("#lost-connection-modal p.text-error").show();
			$("#lost-connection-modal p.text-error").html("La connexion a &eacute;t&eacute; interrompue.");
			$("#lost-connection-modal").modal("show");
		});
		
		// set current server address and port in the modal for settings
		$("#settings-modal .addr-server").val(communicator.getServerAddr().split("://")[1].split(":")[0]);
		$("#settings-modal .port-server").val(communicator.getServerAddr().split(":")[2]);
		
		// Initialize the communication layer
		communicator.initialize();
	}
	
	/**
	 * Callback when the user has validated new settings
	 * 
	 * @param e JS event
	 */
	function onValidSettingsButton(e) {
		if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
			dispatcher.on("locationsReady", function() {
				dispatcher.on("devicesReady", function() {
					// remove potential duplicated entries of devices in a place
					locations.forEach(function(l) {
						l.set({ devices : _.uniq(l.get("devices")) });
					});

					// hide the modal windows
					$("#settings-modal").modal("hide");
					$("#lost-connection-modal").modal("hide");
					
					// hide the information message for the next time the modal will appear
					$("#settings-modal p.text-info").hide();
					
					Backbone.history.stop();
					Backbone.history.start();
				});
			});
			
			// hide the error message it is displayed
			$("#settings-modal p.text-error").hide();
			
			// show the message to inform the user the connection is being established
			$("#settings-modal p.text-info").show();

			// set the new server address
			if ($("#settings-modal .addr-server") !== "") {
				// build the server address from the information given by the user
				var serverAddr = "ws://" + $("#settings-modal .addr-server").val() + ":";
				serverAddr += $("#settings-modal .port-server").val() === "" ? "8080" : $("#settings-modal .port-server").val();
				console.log(serverAddr);
				
				// set the new address
				communicator.setServerAddr(serverAddr);
			}
			
			// reconnect w/ to the new server
			communicator.reconnect();

			// set current server address and port in the modal
			$("#settings-modal .addr-server").val(communicator.getServerAddr().split("://")[1].split(":")[0]);
			$("#settings-modal .port-server").val(communicator.getServerAddr().split(":")[2]);
		}
	}
	
	/**
	 * Callback when the user has clicked on the button to change the address of the server in the modal to manage network errors
	 */
	function onChangeAddrServerButton() {
		$("#lost-connection-modal").modal("hide");
		$("#settings-modal").modal("show");
	}
	
	/**
	 * Callback when the user has clicked on one of the buttons to try to reconnect to the server
	 */
	function onReconnectButton() {
		// show in the modal error the information that the connection is being established
		$("#lost-connection-modal p.text-error").hide();
		$("#lost-connection-modal p.text-info").show();
		
		communicator.reconnect();
	}

	return {
		initialize : initialize
	};
});
