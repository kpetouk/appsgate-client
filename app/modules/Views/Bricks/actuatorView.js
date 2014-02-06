define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var ActuatorView = {};

  /**
	 * Class of a default view of an actuator
	 */
  ActuatorView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      ActuatorView.__super__.initialize.apply(this, arguments);

			this.color = "gray";
    },

  });
  // Return the reference to the ActuatorView
  return ActuatorView;
});
