define([
  "app",
	"models/device/device",
	"models/device/temperatureSensor",
	"models/device/illuminationSensor",
	"models/device/switchSensor",
	"models/device/contactSensor",
	"models/device/keyCardSensor",
	"models/device/plug",
	"models/device/phillipsHue",
	"models/device/actuator",
	"models/device/coreClock",
	"models/device/mediaPlayer",
	"models/device/mediaBrowser",
	"models/device/mail"
], function(App, Device, TemperatureSensor, IlluminationSensor, SwitchSensor, ContactSensor, KeyCardSensor, Plug, PhillipsHue, Actuator, CoreClock, MediaPlayer, MediaBrowser, Mail) {

	var DeviceCollection = {};

  // collection
  DeviceCollection = Backbone.Collection.extend({
    model: Device,

    /**
     * Fetch the devices from the server
     *
     * @constructor
     */
    initialize: function() {
      var self = this;
			
			console.log("initializing devices collection");

      // listen to the event when the list of devices is received
      dispatcher.on("listDevices", function(devices) {
        _.each(devices, function(device) {
          self.addDevice(device);
        });
        dispatcher.trigger("devicesReady");
      });

      // listen to the backend notifying when a device appears and add it
      dispatcher.on("newDevice", function(device) {
        self.addDevice(device);
      });

      dispatcher.on("removeDevice", function(deviceId) {
        var device = devices.findWhere({ id : deviceId });
        devices.remove(device);

        console.log(device);
      });

      // send the request to fetch the devices
      communicator.sendMessage({
        method: "getDevices",
        args: [],
        callId: "listDevices"
      });
    },

    /**
     * Check the type of device sent by the server, cast it and add it to the collection
     *
     * @param device
     */
    addDevice:function(device) {
      device.type = parseInt(device.type);

      switch (device.type) {
        case 0:
					this.add(new TemperatureSensor(device));
        break;
        case 1:
					this.add(new IlluminationSensor(device));
        break;
        case 2:
					this.add(new SwitchSensor(device));
        break;
        case 3:
					this.add(new ContactSensor(device));
        break;
        case 4:
					this.add(new KeyCardSensor(device));
        break;
        case 6:
					this.add(new Plug(device));
        break;
        case 7:
					this.add(new PhillipsHue(device));
        break;
        case 8:
					this.add(new Actuator(device));
        break;
        case 21:
					this.add(new CoreClock(device));
        break;
        case 31:
					this.add(new MediaPlayer(device));
        break;
        case 36:
					this.add(new MediaBrowser(device));
        break;
        case 102:
          this.add(new Mail(device));
        break;
        default:
          //console.log("unknown type", device.type, device);
        break;
      }

      AppsGate.Place.Collection.get(device.placeId).get("devices").push(device.id);
			//console.log("added a new device" + device.id);
    },

    /**
     * @return Array of the devices of a given type
     */
    getDevicesByType:function() {
      return this.groupBy(function(device) {
        return device.get("type");
      });
    },

    /**
     * @return Array of the temperature sensors
     */
    getTemperatureSensors:function() {
      return devices.where({ type : 0 });
    },

    /**
     * @return Array of the illumination sensors
     */
    getIlluminationSensors:function() {
      return devices.where({ type : 1 });
    },

    /**
     * @return Array of the switches
     */
    getSwitches:function() {
      return devices.where({ type : 2 });
    },

    /**
     * @return Array of the contact sensors
     */
    getContactSensors:function() {
      return devices.where({ type : 3 });
    },

    /**
     * @return Array of the key-card readers
     */
    getKeyCardReaders:function() {
      return devices.where({ type : 4 });
    },

    /**
     * @return Array of the plugs
     */
    getPlugs:function() {
      return devices.where({ type : 6 });
    },

    /**
     * @return Array of the lamps
     */
    getLamps:function() {
      return devices.where({ type : 7 });
    },

    /**
     * @return Array of the switch actuators
     */
    getActuators:function() {
      return devices.where({ type : 8 });
    },

    /**
     * @return Core clock of the home - unique device
     */
    getCoreClock:function() {
      return devices.findWhere({ type : 21 });
    },

    /**
     * @return Core mail of the home - unique device
     */
    getCoreMail:function() {
      return devices.findWhere({ type : 102 });
    },

    /**
     * @return Array of UPnP media players
     */
    getMediaPlayers:function() {
      return devices.where({ type : 31 });
    },

    /**
     * @return Array of UPnP media browsers
     */
    getMediaBrowsers:function() {
      return devices.where({ type : 36 });
    },

    /**
     * @return Array of the unlocated devices
     */
    getUnlocatedDevices:function() {
      return this.filter(function(device) {
        return device.get("placeId") === "-1";
      });
    },

    /**
     * @return Dictionnary of the devices sorted by their type - key is the type id, value - array of devices corresponding the type
     */
    getUnlocatedDevicesByType:function() {
      return _.groupBy(this.getUnlocatedDevices(), function(device) {
        return device.get("type");
      });
    }
  });
	
	return DeviceCollection;
	
});
