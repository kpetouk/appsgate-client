define([
	"jquery",
	"underscore",
	"backbone",
	"router",
	"communicator",
	"collections/devices"
], function($, _, Backbone, Router, Communicator, DevicesCollection) {
	/*
	 * Initialize all the components of the application: the event dispatcher,
	 * the communication layer and the controllers
	 */
	var initialize = function() {

		// initialize the event dispatcher for the application
		window.dispatcher = _.clone(Backbone.Events);

		// router
		Router.initialize();

		// initialize the communication layer
		Communicator.initialize();

		dispatcher.on("WebSocketOpen", function() {
			console.log("ok!");
			Communicator.sendMessage("/devices");
		});

		// initialize the collection of devices
		DevicesCollection.initialize();
	};

	return {
		initialize: initialize
	}
});
