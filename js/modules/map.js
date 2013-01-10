define([
	"jquery",
	"underscore",
	"backbone",
	"raphael",
	"text!templates/map/default.html"
], function($, _, Backbone, Raphael, mapDefaultTemplate) {
	// initialize the module
	var Map = {};

	// router
	Map.Router = Backbone.Router.extend({
		routes: {
			"map"		: "map"
		},

		// show the map
		map:function() {
			var defaultView = new Map.Views.Default();
			defaultView.render();
		}
	});


	// views
	Map.Views = {};

	// default view, shows the global map
	Map.Views.Default = Backbone.View.extend({
		el: $("#appsgate"),
		tagName: "article",
		className: "map-container",
		template: _.template(mapDefaultTemplate),

		// render the default view
		render:function() {
			this.$el.html(this.template());
			return this;
		}
	});

	// instantiate the router
	var router = new Map.Router();
});
