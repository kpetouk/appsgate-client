define([
  "app",
  "models/device/device",
  "models/device/temperaturesensor",
  "models/device/illuminationsensor",
  "models/device/switchsensor",
  "models/device/contactsensor",
  "models/device/keycardsensor",
  "models/device/plug",
  "models/device/phillipshue",
  "models/device/actuator",
  "models/device/coreclock"
], function(App, Device, TemperatureSensor, IlluminationSensor, SwitchSensor, ContactSensor, KeyCardSensor, Plug, PhillipsHue, Actuator, CoreClock) {

  var Devices = {};

  // collection
  Devices = Backbone.Collection.extend({
    model: Device,

    /**
     * Fetch the devices from the server
     *
     * @constructor
     */
    initialize: function() {
      var self = this;
      // listen to the backend notifying when a device appears and add it
      dispatcher.on("newDevice", function(device) {
        self.addDevice(device);
      });

      dispatcher.on("removeDevice", function(deviceId) {
        var device = self.findWhere({ id : deviceId });
        self.remove(device);

        console.log(device);
      });

    },

    /**
     * Check the type of device sent by the server, cast it and add it to the collection
     *
     * @param device
     */
    addDevice:function(brick) {
      var self = this;
      var deviceType;
      for(var i in brick.properties) {
        if(brick.properties[i].key === "deviceType") {
          deviceType = brick.properties[i].value;
          break;
        }
      }
      switch (parseInt(deviceType)) {
        case 0:
          brick = self.add(new TemperatureSensor(brick));
        break;
        case 1:
          brick =	self.add(new IlluminationSensor(brick));
        break;
        case 2:
          brick =	self.add(new SwitchSensor(brick));
        break;
        case 3:
          brick =	self.add(new ContactSensor(brick));
        break;
        case 4:
          brick =	self.add(new KeyCardSensor(brick));
        break;
        case 6:
          brick =	self.add(new Plug(brick));
        break;
        case 7:
          brick =	self.add(new PhillipsHue(brick));
        break;
        case 8:
          brick =	self.add(new Actuator(brick));
        break;
        case 21:
          brick =	self.add(new CoreClock(brick));
        break;
        default:
          console.log("unknown type", deviceType, brick);
        break;
      }

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

  return Devices;

});
