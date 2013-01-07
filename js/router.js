define([
	"jquery",
	"underscore",
	"backbone",
	"views/appsgate/home",
	"views/devices/single",
	"views/devices/list"
], function($, _, Backbone, HomeView, DeviceView, DeviceListView) {

	/**
	 * @class AppRouter
	 */
	var AppRouter = Backbone.Router.extend({
		routes: {
			"devices": "showDevices",
			"devices/:cid": "showSingleDevice",
			"*path": "default"
		}
	});

	/**
	 * initialize the router by mapping routes with callbacks
	 */
	var initialize = function() {
		var appRouter = new AppRouter();

		/* show the list of the devices */
		appRouter.on("route:showDevices", function() {
			var deviceListView = new DeviceListView();
			deviceListView.render();
		});

		/* show a detailed view for the device cid */
		appRouter.on("route:showSingleDevice", function(cid) {
			var deviceView = new DeviceView({
				deviceCid: cid
			});
			deviceView.render();
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
