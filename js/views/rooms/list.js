define([
	"jquery",
	"underscore",
	"backbone",
	"models/room",
	"collections/rooms",
	"text!templates/rooms/list.html"
], function($, _, Backbone, RoomModel, RoomCollection, roomsListTemplate) {

	/**
	 * @class RoomsListView
	 */
	var RoomsListView = Backbone.View.extend({
		el: $("#appsgate"),

		initialize:function() {
			var rooms = [
				{ name: "lobby" },
				{ name: "kitchen" },
				{ name: "living room" },
				{ name: "bedroom 1" },
				{ name: "bedroom 2" },
				{ name: "corridor" },
				{ name: "restroom" },
				{ name: "bathroom" }
			];

			this.collection = new RoomCollection(rooms);
		},

		/**
		 * Render the list of all the rooms' name
		 *
		 * @method render
		 */
		render:function() {
			console.log("render the list of rooms");
			var data = {
				rooms: this.collection.models,
				_: _
			};

			this.$el.html(_.template(roomsListTemplate, data));
		},

	});

	return RoomsListView;
});
