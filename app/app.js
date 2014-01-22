define(function(require, exports, module) {
  "use strict";

  var _ = require("underscore");
  var $ = require("jquery");
  var Backbone = require("backbone");
	var moment = require("moment");
	var Router = require("router");
	var Communicator = require("modules/communicator");
	
	require("i18n");
	
  // Alias the module for easier identification.
  var app = module.exports;

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
				if (typeof AppsGate.Place.Collection !== "undefined") {
					AppsGate.Place.Collection.reset();
				}
				if (typeof AppsGate.Device.Collection !== "undefined") {
					AppsGate.Device.Collection.reset();
				}
			
				// wait for the data before launching the user interface
				var placesReady = false;
				var devicesReady = false;
				
				// places
				dispatcher.on("placesReady", function() {
					placesReady = true;
					if(placesReady && devicesReady){
						dispatcher.trigger("dataReady");
					}
					//console.log("placesReady");
					//console.log(AppsGate.Place.Collection);
				});
				
				// devices
				dispatcher.on("devicesReady", function() {
					devicesReady = true;
					if(placesReady && devicesReady){
						dispatcher.trigger("dataReady");
					}
					
					console.log("devicesReady");
					console.log(AppsGate.Device.Collection);
				});

			
				// all data have been received, launch the user interface
				dispatcher.on("dataReady", function() {
				
					// remove potential duplicated entries of devices in a place
					AppsGate.Place.Collection.forEach(function(l) {
						l.set({ devices : _.uniq(l.get("devices")) });
					});
				
					Backbone.history.start();
					
				});
			
				if (navigator.splashscreen !== undefined) {
					navigator.splashscreen.hide();
				}
				
				// Initialize the collection of places
				var placeModel = require("models/place");
				AppsGate.Place.Model = new placeModel();
				
				var placeCollection = require("collections/places");
				AppsGate.Place.Collection = new placeCollection();

				// Initialize the collection of devices
				var deviceModel = require("models/device/device");
				AppsGate.Device.Model = new deviceModel();
				
				var deviceCollection = require("collections/devices");
				AppsGate.Device.Collection = new deviceCollection();

				
			});

			// Initialize the communication layer
			communicator.initialize();
		};

	return app;
});
