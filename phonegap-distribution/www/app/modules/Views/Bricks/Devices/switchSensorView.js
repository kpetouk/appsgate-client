define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, BrickView) {

  var SwitchSensorView = {};

  /**
	 * Class of a default view of a switch sensor
	 */
  SwitchSensorView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      SwitchSensorView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the SwitchSensorView
  return SwitchSensorView;
});
