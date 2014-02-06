define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var ContactSensorView = {};

  /**
	 * Class of a default view of a contact sensor
	 */
  ContactSensorView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      ContactSensorView.__super__.initialize.apply(this, arguments);

			this.color = "gray";
    },

  });
  // Return the reference to the ContactSensorView
  return ContactSensorView;
});
