define([
  "app",
  "models/brick"
], function(App, Brick) {

	var Universe = {};

  /**
	 * Universe model class, representing a universe in AppsGate
	 */
  Universe = Brick.extend({

    /**
     * @constructor
     */
    initialize:function() {
			Universe.__super__.initialize.apply(this, arguments);
			
			
			this.set("universe-type", "fundamental");
			if(this.get("type") === "USER_ROOT") {
				this.set("name", "universes.usersUniverse");
			}
			else if (this.get("type") === "SPATIAL_ROOT") {
				this.set("name", "universes.spatialUniverse");
			}
			else if (this.get("type") === "DEVICE_ROOT") {
				this.set("name", "universes.devicesUniverse");
			}
			else if (this.get("type") === "SERVICE_ROOT") {
				this.set("name", "universes.servicesUniverse");
			}
			else if (this.get("type") === "PROGRAM_ROOT") {
				this.set("name", "universes.programsUniverse");
			}
			else{
				this.set("name", this.id);
				this.set("universe-type", "local");
			}
			
    },

  });
	return Universe;
});