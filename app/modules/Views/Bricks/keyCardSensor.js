define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var KeyCardSensorView = {};

  /**
	 * Class of a default view of a key card sensor
	 */
  KeyCardSensorView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      KeyCardSensorView.__super__.initialize.apply(this, arguments);

			this.color = "gray";
    },

  });
  // Return the reference to the KeyCardSensorView
  return KeyCardSensorView;
});
