define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var PlugView = {};

  /**
	 * Class of a default view of smart plug
	 */
  PlugView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      PlugView.__super__.initialize.apply(this, arguments);

			this.color = "midnightblue";
    },

  });
  // Return the reference to the PlugView
  return PlugView;
});
