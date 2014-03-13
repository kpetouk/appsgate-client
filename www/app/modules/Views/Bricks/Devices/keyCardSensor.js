define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var KeyCardSensorView = {};

  /**
	 * Class of a default view of a key card sensor
	 */
  KeyCardSensorView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      KeyCardSensorView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the KeyCardSensorView
  return KeyCardSensorView;
});
