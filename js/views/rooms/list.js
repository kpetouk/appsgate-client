define([
	"jquery",
	"underscore",
	"backbone",
	"models/room",
	"collections/rooms",
	"roomcontroller",
	"text!templates/rooms/list.html"
], function($, _, Backbone, RoomModel, RoomCollection, RoomController, roomsListTemplate) {

	/**
	 * @class RoomsListView
	 */
	var RoomsListView = Backbone.View.extend({
		el: $("#appsgate"),

		initialize:function() {
			/* var rooms = [
				{ id: 0, name: "lobby" },
				{ id: 1, name: "kitchen" },
				{ id: 2, name: "living room" },
				{ id: 3, name: "bedroom 1" },
				{ id: 4, name: "bedroom 2" },
				{ id: 5, name: "corridor" },
				{ id: 6, name: "restroom" },
				{ id: 7, name: "bathroom" }
			];

			var devices = [
				{ id: 0, name: "PS3", type: "Game Console" },
				{ id: 1, name: "Xbox", type: "Game Console" },
				{ id: 2, name: "Television Living Room", type: "Television" },
				{ id: 3, name: "Alice's iPhone", type: "Smartphone" },
				{ id: 4, name: "Coffee Machine", type: "Machine" },
				{ id: 5, name: "Alarm Clock", type: "Alarm" },
				{ id: 6, name: "Oven", type: "Machine" },
				{ id: 7, name: "Fridge", type: "Machine" },
				{ id: 8, name: "Light Switch", type: "Switch" },
				{ id: 9, name: "Living Room Lamp", type: "Lamp" },
				{ id: 10, name: "Bedroom Lamp", type: "Lamp" },
				{ id: 11, name: "Television Kitchen Room", type: "Television" }
			]; */

			this.collection = new RoomCollection(RoomController.getRooms());
			/* _.each(this.collection.models, function(room) {
			}); */
		},

		/**
		 * Render the list of all the rooms' name
		 *
		 * @method render
		 */
		render:function() {
			var data = {
				rooms: this.collection.models,
				_: _
			};

			this.$el.html(_.template(roomsListTemplate, data));
		},

	});

	return RoomsListView;
});
