define([
	"app",
	"models/program"
], function(App, Program) {

	var Programs = {};
  // collection
  Programs = Backbone.Collection.extend({
    model: Program,

    /**
     * Fetch the places from the server
     *
     * @constructor
     */
    initialize:function() {
      var self = this;

      // sort the places alphabetically
      this.comparator = function(program) {
        return program.get("name");
      };

		},

		addProgram:function(brick) {
			this.add(new Program(brick));
		}

	});
	
	return Programs;
	
});
