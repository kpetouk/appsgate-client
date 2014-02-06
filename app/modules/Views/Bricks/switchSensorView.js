define( [
  "app",
  "views/brickview"
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

			this.color = "gray";
    },

  });
  // Return the reference to the SwitchSensorView
  return SwitchSensorView;
});
