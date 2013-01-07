define([
	"jquery",
	"underscore",
	"backbone",
	"collections/devices",
	"text!templates/devices/list.html"
], function($, _, Backbone, DeviceCollection, devicesListTemplate) {

	/**
	 * @class DeviceListView
	 */
	var DeviceListView = Backbone.View.extend({
		tagName: "article",
		className: "list-devices-container",
		el: $("#appsgate"),
		template: _.template(devicesListTemplate),

		render:function() {
			var data = {
				devices: devicesCollection, // DeviceCollection.getDevices(),
				_: _
			};

			this.$el.html(this.template(data));
			return this;
		}
	});

	return DeviceListView;
});
