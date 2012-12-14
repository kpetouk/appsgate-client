define([
	"underscore",
	"backbone",
	"models/homecomponent"
], function(_, Backbone, HomeComponent) {

	/**
	 * @class RoomModel
	 */
	var RoomModel = HomeComponentModel.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			this.devices = new DevicesCollection();
		}
	});

	return RoomModel;

});
