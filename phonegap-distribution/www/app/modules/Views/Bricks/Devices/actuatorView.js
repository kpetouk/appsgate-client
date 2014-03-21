define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var ActuatorView = {};

  /**
	 * Class of a default view of an actuator
	 */
  ActuatorView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      ActuatorView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the ActuatorView
  return ActuatorView;
});
