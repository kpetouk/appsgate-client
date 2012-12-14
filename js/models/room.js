define([
	"underscore",
	"backbone",
	"models/homecomponent",
	"collections/devices",
], function(_, Backbone, HomeComponentModel, DevicesCollection) {

	/**
	 * @class RoomModel
	 */
	var RoomModel = HomeComponentModel.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			this.devices = new DevicesCollection();
		}
	});

	return RoomModel;
});
