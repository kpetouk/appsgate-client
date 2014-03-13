define( [
	"app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var IlluminationSensorView = {};

  /**
	 * Class of a default view of an illumination sensor
	 */
  IlluminationSensorView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      IlluminationSensorView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the IlluminationSensorView
  return IlluminationSensorView;
});
