define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var CoreClockView = {};

  /**
	 * Class of a default view of a Core Clock
	 */
  CoreClockView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      CoreClockView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the Core Clock
  return CoreClockView;
});
