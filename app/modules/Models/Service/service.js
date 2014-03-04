define([
  "app",
  "models/brick"
], function(App, Brick) {

  var Service = {};

  /**
   * Abstract class regrouping common characteristics shared by all the devices
   *
   * @class Device.Model
   */
  Service = Brick.extend({

    /**
     * @constructor 
     */
    initialize: function() {
      Service.__super__.initialize.apply(this, arguments);

      var self = this;

    },

  });
  return Service;
});
