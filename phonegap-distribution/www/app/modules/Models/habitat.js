define([
  "app",
  "models/brick"
], function(App, Brick) {

	var Habitat = {};

  /**
	 * Universe model class, representing a universe in AppsGate
	 */
  Habitat = Brick.extend({

    /**
     * @constructor
     */
    initialize:function() {
			Habitat.__super__.initialize.apply(this, arguments);
    },

  });
	return Habitat;
});