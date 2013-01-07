require([
	// libs
	"jquery",
	"underscore",
	"backbone",

	// modules
	"modules/communicator",
	"modules/device",
	"modules/home"
], function($, _, Backbone, Communicator, Device, Home) {
	// define the application router
	var AppRouter = Backbone.Router.extend({
		routes: {
			"" : "index"
		},

		// default route of the application
		index:function() {
			var view = new Home.Views.Default();
			view.render();
		}
	});

	// application router
	var appRouter;

	// use jQuery ready function as the entry point to the application
	$(function() {
		// initialize the event dispatcher for the application
		window.dispatcher = _.clone(Backbone.Events);

		// initialize the communication layer for the application
		window.communicator = new Communicator("ws://localhost:1337");

		// wait for the socket to be open
		dispatcher.on("WebSocketOpen", function() {
			// initialize the collection of devices
			window.devices = new Device.Collection();
		});

		// declare the main router for the application
		appRouter = new AppRouter();
		Backbone.history.start();
	});
});
