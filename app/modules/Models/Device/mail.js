define([
  "app",
  "models/device/device"
], function(App, Device) {

  var Mail = {};

  /**
   * Abstract class regrouping common characteristics shared by all the devices
   *
   * @class Device.Model
   */
  Mail = Device.extend({
    /**
     * @constructor
     */
    initialize: function() {
      Mail.__super__.initialize.apply(this, arguments);
    },
  });
  return Mail;
});
