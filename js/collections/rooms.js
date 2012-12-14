define([
	"underscore",
	"backbone",
	"models/room"
], function(_, Backbone, RoomModel) {

	/**
	 * @class RoomCollection
	 */
	var RoomCollection = Backbone.Collection.extend({
		model: RoomModel
	});

	return RoomCollection;

});
