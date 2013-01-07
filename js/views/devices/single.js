define([
	"jquery",
	"underscore",
	"backbone",
	"collections/devices",
	"text!templates/devices/single.html"
], function($, _, Backbone, DeviceCollection, singleDeviceTemplate) {

	/**
	 * @class SingleDeviceView
	 */
	var SingleDeviceView = Backbone.View.extend({
		tagName: "article",
		className: "device-container",
		el: $("#appsgate"),
		template: _.template(singleDeviceTemplate),

		/**
		 * @constructor
		 */
		initialize:function(opts) {
			this.model = DeviceCollection.getDevices(opts.deviceCid);
		},

		/**
		 * Render the view for a single device
		 *
		 * @method render
		 */
		render:function() {
			if (this.model !== undefined) {
				this.$el.html(this.template({ device: this.model }));
			} else {
				this.$el.html("device not found");
			}

			return this;
		}
	});

	return SingleDeviceView;
});
