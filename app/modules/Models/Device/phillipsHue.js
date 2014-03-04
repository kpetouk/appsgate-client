define([
  "app",
  "models/device/device",
  "views/bricks/phillipshueview",
  "views/bricks/phillipshuecloseview"
], function(App, Device, PhillipsHueView, PhillipsHueCloseView) {

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
			
			this.setProperty("name", "Lampe " + this.cid);

      this.appendViewFactory( 'PhillipsHueView', PhillipsHueView, { pixelsMinDensity : 0, pixelsMaxDensity : 0.5, pixelsRatio : 1 });
      this.appendViewFactory( 'PhillipsHueCloseView', PhillipsHueCloseView,{ pixelsMinDensity : 0.5, pixelsMaxDensity : 2, pixelsRatio : 1 });

    },

    /**
     * Send a message to the backend to update the attribute value
     */
    sendValue:function() {
      if (this.get("value") === "true") {
        this.remoteControl("On", []);
      } else {
        this.remoteControl("Off", []);
      }
    },

    /**
     * Send a message to the backend to update the attribute color
     */
    sendColor:function() {
      this.remoteControl("setColor", [{ type : "long", value : this.get("color") }], this.id);
    },

    /**
     * Send a message to the backend to update the attribute saturation
     */
    sendSaturation:function() {
      this.remoteControl("setSaturation", [{ type : "int", value : this.get("saturation") }], this.id);
    },

    /**
     * Send a message to the backend to update the attribute brightness
     */
    sendBrightness:function() {
      this.remoteControl("setBrightness", [{ type : "long", value : this.get("brightness") }], this.id);
    }
  });
  return PhillipsHue;
});
