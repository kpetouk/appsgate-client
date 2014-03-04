
define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var GroupView = {};

  /**
	 * Class of a default view of a place
	 */
  GroupView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){
			var self = this;

      GroupView.__super__.initialize.apply(this, arguments);
						
    },

  });
  // Return the reference to the PresoMediaRenderer constructor
  return GroupView;
});
