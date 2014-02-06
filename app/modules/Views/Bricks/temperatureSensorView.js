define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var TemperatureSensorView = {};

  /**
	 * Class of a default view of a temperature sensor
	 */
  TemperatureSensorView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      TemperatureSensorView.__super__.initialize.apply(this, arguments);

			this.color = "gray";
    },

  });
  // Return the reference to the TemperatureSensorView
  return TemperatureSensorView;
});
