define([
	"underscore",
	"backbone",
	"models/device"
], function(_, Backbone, DeviceModel) {

	/**
	 * @class DeviceCollection
	 */
	var DeviceCollection = Backbone.Collection.extend({
		model: DeviceModel
	});

	return DeviceCollection;

});
