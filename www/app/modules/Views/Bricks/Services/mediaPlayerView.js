define( [
  "app",
  "views/bricks/services/serviceview"
], function(App, ServiceView) {

  var MediaPlayerView = {};

  /**
	 * Class of a default view of Media Player
	 */
  MediaPlayerView = ServiceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){
      MediaPlayerView.__super__.initialize.apply(this, arguments);
			this.name = "MediaPlayerView";
    },

  });
  // Return the reference to the MediaPlayerView
  return MediaPlayerView;
});
