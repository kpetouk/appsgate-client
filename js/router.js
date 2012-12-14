define([
	"jquery",
	"underscore",
	"backbone",
	"views/appsgate/home"
], function($, _, Backbone, HomeView) {

	/**
	 * @class AppRouter
	 */
	var AppRouter = Backbone.Router.extend({
		routes: {
			/* "/devices": showDevices,
			"/rooms": showRooms, */
			"*path": "default"
		}
	});

	/**
	 * @constructor
	 */
	var initialize = function() {
		var appRouter = new AppRouter;

		/* appRouter.on("showDevices", function() {
			var deviceListView = new DeviceListView();
			deviceListView.render();
		});

		appRouter.on("showRooms", function() {
			var roomListView = new RoomListView();
			roomListView.render();
		}); */

		appRouter.on("route:default", function() {
			var homeView = new HomeView();
			homeView.render();
		});

		Backbone.history.start();
	};

	return {
		initialize: initialize
	};

});
