define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var PlaceView = {};

  /**
	 * Class of a default view of a place
	 */
  PlaceView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){
			var self = this;

      PlaceView.__super__.initialize.apply(this, arguments);
			this.color = "brown";
			
    },

  });
  // Return the reference to the PresoMediaRenderer constructor
  return PlaceView;
});
