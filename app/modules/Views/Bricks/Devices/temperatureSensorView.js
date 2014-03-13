define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var TemperatureSensorView = {};

  /**
	 * Class of a default view of a temperature sensor
	 */
  TemperatureSensorView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      TemperatureSensorView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the TemperatureSensorView
  return TemperatureSensorView;
});
