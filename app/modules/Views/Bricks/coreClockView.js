define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var CoreClockView = {};

  /**
	 * Class of a default view of a Core Clock
	 */
  CoreClockView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      CoreClockView.__super__.initialize.apply(this, arguments);

			this.color = "goldenrod";
    },

  });
  // Return the reference to the Core Clock
  return CoreClockView;
});
