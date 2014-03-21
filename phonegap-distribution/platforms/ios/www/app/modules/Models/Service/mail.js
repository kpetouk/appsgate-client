define([
  "app",
  "models/service/service"
], function(App, Service) {

  var Mail = {};

  /**
   * Abstract class regrouping common characteristics shared by all the devices
   *
   * @class Device.Model
   */
  Mail = Service.extend({
    /**
     * @constructor
     */
    initialize: function() {
      Mail.__super__.initialize.apply(this, arguments);
    },
  });
  return Mail;
});
