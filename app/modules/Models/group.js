define([
  "app",
  "models/brick",
  "views/bricks/groupbrickview"
], function(App, Brick, GroupBrickView) {

  var Group = {};

  /**
	 * Place model class representing a place in AppsGate
	 */
  Group = Brick.extend({

    /**
     * @constructor
     */
    initialize:function() {
      Group.__super__.initialize.apply(this, arguments);

      this.appendViewFactory( 'GroupBrickView', GroupBrickView, { pixelsMinDensity : 0, pixelsMaxDensity : 999999999, pixelsRatio		 : 1 });

    },

    
  });

  return Group;
});
