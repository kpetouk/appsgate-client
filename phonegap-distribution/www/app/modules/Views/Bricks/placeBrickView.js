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
      PlaceView.__super__.initialize.apply(this, arguments);
			this.name = "PlaceView";
			this.stroke = "#9ACD32";
    },

  });
  // Return the reference to the PresoMediaRenderer constructor
  return PlaceView;
});