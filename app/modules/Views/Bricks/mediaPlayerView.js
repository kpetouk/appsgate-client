define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var MediaPlayerView = {};

  /**
	 * Class of a default view of Media Player
	 */
  MediaPlayerView = BrickView.extend({

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
