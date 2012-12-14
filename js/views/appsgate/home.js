define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/appsgate/home.html"
], function($, _, Backbone, appsgateHomeTemplate) {

	/**
	 * @class AppsgateHomeView
	 */
	var AppsgateHomeView = Backbone.View.extend({
		el: $("#appsgate"),
		template: _.template(appsgateHomeTemplate),
		
		/**
		 * @method render
		 */
		render:function() {
			this.$el.html(this.template());
		}
	});

	return AppsgateHomeView;
});
