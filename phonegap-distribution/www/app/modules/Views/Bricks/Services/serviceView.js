define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var ServiceView = {};

  /**
	 * Class of a default view of an e-mail service
	 */
  ServiceView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      ServiceView.__super__.initialize.apply(this, arguments);
			this.stroke = "#FFA500";

    },

  });
  // Return the reference to the MailView
  return ServiceView;
});
