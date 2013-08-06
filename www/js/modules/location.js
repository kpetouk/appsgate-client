define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/locations/placeContainer.html",
	"text!templates/locations/addButton.html",
	"text!templates/locations/details.html",
	"text!templates/devices/list/list.html",
	"text!templates/devices/list/contact.html",
	"text!templates/devices/list/illumination.html",
	"text!templates/devices/list/keyCard.html",
	"text!templates/devices/list/switch.html",
	"text!templates/devices/list/temperature.html",
	"text!templates/devices/list/phillipsHue.html"
], function($, _, Backbone, placeContainerListTemplate, addPlaceTemplate, locationDetailsTemplate, deviceListTemplate,
			contactListTemplate, illuminationListTemplate, keyCardListTemplate,
			switchListTemplate, temperatureListTemplate, phillipsHueListTemplate) {
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
			appRouter.showView(new Location.Views.List());
		},

		// show the details of a locations (i.e. list of devices in this location)
		details:function(id) {
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
		 		if (location.id === self.get("id")) {
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
		
		/**
		 * Compute the average value of given sensors
		 * 
		 * @param sensors Array of sensors
		 * @return Average value of the sensors if any, null otherwise
		 */
		getAverageValue:function(sensors) {
			// return null if there is no temperature sensors in the room
			if (sensors.length === 0) {
				return null;
			}
			
			var average = 0;
			sensors.forEach(function(s) {
				average += s.get("value");
			});
			
			return average / sensors.length;
		},
		
		/**
		 * Compute the average temperature of the place from the temperature sensors in the place
		 * 
		 * @returns Average temperature of the place if any temperature sensor, null otherwise
		 */
		getAverageTemperature:function() {
			return this.getAverageValue(this.getTemperatureSensors());
		},
				
		/**
		 * Compute the average illumination of the place from the illumination sensors in the place
		 * 
		 * @returns Average illumination of the place if any illumination sensor, null otherwise
		 */
		getAverageIllumination:function() {
			return this.getAverageValue(this.getIlluminationSensors());
		},
		
		/**
		 * Return all the devices of the place that matches a given type
		 * 
		 * @param type Type of the devices to retrieve
		 * @returns Array of devices w/ good type
		 */
		getTypeSensors:function(type) {
			type = parseInt(type);
			
			// in case of wrong type, return an empty array
			if (isNaN(type)) {
				return [];
			}
			
			var sensorsId = this.get("devices").filter(function(id) {
				return (devices.get(id) !== undefined && devices.get(id).get("type") === type);
			});
			
			sensors = devices.filter(function(device) {
				return (sensorsId.indexOf(device.get("id").toString()) !== -1);
			});
			
			return sensors;
		},
		
		/**
		 * @returns Array of temperature sensors in the place
		 */
		getTemperatureSensors:function() {
			return this.getTypeSensors(0);
		},
			
		/**
		 * @returns Array of illumination sensors in the place
		 */
		getIlluminationSensors:function() {
			return this.getTypeSensors(1);
		},
		
		/**
		 * @returns Array of switches in the place
		 */
		getSwitches:function() {
			return this.getTypeSensors(2);
		},
		
		/**
		 * @returns Array of contact sensors in the place
		 */
		getContactSensors:function() {
			return this.getTypeSensors(3);
		},
		
		/**
		 * @returns Array of key-card readers in the place
		 */
		getKeyCardReaders:function() {
			return this.getTypeSensors(4);
		},
		
		/**
		 * @returns Array of movement sensors in the place
		 */
		getMovementSensors:function() {
			return this.getTypeSensors(5);
		},
		
		/**
		 * @returns Array of plugs in the place
		 */
		getPlugs:function() {
			return this.getTypeSensors(6);
		},
		
		/**
		 * @returns Array of Philips Hue lamps in the place
		 */
		getPhilipsHueLamps:function() {
			return this.getTypeSensors(7);
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
			
			// sort the locations alphabetically
			this.comparator = function(location) {
				return location.get("name");
			};
			
			// add the location w/ id -1 for the unlocated devices
			this.add({
				id : "-1",
				name: "Non localis&eacute;",
				devices: []
			});

		 	// when a location has been created and added by the user, notify the backend
		 	this.on("add", function(location) {
		 		communicator.sendMessage({
		 			method : "newPlace",
					args: [location.toJSON()]
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
		 	dispatcher.on("newPlace", function(location) {
		 		// location is added silently because we dont want to fire the event 'add' on the collection
		 		// which notifies the backend for a new location
		 		self.add(location, { silent : true });
				
		 		// tell the list to refresh
		 		dispatcher.trigger("refreshLocationList");
		 	});

		 	// listen to the event when a device has been moved
		 	dispatcher.on("moveDevice", function(messageData) {
		 		self.moveDevice(messageData.srcLocationId, messageData.destLocationId, messageData.deviceId);
		 		dispatcher.trigger("refreshLocationList");
		 	});

		 	// send the request to fetch the locations
		 	communicator.sendMessage({
				method : "getPlaces",
				args: [],
				callId: "listLocations"
			});
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
		 	if (srcLocation !== undefined && srcLocation.get("devices").indexOf(deviceId) > -1) {
		 		srcLocation.get("devices").splice(srcLocation.get("devices").indexOf(deviceId), 1);
		 	}
		 	// add the device to the new location
		 	if (destLocation !== undefined && destLocation.get("devices").indexOf(deviceId) === -1) {
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
		// template: _.template(locationListTemplate),
		tplPlaceContainer: _.template(placeContainerListTemplate),
		tplAddPlace: _.template(addPlaceTemplate),

		events: {
			"keyup :input.locationName"			: "checkLocation",
			"click div"	: "showPlace"
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
			});
			
			// bind events of the add place modal to the view
			$("#add-place-modal .valid-button").on("click", this.addLocation);
			$("#add-place-modal .place-name").on("keypress", this.addLocation);
			$("#add-place-modal .place-name").on("keyup", this.checkLocation);
		},
				
		showPlace:function(e) {
			console.log("plop!!!!!", e);
		},

		// adding a new location
		addLocation:function(e) {

			// if the user pressed the return key or clicked on the validate button
			if (e.type === "keypress" && e.keyCode === 13 || e.type === "click") {
				e.preventDefault();

				var location = new Location.Model({
					id 		: Math.round(Math.random() * 1000),
					name 	: $(".place-name").val(),
					devices : []	
				});

				if (locations.where({ name : location.get("name") }).length > 0) {
					$("#add-place-modal").modal("hide");
					return;
				}

				// add the new location once the modal is hidden
				// the backend is notified through the callback of the collection on the event 'add' on the collection
				// the view is refreshed throught the callback of the view on the event 'add' on the collection
				/* $("#add-place-modal").on("hidden", function() {
					console.log("plop");
					locations.add(location);
				}); */

				$("#add-place-modal").modal("hide");
				locations.add(location);
				// this.render();
				// hide the modal
			}

		},

		// check the current value of the input text and show a message error if needed
		checkLocation:function() {
			if (locations.where({ name : $("#add-place-modal .place-name").val() }).length > 0) {
				$("#add-place-modal p.text-error").show();
			} else {
				$("#add-place-modal p.text-error").hide();
			}
		},

		render:function() {
			var self = this;
			
			// initialize the html content of the view
			// this.$el.html(this.template());
			
			// render the side menu
			$(".aside-menu-content").html("");
			locations.forEach(function(location) {
				if (location.get("id") !== "-1" || location.get("id") === "-1" && location.get("devices").length > 0) {
					$(".aside-menu-content").append(self.tplPlaceContainer({
						place : location
					}));
				}
			});
			
			// "add place" button to the side menu
			// $(".aside-menu-content").append("<button class='btn add-place-button'><i class='icon-plus'></i> Ajouter pi&egrave;ce</button>");
			$(".aside-menu-content").append(this.tplAddPlace());
			
			// render the first place
			appRouter.showView(new Location.Views.Details({ model : locations.at(0) }));
			
			/* locations.forEach(function(location) {
				var htmlLiDevices = "";
				
				// render a line for each location's device
				location.get("devices").forEach(function(deviceId) {
					var device = devices.where({ id : deviceId })[0];

					// can be null, data are not reliable...
					if (device !== undefined) {
						switch (device.get("type")) {
							case 0: // temperature sensor
								htmlLiDevices += self.tplTemperature({
									device			: device,
									additionalInfo	: "Capteur temp&eacute;rature"
								});
								break;

							case 1: // illumination sensor
								htmlLiDevices += self.tplIllumination({
									device			: device,
									additionalInfo	: "Capteur luminosit&eacute;"
								});
								break;

							case 2: // switch sensor
								htmlLiDevices += self.tplSwitch({
									device			: device,
									additionalInfo	: "Interrupteur"
								});
								break;

							case 3: // contact sensor
								htmlLiDevices += self.tplContact({
									device			: device,
									additionalInfo	: "Capteur contact"
								});
								break;

							case 4: // key card sensor
								htmlLiDevices += self.tplKeyCard({
									device			: device,
									additionalInfo	: "Lecteur carte"
								});
								break;

							case 7: // phillips hue
								htmlLiDevices += self.tplPhillipsHue({
									device			: device,
									additionalInfo	: "Phillips Hue"
								});
								break;
						}
					}
				});
				
				self.$el.find(".list-locations").append(
					self.tplPlaceContainer({
						name:location.get("name"),
						nbDevices:location.get("devices").length,
						liDevices:htmlLiDevices
					})
				);
			}); */
			
			// render each row
			/* for (var i = 0; i < locations.models.length; i += 2) {
				// render two locations in a row
				var locationsInRow = [locations.at(i), locations.at(i + 1)];
				
				// open the html anchor
				var rowContent = "<div class='row-fluid'>";
				
				// render each location
				_.forEach(locationsInRow, function(location) {
					// last element can be undefined
					if (location !== undefined) {
						
						var htmlLiDevices = "";
						
						// add the location to the row
						rowContent += self.tplPlaceContainer({
							name		: location.get("name"),
							nbDevices	: location.get("devices").length,
							liDevices	: htmlLiDevices
						});
					}
				});
				
				rowContent += "</div>";
				this.$el.find(".locations").append(rowContent);
			} */
			
			// create the switches and bind their events
			$(".switch")
					.bootstrapSwitch()
					.on("switch-change", this.switchChange);
			
			return this;
		}
	});

	// detail view of a location
	Location.Views.Details = Backbone.View.extend({
		// el: $(".body-content"),
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
						Backbone.history.fragment.substring(10, Backbone.history.fragment.length) === self.model.get("id")) {
					appRouter.showView(self);
				}
			});
		},

		goBackToList:function() {
			window.history.back();
		},

		render:function() {
			this.$el.html(this.tpl({
				place : this.model,
				deviceTypes	: deviceTypesName
			}));
			
			return this;
		}
	});

	return Location;
});
