define([
  "app",
	"models/brick"
], function(App, Brick) {

	var Program = {};

  /**
	 * Universe model class, representing a universe in AppsGate
	 */
  Program = Brick.extend({

    /**
     * @constructor
     */
    initialize:function() {
      Program.__super__.initialize.apply(this, arguments);
    },

  });
	return Program;
});