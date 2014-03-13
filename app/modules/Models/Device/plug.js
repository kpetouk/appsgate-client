define([
  "app",
  "models/device/device",
  "views/bricks/devices/plugview"
], function(App, Device, PlugView) {

  var Plug = {};
  /**
   * @class Device.Plug
   */
  Plug = Device.extend({
    /**
     * @constructor
     */
    initialize:function() {
      Plug.__super__.initialize.apply(this, arguments);

      this.appendViewFactory( 'PlugView', PlugView, { pixelsMinDensity : 0, pixelsMaxDensity : 999999999, pixelsRatio : 1 });
    },

    /**
     * Send a message to the backend to update the attribute plugState
     */
    sendPlugState:function() {
      if (this.get("plugState") === "true") {
        this.remoteControl("on", []);
      } else {
        this.remoteControl("off", []);
      }
    }
  });
  return Plug;
});
