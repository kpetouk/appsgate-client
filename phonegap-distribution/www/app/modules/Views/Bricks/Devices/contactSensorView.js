define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var ContactSensorView = {};

  /**
	 * Class of a default view of a contact sensor
	 */
  ContactSensorView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      ContactSensorView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the ContactSensorView
  return ContactSensorView;
});
