define([
  "app",
  "models/brick",
  "views/bricks/placebrickview"
], function(App, Brick, PlaceBrickView) {

  var Place = {};

  /**
   * Place model class representing a place in AppsGate
   */
  Place = Brick.extend({

    /**
     * @constructor
     */
    initialize:function() {
      Place.__super__.initialize.apply(this, arguments);

      var self = this;
			
			this.isGroup = true;

      this.type = "PLACE";

      this.appendViewFactory( 'PlaceBrickView', PlaceBrickView, { pixelsMinDensity : 0, pixelsMaxDensity : 999999999, pixelsRatio : 1 });

    },

  });

  return Place;
});
