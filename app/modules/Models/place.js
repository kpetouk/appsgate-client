define([
  "app",
  "models/brick",
  "views/bricks/placebrickview"
], function(App, Brick, PlaceBrickView) {

  var Place = {};

  /**
	 * Place model class representing a place in AppsGate
	 */
  Place = Brick.extend({

    /**
     * @constructor
     */
    initialize:function() {
      Place.__super__.initialize.apply(this, arguments);

      var self = this;

      this.type = "place";

      this.appendViewFactory( 'PlaceBrickView', PlaceBrickView, { pixelsMinDensity : 0, pixelsMaxDensity : 999999999, pixelsRatio		 : 1 });

      // remove potential duplicated entries and trigger a refresh of the list of places event
      this.on("change:devices", function() {
        self.set({ devices : _.uniq(self.get("devices")) });
      });
    },

    /**
     * Compute the average value of given sensors
     * 
     * @param sensors Array of sensors
     * @return Average value of the sensors if any, undefined otherwise
     */
    getAverageValue:function(sensors) {
      // return null if there is no sensors in the room
      if (sensors.length === 0) {
        return undefined;
      }

      // compute the average value of the sensors
      var average = 0;
      sensors.forEach(function(s) {
        if (typeof s.get("value") !== "undefined") {
          average += parseInt(s.get("value"));
        } else {
          average += parseInt(s.get("consumption"));
        }
      });

      return average / sensors.length;
    },

    /**
     * Compute the total value of given sensors
     * 
     * @param sensors Array of sensors
     * @return Average value of the sensors if any, undefined otherwise
     */
    getTotalValue:function(sensors) {
      // return null if there is no  sensors in the room
      if (sensors.length === 0) {
        return undefined;
      }

      // compute the total value of the sensors
      var total = 0;
      sensors.forEach(function(s) {
        if (typeof s.get("value") !== "undefined") {
          total += parseInt(s.get("value"));
        } else {
          total += parseInt(s.get("consumption"));
        }
      });

      return total;
    },

    /**
     * Compute the average temperature of the place from the temperature sensors in the place
     * 
     * @return Average temperature of the place if any temperature sensor, undefined otherwise
     */
    getAverageTemperature:function() {
      var result = this.getAverageValue(this.getTemperatureSensors());
      return result ? result : $.i18n.t("places-details.undefined");
    },

    /**
     * Compute the average illumination of the place from the illumination sensors in the place
     * 
     * @return Average illumination of the place if any illumination sensor, undefined otherwise
     */
    getAverageIllumination:function() {
      var result = this.getAverageValue(this.getIlluminationSensors());
      return result ? result : $.i18n.t("places-details.undefined");
    },

    /**
     * Compute the average consumption of the place from the plugs in the place
     * 
     * @return Average consumption of the place if any consumption sensor, undefined otherwise
     */
    getAverageConsumption:function() {
      var result = this.getTotalValue(this.getPlugs());
      return result ? result : $.i18n.t("places-details.undefined");
    },

    /**
     * Return all the devices of the place that matches a given type
     * 
     * @param type Type of the devices to retrieve
     * @return Array of devices w/ good type
     */
    getTypeSensors:function(type) {
      type = parseInt(type);

      // in case of wrong type, return an empty array
      if (isNaN(type)) {
        return [];
      }

      // get all the devices that match the type
      var sensorsId = this.get("devices").filter(function(id) {
        return (AppsGate.Device.Collection.get(id) !== undefined && AppsGate.Device.Collection.get(id).get("type") === type);
      });

      // get all the devices that match the type and the place
      sensors = AppsGate.Device.Collection.filter(function(device) {
        return (sensorsId.indexOf(device.get("id").toString()) !== -1);
      });

      return sensors;
    },

    /**
     * @return Array of temperature sensors in the place
     */
    getTemperatureSensors:function() {
      return this.getTypeSensors(0);
    },

    /**
     * @return Array of illumination sensors in the place
     */
    getIlluminationSensors:function() {
      return this.getTypeSensors(1);
    },

    /**
     * @return Array of switches in the place
     */
    getSwitches:function() {
      return this.getTypeSensors(2);
    },

    /**
     * @return Array of contact sensors in the place
     */
    getContactSensors:function() {
      return this.getTypeSensors(3);
    },

    /**
     * @return Array of key-card readers in the place
     */
    getKeyCardReaders:function() {
      return this.getTypeSensors(4);
    },

    /**
     * @return Array of movement sensors in the place
     */
    getMovementSensors:function() {
      return this.getTypeSensors(5);
    },

    /**
     * @returns Array of plugs in the place
     */
    getPlugs:function() {
      return this.getTypeSensors(6);
    },

    /**
     * @return Array of Philips Hue lamps in the place
     */
    getPhilipsHueLamps:function() {
      return this.getTypeSensors(7);
    },

    getMediaPlayers:function() {
      return this.getTypeSensors(31);
    },

    /**
     * Send a message to the server to perform a remote call
     * 
     * @param method Remote method name to call
     * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
     */
    remoteCall:function(method, args) {
      communicator.sendMessage({
        method  : method,
        args    : args
      });
    },

    /**
     * Override its synchronization method to send a notification on the network
     */
    sync:function(method, model) {
      switch (method) {
        case "create":
          // create an id to the place
          var id;
        do {
          id = "place-" + Math.round(Math.random() * 10000).toString();
        } while (places.where({ id : id }).length > 0);
        model.set("id", id);

        this.remoteCall("newPlace", [{ type : "JSONObject", value : model.toJSON() }]);
        break;
        case "delete":
          this.remoteCall("removePlace", [{ type : "String", value : model.get("id") }]);
        break;
        case "update":
          this.remoteCall("updatePlace", [{ type : "JSONObject", value : model.toJSON() }]);
        break;
        default:
          break;
      }
    },

    /**
     * Converts the model to its JSON representation.
     */
    toJSON:function() {
      return {
        id              : this.get("id").toString(),
        name    : this.get("name"),
        devices : this.get("devices")
      }; 
    }
  });

  return Place;
});
