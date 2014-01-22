define(function(require, exports, module) {
  "use strict";

  var _ = require("underscore");
  var $ = require("jquery");
  var Backbone = require("backbone");
	var Router = require("router");
	var Communicator = require("modules/communicator");

  // Alias the module for easier identification.
  var app = module.exports;

  // The root path to run the application through.
  app.root = "/";
	
	app.initialize = function() {
			// Define your master router on the application namespace and trigger all
			// navigation from this instance.
			app.router = new Router();

			// Initialize the application-wide event dispatcher
			window.dispatcher = _.clone(Backbone.Events);

			// Setting the connection with the box
			window.communicator = new Communicator('ws://localhost:8087');

			// Wait for the socket to be opened
			dispatcher.on("WebSocketOpen", function() {
			
				// delete the current collections if any - in case of a reconnection
				if (typeof places !== "undefined") {
					places.reset();
				}
			
				// wait for the data before launching the user interface
				var placesReady = false;
				
				// places
				dispatcher.on("placesReady", function() {
					placesReady = true;
					dispatcher.trigger("dataReady");
				});

			
				// all data have been received, launch the user interface
				dispatcher.on("dataReady", function() {
				
					// navigate to the entry point of the application
					appRouter.navigate("reset", { trigger : true });
				});
			
				if (navigator.splashscreen !== undefined) {
					navigator.splashscreen.hide();
				}

				// Trigger the initial route and enable HTML5 History API support, set the
				// root folder to '/' by default.  Change in app.js.
				Backbone.history.start({ pushState: true, root: app.root });

				// Initialize the collection of places
				window.places = new AppsGate.Collections.Places();
			});

			// Initialize the communication layer
			communicator.initialize();
		};

});
