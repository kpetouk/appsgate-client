define([
  "app",
  "models/habitat"
], function(App, Habitat) {

  var Habitats = {};
  // collection
  Habitats = Backbone.Collection.extend({
    model: Habitat,

    /**
     * Fetch the users from the server
     *
     * @constructor
     */
    initialize:function() {
      var self = this;
    },


    addHabitat:function(brick) {
      this.add(new Habitat(brick));
    },

  });

  return Habitats;

});
