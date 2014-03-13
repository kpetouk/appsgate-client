define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var DeviceView = {};

  /**
	 * Class of a default view of an actuator
	 */
  DeviceView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      DeviceView.__super__.initialize.apply(this, arguments);
			this.stroke = "#FFFF00";

    },

  });
  // Return the reference to the ActuatorView
  return DeviceView;
});
