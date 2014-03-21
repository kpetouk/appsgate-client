define(function(require, exports, module) {
  "use strict";

  var _ = require("underscore");
  var $ = require("jquery");
	var Backbone = require("backbone");
	var Router = require("router");
	var Communicator = require("modules/communicator");
	
	require("moment");
	require("i18n");
	require("bootstrap");
	require("jqueryui");
	require("jqueryuitouch");
	require("circlemenu");
	
  // Alias the module for easier identification.
  var app = module.exports;

	// Initialization of the application
  app.initialize = function() {
	
			// Define your master router on the application namespace and trigger all
			// navigation from this instance.
			AppsGate.Router = new Router();

			// Initialize the application-wide event dispatcher
			window.dispatcher = _.clone(Backbone.Events);

			// Setting the connection with the box
			window.communicator = new Communicator('ws://194.199.23.138:8087');

				// Wait for the socket to be opened
			dispatcher.on("WebSocketOpen", function() {
			
				console.log("loading appsgate tree");
				
				// listen to the event when the list of users is received
				dispatcher.on("AppsGateRoot", function(brick) {
					require(['models/appsgateroot'], function (Root) {
						AppsGate.Root = new Root(brick);
					});
				});

				// send the request to fetch the places
				communicator.sendMessage({
					method : "getRootSpace",
					args: [],
					callId: "AppsGateRoot"
				});

				// all data have been received, launch the user interface
        dispatcher.on("treeReady", function() {
					console.log("preparations ready, displaying page");
          // Routing to login
					Backbone.history.start();
        });
			});

			// Initialize the communication layer
			communicator.initialize();
		};

	return app;
});
