define( [
  "app",
  "views/bricks/services/serviceview"
], function(App, ServiceView) {

  var MailView = {};

  /**
	 * Class of a default view of an e-mail service
	 */
  MailView = ServiceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){

      MailView.__super__.initialize.apply(this, arguments);

    },

  });
  // Return the reference to the MailView
  return MailView;
});
