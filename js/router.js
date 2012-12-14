define([
	"jquery",
	"underscore",
	"backbone",
	"views/appsgate/home",
	"views/rooms/list"
], function($, _, Backbone, HomeView, RoomListView) {

	/**
	 * @class AppRouter
	 */
	var AppRouter = Backbone.Router.extend({
		routes: {
			// "/devices": showDevices,
			"rooms": "showRooms",
			"*path": "default"
		}
	});

	/**
	 * @constructor
	 */
	var initialize = function() {
		var appRouter = new AppRouter();

		/* appRouter.on("showDevices", function() {
			var deviceListView = new DeviceListView();
			deviceListView.render();
		}); */

		appRouter.on("route:showRooms", function() {
			console.log("show the rooms");
			var roomListView = new RoomListView();
			roomListView.render();
		});

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
