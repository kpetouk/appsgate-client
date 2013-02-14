define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/locations/list.html",
	"text!templates/locations/details.html",
	"text!templates/devices/list.html"
], function($, _, Backbone, locationListTemplate, locationDetailsTemplate, deviceListTemplate) {
	// initialize the module
	var Location = {};

	// router
	Location.Router = Backbone.Router.extend({
		routes: {
			"locations"		: "list",
			"locations/:id"	: "details"
		},

		// list all the locations
		list:function() {
			/* this.navigate("locations");
			if (this.listView === undefined) {
				this.listView = new Location.Views.List();
			}
			this.listView.render(); */
			var listView = new Location.Views.List();
			listView.render();
		},

		// show the details of a locations (i.e. list of devices in this location)
		details:function(id) {
			var detailsView = new Location.Views.Details({ model : locations.get(id) });
			detailsView.render();
		}
	});

	// instantiate the router
	var router = new Location.Router();

	// model
	Location.Model = Backbone.Model.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			var self = this;

			// listen to update from the backend
			dispatcher.on("updateLocation", function(location) {
				if (location.id == self.get("id")) {
					self.set("name", location.name),
					self.set("devices", location.devices);
				}
			});
		},

		// override its synchronization method to send a notification on the network
		sync:function(method, model) {
			communicator.sendMessage("updateLocation", model.toJSON());
		}
	});
	
	// collection
	Location.Collection = Backbone.Collection.extend({
		model: Location.Model,

		/**
		 * Fetch the locations from the server
		 *
		 * @constructor
		 */
		initialize:function() {
		 	var self = this;

		 	// listen to the event when the list of locations is received
		 	dispatcher.on("listLocations", function(locations) {
		 		_.each(locations, function(location) {
		 			self.add(location);
		 		});
		 		dispatcher.trigger("locationsReady");
		 	});

		 	// listen to the event when a location appears and add it
		 	dispatcher.on("newLocation", function(location) {
		 		self.add(location);
		 	});

		 	// send the request to fetch the locations
		 	communicator.sendMessage("getLocations", null);
		 },

		 /**
		  * Return the name of the location where a device is located
		  * @param device
		  * @return Name of the location where the device is located
		  */
		getNameByDevice:function(device) {
			return this.get(device.get("locationId")).get("name");
		}
	});

	// views
	Location.Views = {};

	// render the list of all the rooms
	Location.Views.List = Backbone.View.extend({
		el: $("#container"),
		template: _.template(locationListTemplate),

		events: {
			"click button.valid-install"		: "addLocation",
			"keypress :input.locationName"		: "addLocation",
			"keyup :input.locationName"			: "checkLocation"
		},

		/**
		 * @constructor
		 */
		initialize:function() {
			var self = this;

			locations.on("change", function() {
				// check if the list view is currently displayed
				if (Backbone.history.fragment === "locations" || Backbone.history.fragment === "") {
					self.render();
				}
			});

			locations.on("add", function() {
				// check if the list view is currently displayed
				if (Backbone.history.fragment === "locations" || Backbone.history.fragment === "") {
					self.render();
				}
			});
		},

		// adding a new location
		addLocation:function(e) {
			// if the user pressed the return key or clicked on the validate button
			if (e.type === "keypress" && e.keyCode === 13 || e.type === "click") {
				var location = new Location.Model({
					id 		: Math.round(Math.random() * 1000),
					name 	: $("input").val(),
					devices : []	
				});

				if (locations.where({ name : location.get("name") }).length > 0) {
					return;
				}

				// add the new location (and implicitely refresh the list view) once the modal is hidden
				$("#addLocationModal").on("hidden", function() {
					locations.add(location);
				});

				// hide the modal
				$("#addLocationModal").modal("hide");

				// notify the backend
				communicator.sendMessage("newLocation", location.toJSON());
			}
		},

		// check the current value of the input text and show a message error if needed
		checkLocation:function() {
			if (locations.where({ name : $("input").val() }).length > 0) {
				$("p.text-error").show();
			} else {
				$("p.text-error").hide();
			}
		},

		render:function() {
			this.$el.html(this.template({ locations: locations.models }));
		}
	});

	// detail view of a location
	Location.Views.Details = Backbone.View.extend({
		el: $("#container"),
		template: _.template(locationDetailsTemplate),
		listDeviceTemplate: _.template(deviceListTemplate),

		events: {
			"click span.previousDetailsLocation"	: "goBackToList"
		},

		initialize:function() {
			var self = this;

			locations.on("change", function() {
				// refresh only when the view is currently displayed
				if (Backbone.history.fragment.substring(0, 9) === "locations" &&
						Backbone.history.fragment.substring(10, Backbone.history.fragment.length) == self.model.get("id")) {
					self.render();
				}
			});
		},

		goBackToList:function() {
			window.history.back();
		},

		render:function() {
			this.$el.html(this.template({ location : this.model }));
			this.$el.append(this.listDeviceTemplate({ devices : devices.where({ locationId : this.model.get("id") }) }));
		}
	})

	return Location;
});
