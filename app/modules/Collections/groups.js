define([
  "app",
  "models/group"
], function(App, Group) {

  var Groups = {};
  // collection
  Groups = Backbone.Collection.extend({
    model: Group,

    /**
     * Fetch the places from the server
     *
     * @constructor
     */
    initialize:function() {
      var self = this;
      this.knownTypes = [ 1, 2, 3, 4, 5, 6, 7, 8, 21, 31, 36, 102];

      // sort the places alphabetically
      this.comparator = function(group) {
        return group.get("name");
      };

    },

    addGroup:function(brick) {
      var self = this;
      var groupType = -1;
      for(i in brick.properties) {
        if(brick.properties[i].key === "deviceType" || brick.properties[i].key === "serviceType") {
          groupType = parseInt(brick.properties[i].value);
          break;
        }
      }
      if(groupType == -1 || this.knownTypes.indexOf(groupType) >= 0) {
        this.add(new Group(brick));
      }
			else {
				console.log("unknown type", groupType, brick);
			}
			
    }

  });

  return Groups;

});
