define([
	"app",
	"models/universe"
], function(App, Universe) {

	var Universes = {};
  // collection
  Universes = Backbone.Collection.extend({
    model: Universe,

    /**
     * Fetch the users from the server
     *
     * @constructor
     */
    initialize:function() {
      var self = this;
		},
		
		addUniverse:function(brick){
			this.add(new Universe(brick), {at:0});
		},
		
		getUniverseByType:function(type){
			return this.findWhere({type:type});
		},
		
		getFundamentalUniverses:function() {
			//return this.where({"universe-type":"fundamental"});
			var result = [];
			result.push(this.getUsersUniverse());
			result.push(this.getSpatialUniverse());
			result.push(this.getDevicesUniverse());
			result.push(this.getServicesUniverse());
			result.push(this.getProgramsUniverse());
			return result;
		},
		
		getUsersUniverse:function() {
			return this.findWhere({type:"USER_ROOT"});
		},
		
		getSpatialUniverse:function() {
			return this.findWhere({type:"SPATIAL_ROOT"});
		},
		
		getDevicesUniverse:function() {
			return this.findWhere({type:"DEVICE_ROOT"});
		},
		
		getServicesUniverse:function() {
			return this.findWhere({type:"SERVICE_ROOT"});
		},
		
		getProgramsUniverse:function() {
			return this.findWhere({type:"PROGRAM_ROOT"});
		},
		
		getLocalUniverses:function() {
			return this.where({"universe-type":"local"});
		},
		
		getUserUniverses:function() {
			return this.where({type:"user"});
			// TODO check if the connected user is allowed to see those
		}
		
  });
	
	return Universes;
	
});
