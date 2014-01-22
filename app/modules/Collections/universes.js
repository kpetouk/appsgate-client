define([
  "app"
], function(App) {

	var UniverseCollection = {};

  // collection
  UniverseCollection = Backbone.Collection.extend({
    model: AppsGate.Universe.Model,

    /**
     * Fetch the universes from the server
     *
     * @constructor
     */
    initialize:function() {
      var self = this;

      // sort the universes alphabetically
      this.comparator = function(universe) {
        return universe.get("name");
      };

      var spatialUniverse = new AppsGate.Universe.Model();
      var bricksUniverse = new AppsGate.Universe.Model();
      var programsUniverse = new AppsGate.Universe.Model();
      spatialUniverse.set("name","Spatial Universe");
      bricksUniverse.set("name", "Bricks Universe");
      programsUniverse.set("name", "Programs Universe");

      // create the default universes
      this.add(spatialUniverse);
      this.add(bricksUniverse);
      this.add(programsUniverse);

    },
  });
	
	return UniverseCollection;
});
