define([
  "app",
	"models/device/device"
], function(App, Device) {

	var PhillipsHue = {};

/**
 * Implementation of the Phillips Hue lamp
 * 
 * @class Device.PhillipsHue
 */
  PhillipsHue = Device.extend({
    /**
     * @constructor
     */
    initialize: function() {
      PhillipsHue.__super__.initialize.apply(this, arguments);
    },

    /**
     * Send a message to the backend to update the attribute value
     */
    sendValue:function() {
      if (this.get("value") === "true") {
        this.remoteCall("On", []);
      } else {
        this.remoteCall("Off", []);
      }
    },

    /**
     * Send a message to the backend to update the attribute color
     */
    sendColor:function() {
      this.remoteCall("setColor", [{ type : "long", value : this.get("color") }], this.id);
    },

    /**
     * Send a message to the backend to update the attribute saturation
     */
    sendSaturation:function() {
      this.remoteCall("setSaturation", [{ type : "int", value : this.get("saturation") }], this.id);
    },

    /**
     * Send a message to the backend to update the attribute brightness
     */
    sendBrightness:function() {
      this.remoteCall("setBrightness", [{ type : "long", value : this.get("brightness") }], this.id);
    }
  });
	return PhillipsHue;
});
