define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var IlluminationSensorView = {};

  /**
	 * Class of a default view of an illumination sensor
	 */
  IlluminationSensorView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      IlluminationSensorView.__super__.initialize.apply(this, arguments);

			this.color = "cyan";
    },

  });
  // Return the reference to the IlluminationSensorView
  return IlluminationSensorView;
});
