define([
	"app",
	"models/place"
], function(App, Place) {

	var Places = {};
  // collection
  Places = Backbone.Collection.extend({
    model: Place,

    /**
     * Fetch the places from the server
     *
     * @constructor
     */
    initialize:function() {
      var self = this;

      // sort the places alphabetically
      this.comparator = function(place) {
        return place.get("name");
      };

		},
		
		addPlace:function(brick) {
			this.add(new Place(brick));
		}
		
		

	});
	
	return Places;
	
});
