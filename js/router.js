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
			"rooms": "showRooms",
			"room/:id": "showSingleRoom",
			"*path": "default"
		}
	});

	/**
	 * initialize the router by mapping routes with callbacks
	 */
	var initialize = function() {
		var appRouter = new AppRouter();

		/* show the list of the rooms */
		appRouter.on("route:showRooms", function() {
			var roomListView = new RoomListView();
			roomListView.render();
		});

		/* show a detailed view for the room id */
		appRouter.on("route:showSingleRoom", function(id) {
		});

		/* default route, render the home page */
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
