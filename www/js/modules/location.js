define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/locations/list.html",
	"text!templates/locations/details.html",
	"text!templates/devices/list/list.html",
	"text!templates/devices/list/contact.html",
	"text!templates/devices/list/illumination.html",
	"text!templates/devices/list/keyCard.html",
	"text!templates/devices/list/switch.html",
	"text!templates/devices/list/temperature.html"
], function($, _, Backbone, locationListTemplate, locationDetailsTemplate, deviceListTemplate,
			contactListTemplate, illuminationListTemplate, keyCardListTemplate,
			switchListTemplate, temperatureListTemplate) {
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
			// console.log("slqkjdhflqksdjfhqslkdjhfqslk");
			/* this.navigate("locations");
			if (this.listView === undefined) {
				this.listView = new Location.Views.List();
			}
			this.listView.render(); */
			// var listView = new Location.Views.List();
			// listView.render();
			appRouter.showView(new Location.Views.List());
		},

		// show the details of a locations (i.e. list of devices in this location)
		details:function(id) {
			// var detailsView = new Location.Views.Details({ model : locations.get(id) });
			// detailsView.render();
			appRouter.showView(new Location.Views.Details({ model : locations.get(id) }));
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

			// listen to the event when one or several attributes have been updated
		 	dispatcher.on("updateLocation", function(location) {
		 		if (location.id == self.get("id")) {
		 			self.set(location);
		 		}
		 	});

			// listen to update from the backend
			/* dispatcher.on("updateLocation", function(location) {
				if (location.id == self.get("id")) {
					self.set("name", location.name),
					self.set("devices", location.devices);
				}
			}); */
			/* dispatcher.on("moveDevice", function(messageData) {
				if (messageData.srcLocationId == self.get("id")) {
					self.get("devices").split();
				}
			}) */
		},

		// override its synchronization method to send a notification on the network
		sync:function(method, model) {
			// communicator.sendMessage("updateLocation", model.toJSON());
		},

		toJSON:function() {
			return {
				id: this.get("id").toString(),
				name: this.get("name"),
				devices: this.get("devices")
			} 
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

		 	// when a location has been created and added by the user, notify the backend
		 	this.on("add", function(location) {
		 		console.log("location has been added to the collection", location);
		 		communicator.sendMessage({
		 			targetType : "2",
		 			commandName : "newLocation",
		 			location : location.toJSON()
		 		});
		 	});

		 	// listen to the event when the list of locations is received
		 	dispatcher.on("listLocations", function(locations) {
		 		_.each(locations, function(location) {
		 			self.add(location, { silent : true });
		 		});
		 		dispatcher.trigger("locationsReady");
		 	});

		 	// listen to the event when a location appears and add it
		 	dispatcher.on("newLocation", function(location) {
		 		// location is added silently because we dont want to fire the event 'add' on the collection
		 		// which notifies the backend for a new location
		 		self.add(location, { silent : true });
		 		// tell the list to refresh
		 		dispatcher.trigger("refreshLocationList");
		 		// dispatcher.trigger("refresh")
		 	});

		 	// listen to the event when a device has been moved
		 	dispatcher.on("moveDevice", function(messageData) {
		 		self.moveDevice(messageData.srcLocationId, messageData.destLocationId, messageData.deviceId);
		 		dispatcher.trigger("refreshLocationList");
		 	});

		 	// send the request to fetch the locations
		 	communicator.sendMessage({ targetType : "2", commandName : "getLocations" });
		 },

		 /**
		  * Return the name of the location where a device is located
		  * @param device
		  * @return Name of the location where the device is located
		  */
		getNameByDevice:function(device) {
			try {
				return this.get(device.get("locationId")).get("name");
			} catch (e) {
				return "Non d&eacute;fini";
			}
		},

		/**
		 * Update the locations and the device
		 *
		 * @param srcLocationId
		 * @param destLocationId
		 * @param deviceId
		 */
		moveDevice:function(srcLocationId, destLocationId, deviceId) {
			var srcLocation = locations.get(srcLocationId);
		 	var destLocation = locations.get(destLocationId);
		 	// remove the device from the old location
		 	if (srcLocation != undefined && srcLocation.get("devices").indexOf(deviceId) > -1) {
		 		srcLocation.get("devices").splice(srcLocation.get("devices").indexOf(deviceId), 1);
		 	}
		 	// add the device to the new location
		 	if (destLocation != undefined && destLocation.get("devices").indexOf(deviceId) == -1) {
		 		destLocation.get("devices").push(deviceId);
		 	}
		 	// update the device itself
		 	devices.get(deviceId).set({ "locationId" : destLocationId });
		}
	});

	// views
	Location.Views = {};

	// render the list of all the rooms
	Location.Views.List = Backbone.View.extend({
		// el: $("#container"),
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
					appRouter.showView(self);
					// self.render();
				}
			});

			locations.on("add", function() {
				// check if the list view is currently displayed
				if (Backbone.history.fragment === "locations" || Backbone.history.fragment === "") {
					appRouter.showView(self);
					// self.render();
				}
			});

			dispatcher.on("refreshLocationList", function() {
				// check if the list view is currently displayed
				if (Backbone.history.fragment === "locations" || Backbone.history.fragment === "") {
					appRouter.showView(self);
					// self.render();
				}
			})
		},

		// adding a new location
		addLocation:function(e) {

			// if the user pressed the return key or clicked on the validate button
			if (e.type === "keypress" && e.keyCode === 13 || e.type === "click") {
				e.preventDefault();

				var location = new Location.Model({
					id 		: Math.round(Math.random() * 1000),
					name 	: $("input").val(),
					devices : []	
				});

				if (locations.where({ name : location.get("name") }).length > 0) {
					return;
				}

				// add the new location once the modal is hidden
				// the backend is notified through the callback of the collection on the event 'add' on the collection
				// the view is refreshed throught the callback of the view on the event 'add' on the collection
				$("#addLocationModal").on("hidden", function() {
					locations.add(location);
				});

				console.log("added a location through modal interface");

				// hide the modal
				$("#addLocationModal").modal("hide");
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
			console.log("rendering locations list", this.$el);
			this.$el.html(this.template({ locations: locations.models }));
		}
	});

	// detail view of a location
	Location.Views.Details = Backbone.View.extend({
		// el: $("#container"),
		tpl: _.template(locationDetailsTemplate),
		listDeviceTpl: _.template(deviceListTemplate),
		tplContact: _.template(contactListTemplate),
		tplIllumination: _.template(illuminationListTemplate),
		tplKeyCard: _.template(keyCardListTemplate),
		tplSwitch: _.template(switchListTemplate),
		tplTemperature: _.template(temperatureListTemplate),

		events: {
			"click span.previousDetailsLocation"	: "goBackToList"
		},

		initialize:function() {
			var self = this;

			dispatcher.on("refreshLocationList", function() {
				// refresh only when the view is currently displayed
				if (Backbone.history.fragment.substring(0, 9) === "locations" &&
						Backbone.history.fragment.substring(10, Backbone.history.fragment.length) == self.model.get("id")) {
					// self.render();
					appRouter.showView(self);
				}
			});
		},

		goBackToList:function() {
			window.history.back();
		},

		render:function() {
			var self = this;

			this.$el.html(this.tpl({ location : this.model }));
			this.$el.append(this.listDeviceTpl());
			_.each(devices.where({ locationId : this.model.get("id") }), function(device) {
				switch (device.get("type")) {
					case 0:
						$(self.el).find("tbody").append(self.tplTemperature({ device : device }));
						break;
					case 1:
						$(self.el).find("tbody").append(self.tplIllumination({ device : device }));
						break;
					case 2:
						$(self.el).find("tbody").append(self.tplSwitch({ device : device }));
						break;
					case 3:
						$(self.el).find("tbody").append(self.tplContact({ device : device }));
						break;
					case 4:
						$(self.el).find("tbody").append(self.tplKeyCard({ device : device }));
						break;
					default:
						break;
				}
			});
			// this.$el.append(this.listDeviceTemplate({ devices : devices.where({ locationId : this.model.get("id") }) }));
		}
	})

	return Location;
});
