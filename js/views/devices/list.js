define([
	"jquery",
	"underscore",
	"backbone",
	"collections/devices",
	"text!templates/devices/list.html"
], function($, _, Backbone, DevicesCollection, devicesListTemplate) {

	/**
	 * @class DeviceListView
	 */
	var DeviceListView = Backbone.View.extend({
		el: $("#container"),

		/**
		 * @constructor
		 */
		initialize:function() {
			this.collection = new DevicesCollection();
			this.collection.add({ name: "Bob's tablet" });

			var template = _.template(devicesListTemplate, { devices: this.collection.models });
			this.$el.html(template);
		}
	});

	return DeviceListView;
});
