define([
	"underscore",
	"backbone",
	"models/homecomponent"
], function(_, Backbone, HomeComponentModel) {

	/**
	 * @class DeviceModel
	 */
	var DeviceModel = HomeComponentModel.extend({

		defaults: {
			roomId: -1
		}

	});

	return DeviceModel;
});
