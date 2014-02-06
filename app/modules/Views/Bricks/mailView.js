define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var MailView = {};

  /**
	 * Class of a default view of an e-mail service
	 */
  MailView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      MailView.__super__.initialize.apply(this, arguments);

			this.color = "whitesmoke";
    },

  });
  // Return the reference to the MailView
  return MailView;
});
