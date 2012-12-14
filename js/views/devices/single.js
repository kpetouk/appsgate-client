define([
	"jquery",
	"underscore",
	"backbone",
	"models/device",
	"collections/devices",
	"text!templates/devices/single.html"
], function($, _, Backbone, DeviceModel, singleDeviceTemplate) {

	/**
	 * @class SingleDeviceView
	 */
	var SingleDeviceView = Backbone.View.extend({
		tagName: "article",
		className: "device-container",
		template: _.template(singleDeviceTemplate),

		/**
		 * @method render
		 */
		render:function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	return SingleDeviceView;
});
