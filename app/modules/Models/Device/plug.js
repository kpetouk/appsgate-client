define([
  "app",
  "models/device/device"
], function(App, Device) {

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

      this.appendViewFactory( 'PresoBasicSmartPlug', PresoBasicSmartPlug, { pixelsMinDensity : 0, pixelsMaxDensity : 999999999, pixelsRatio : 1 });
    },

    /**
     * Send a message to the backend to update the attribute plugState
     */
    sendPlugState:function() {
      if (this.get("plugState") === "true") {
        this.remoteCall("on", []);
      } else {
        this.remoteCall("off", []);
      }
    }
  });
  return Plug;
});
