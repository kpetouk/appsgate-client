define([
	"underscore",
	"backbone",
	"communicator",
	"models/device"
], function(_, Backbone, Communicator, DeviceModel) {

	/**
	 * @class DevicesCollection
	 */
	var DevicesCollection = Backbone.Collection.extend({
		model: DeviceModel
	});

	var _initialize = function() {
		var _devicesCollection = new DevicesCollection();

		dispatcher.on("WebSocketOpen", function() {
			console.log("websocket is opened");
		});

		// listen to the event DeviceListUpdated and update the local list of
		// devices
		_devicesCollection.on("DevicesListUpdate", function(data) {
			_devicesCollection.update(data);
		});

		// request the list of the devices
		// Communicator.sendMessage("getDevices", {});
	};

	// return DeviceCollection;

	return {
		initialize: _initialize
	};
});
