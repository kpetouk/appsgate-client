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
		},

		/**
		 * Add a device to the room. A device belongs to a single room.
		 *
		 * @param device Device to be added to the room
		 */
		addDevice:function(device) {
			if (device.get("roomId") === -1) {
				this.devices.add(device);
				device.set("roomId", this.id);
			}
		}

	});

	return RoomModel;
});
