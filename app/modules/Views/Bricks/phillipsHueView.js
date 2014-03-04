define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var PhillipsHueView = {};

  /**
	 * Class of a default view of a Phillips Hue Lamp
	 */
  PhillipsHueView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){
			PhillipsHueView.__super__.initialize.apply(this, arguments);
			this.name = "PhillipsHueView";
    },

  });
  // Return the reference to the PresoMediaRenderer constructor
  return PhillipsHueView;
});
