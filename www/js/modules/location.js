define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/locations/menu/placeContainer.html",
	"text!templates/locations/menu/addButton.html",
	"text!templates/locations/details/details.html"
], function($, _, Backbone, placeContainerMenuTemplate, addPlaceButtonTemplate, locationDetailsTemplate) {
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
			appRouter.showMenuView(new Location.Views.Menu());
			appRouter.showView(new Location.Views.Details({ model : locations.at(0) }));
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
		 	/* dispatcher.on("updatePlace", function(location) {
		 		if (location.id === self.get("id")) {
		 			self.set(location);
		 		}
		 	}); */

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
			
			// remove potential duplicated entries and trigger a refresh of the list of places event
			this.on("change:devices", function() {
				self.set({ devices : _.uniq(self.get("devices")) });
				dispatcher.trigger("refreshListPlaces");
			});
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
			
			// compute the average value of the sensors
			var average = 0;
			sensors.forEach(function(s) {
				average += parseInt(s.get("value"));
			});
			
			return average / sensors.length;
		},
		
		/**
		 * Compute the average temperature of the place from the temperature sensors in the place
		 * 
		 * @return Average temperature of the place if any temperature sensor, null otherwise
		 */
		getAverageTemperature:function() {
			return this.getAverageValue(this.getTemperatureSensors());
		},
				
		/**
		 * Compute the average illumination of the place from the illumination sensors in the place
		 * 
		 * @return Average illumination of the place if any illumination sensor, null otherwise
		 */
		getAverageIllumination:function() {
			return this.getAverageValue(this.getIlluminationSensors());
		},
		
		/**
		 * Return all the devices of the place that matches a given type
		 * 
		 * @param type Type of the devices to retrieve
		 * @return Array of devices w/ good type
		 */
		getTypeSensors:function(type) {
			type = parseInt(type);
			
			// in case of wrong type, return an empty array
			if (isNaN(type)) {
				return [];
			}
			
			// get all the devices that match the type
			var sensorsId = this.get("devices").filter(function(id) {
				return (devices.get(id) !== undefined && devices.get(id).get("type") === type);
			});
			
			// get all the devices that match the type and the place
			sensors = devices.filter(function(device) {
				return (sensorsId.indexOf(device.get("id").toString()) !== -1);
			});
			
			return sensors;
		},
		
		/**
		 * @return Array of temperature sensors in the place
		 */
		getTemperatureSensors:function() {
			return this.getTypeSensors(0);
		},

		/**
		 * @return Array of illumination sensors in the place
		 */
		getIlluminationSensors:function() {
			return this.getTypeSensors(1);
		},
		
		/**
		 * @return Array of switches in the place
		 */
		getSwitches:function() {
			return this.getTypeSensors(2);
		},
		
		/**
		 * @return Array of contact sensors in the place
		 */
		getContactSensors:function() {
			return this.getTypeSensors(3);
		},
		
		/**
		 * @return Array of key-card readers in the place
		 */
		getKeyCardReaders:function() {
			return this.getTypeSensors(4);
		},
		
		/**
		 * @return Array of movement sensors in the place
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
		 * @return Array of Philips Hue lamps in the place
		 */
		getPhilipsHueLamps:function() {
			return this.getTypeSensors(7);
		},

		/**
		 * Override its synchronization method to send a notification on the network
		 */
		sync:function(method, model) {
			communicator.sendMessage({
				method:	"updatePlace",
				args: [{ type : "JSONObject", value : model.toJSON() }]
			});
		},

		/**
		 * Converts the model to its JSON representation.
		 */
		toJSON:function() {
			return {
				id		: this.get("id").toString(),
				name	: this.get("name"),
				devices	: this.get("devices")
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
					args: [{
						type	: "JSONObject",
						value	: location.toJSON()
					}]
		 		});
		 	});
			
			// when a place has been deleted from the interface, update the devices located inside and notify the backend
			this.on("remove", function(place) {
				// update the devices of the place to be unlocated
				self.postRemovePlace(place);
				
				// notify the backend
				communicator.sendMessage({
					method	: "removePlace",
					args	: [{
						type	: "String",
						value	: place.get("id")
					}]
				});
				
				// tell the menu for places to refresh
				if (Backbone.history.fragment.indexOf("devices") !== -1) {
					dispatcher.trigger("refreshListDevices");
				} else {
					dispatcher.trigger("refreshListPlaces");
				}
				
				// display the first new place
				appRouter.navigate("#locations/" + locations.at(0).get("id"), { trigger : true });
			});

		 	// listen to the event when the list of locations is received
		 	dispatcher.on("listPlaces", function(locations) {
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
		 		dispatcher.trigger("refreshListPlaces");
		 	});

			// listen to the event when a place has been updated
			dispatcher.on("updatePlace", function(place) {
				locations.get(place.id).set(place);
				dispatcher.trigger("refreshListPlaces");
			});
			
			// listen to the event when a place has been removed
			dispatcher.on("removePlace", function(placeId) {
				var removedPlace = locations.get(placeId);
				
				// check if the place exists in the collection
				if (typeof removedPlace !== "undefined") {
					// save the previous first id for checking when refreshing the view
					var oldFirstId = locations.at(0).get("id");
					
					// remove the place from the collection
					locations.remove(removedPlace, { silent : true });

					// update the devices of the place
					self.postRemovePlace(removedPlace);

					// refresh the the menu if the places are displayed
					if (Backbone.history.fragment.indexOf("locations") !== -1 || Backbone.history.fragment === "") {
						dispatcher.trigger("refreshListPlaces");
					}

					// refresh the content if the details of the removed place was displayed
					if (Backbone.history.fragment === "locations/" + placeId ||
							Backbone.history.fragment === "locations" && placeId === "0" ||
							Backbone.history.fragment === "" && placeId === oldFirstId ||
							Backbone.history.fragment === "locations/-1") {
						appRouter.navigate("#locations/" + locations.at(0).get("id"), { trigger : true });
					}
				}
			});

		 	// listen to the event when a device has been moved
		 	dispatcher.on("moveDevice", function(messageData) {
		 		self.moveDevice(messageData.srcPlaceId, messageData.destPlaceId, messageData.deviceId);
		 		dispatcher.trigger("refreshListPlaces");
		 	});

		 	// send the request to fetch the locations
		 	communicator.sendMessage({
				method : "getPlaces",
				args: [],
				callId: "listPlaces"
			});
		 },

		 /**
		  * Return the name of the location where a device is located
		  * 
		  * @param device
		  * @return Name of the location where the device is located
		  */
		getNameByDevice:function(device) {
			try {
				return this.get(device.get("placeId")).get("name");
			} catch (e) {
				return "Non d&eacute;fini";
			}
		},
		
		/**
		 * After removing a place from the collection, its devices need to be unlocated
		 * 
		 * @param place Place that has been removed
		 */
		postRemovePlace:function(place) {
			var self = this;
			
			// devices located in the place are now unlocated
			place.get("devices").forEach(function(deviceId) {
				// update their attributes
				var device = devices.get(deviceId);
				if (typeof device !== "undefined") {
					device.set({ placeId : -1 });
				}

				// add it to the unlocated devices array of the collection
				self.get("-1").get("devices").push(deviceId);
			});
		},

		/**
		 * Update the locations and the device
		 *
		 * @param srcPlaceId
		 * @param destPlaceId
		 * @param deviceId
		 */
		moveDevice:function(srcPlaceId, destPlaceId, deviceId) {
			var srcLocation = locations.get(srcPlaceId);
		 	var destLocation = locations.get(destPlaceId);
		 	// remove the device from the old location
		 	if (srcLocation !== undefined && srcLocation.get("devices").indexOf(deviceId) > -1) {
		 		srcLocation.get("devices").splice(srcLocation.get("devices").indexOf(deviceId), 1);
		 	}
		 	// add the device to the new location
		 	if (destLocation !== undefined && destLocation.get("devices").indexOf(deviceId) === -1) {
		 		destLocation.get("devices").push(deviceId);
		 	}
		 	// update the device itself
		 	devices.get(deviceId).set({ "placeId" : destPlaceId });
		}
	});

	/**
	 * Namespace for the views
	 */
	Location.Views = {};
	
	/**
	 * Render the side menu for the places
	 */
	Location.Views.Menu = Backbone.View.extend({
		tplPlaceContainer	: _.template(placeContainerMenuTemplate),
		tplAddPlaceButton	: _.template(addPlaceButtonTemplate),
		
		events: {
			"switch-change .switch"	: "switchChange"
		},
		
		/**
		 * @constructor
		 */
		initialize:function() {
			var self = this;
			
			// refresh the menu containing the list of places when a new one is received
			dispatcher.on("refreshListPlaces", function() {
				appRouter.showMenuView(self);
			});
			
			// refresh the menu when the devices have been updated
			dispatcher.on("refreshListDevices", function() {
				appRouter.showMenuView(self);
			});
			
			// save the external dom elements binded
			this.addExternalElement([
				$("#add-place-modal .valid-button"),
				$("#add-place-modal .place-name")
			]);
		},
				
		/**
		 * Check the current value of the input text and show a message error if needed
		 * 
		 * @return false if the typed name already exists, true otherwise
		 */
		checkPlace:function() {
			if (locations.where({ name : $("#add-place-modal .place-name").val() }).length > 0) {
				$("#add-place-modal p.text-error").show();
				return false;
			} else {
				$("#add-place-modal p.text-error").hide();
				return true;
			}
		},
				
		/**
		 * Check if the name of the place does not already exist. If not, update the place
		 * Hide the modal when done
		 */
		validEditName:function(e) {
			if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
				// create the place if the name is ok
				if (this.checkPlace()) {
					
					// instantiate a model for the new place
					var place = new Location.Model({
						id		: Math.round(Math.random() * 1000),
						name	: $("#add-place-modal .place-name").val(),
						devices	: []
					});
					
					// add it to the collection
					locations.add(place);
					
				}

				// hide the modal
				$("#add-place-modal").modal("hide");
			} else if (e.type === "keyup") {
				this.checkPlace();
			}
		},
		
		/**
		 * Callback for the switches of the menu. Send a message to turn on or off the lamps
		 * 
		 * @param e JS event automatically sent
		 * @param data Data sent by the switch that contains its value
		 */
		switchChange:function(e, data) {
			// retrieve the placeid
			var placeId = $(e.target).parents(".place-menu-container").attr("id");
			
			// send the message to each lamp
			locations.get(placeId).getPhilipsHueLamps().forEach(function(lamp) {
				data.value ? lamp.on() : lamp.off();
			});
		},
		
		/**
		 * Render the side menu
		 */
		render:function() {
			var self = this;
			
			// clear the content
			this.$el.html("");
			
			// for each location, add a menu item
			locations.forEach(function(location) {
				if (location.get("id") !== "-1" || location.get("id") === "-1" && location.get("devices").length > 0) {
					self.$el.append(self.tplPlaceContainer({
						place : location
					}));
				}
			});
			
			// "add place" button to the side menu
			this.$el.append(this.tplAddPlaceButton());
			
			// create the switches
			this.$el.find(".switch").bootstrapSwitch();
			
			// bind the external elements
			this.bindExternalElements();
			
			return this;
		},

		/**
		 * Bind dom elements that are not in the view
		 */
		bindExternalElements:function() {
			// bind events of the edit modal to the view
			var modalAdd = {
				checkPlace			: this.checkPlace,
				onClickValidButton	: this.validEditName,
				onKeyUpInput		: this.validEditName
			};
			_.bindAll(modalAdd, "checkPlace", "onClickValidButton", "onKeyUpInput");
			$("#add-place-modal .valid-button").on("click", modalAdd.onClickValidButton);
			$("#add-place-modal .place-name").on("keyup", modalAdd.onKeyUpInput);
		}
	});

	/**
	 * Detailled view of a place
	 */
	Location.Views.Details = Backbone.View.extend({
		tpl: _.template(locationDetailsTemplate),

		/**
		 * Bind events of the DOM elements from the view to their callback
		 */
		events: {
			"click span.previousDetailsLocation"	: "goBackToList",
			"click button#delete-place-button"		: "deletePlace"
		},

		/**
		 * @constructor
		 */
		initialize:function() {
			var self = this;
			
			// refresh itself when the place has been updated
			this.model.on("change", function() {
				appRouter.showView(self);
			});
			
			// save the external dom elements binded
			this.addExternalElement([
				$("#edit-name-place-modal .valid-button"),
				$("#edit-name-place-modal .place-name")
			]);
		},

		/**
		 * Check the current value of the input text and show a message error if needed
		 * 
		 * @return false if the typed name already exists, true otherwise
		 */
		checkPlace:function() {
			if (locations.where({ name : $("#edit-name-place-modal .place-name").val() }).length > 0) {
				$("#edit-name-place-modal p.text-error").show();
				return false;
			} else {
				$("#edit-name-place-modal p.text-error").hide();
				return true;
			}
		},
				
		/**
		 * Check if the name of the place does not already exist. If not, update the place
		 * Hide the modal when done
		 */
		validEditName:function(e) {
			if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
				// update the name if it is ok
				if (this.checkPlace()) {
					this.model.set("name", $("#edit-name-place-modal .place-name").val());
				}
				
				// send the update to the backend
				this.model.save();

				// hide the modal
				$("#edit-name-place-modal").modal("hide");
			} else if (e.type === "keyup") {
				this.checkPlace();
			}
		},

		/**
		 * Return to the list of places
		 */
		goBackToList:function() {
			window.history.back();
		},
		
		deletePlace:function() {
			locations.remove(this.model);
		},

		/**
		 * Render the view
		 */
		render:function() {
			// render the view itselft
			this.$el.html(this.tpl({
				place : this.model,
				deviceTypes	: deviceTypesName
			}));
			
			// put the name of the place by default in the modal to edit
			$("#edit-name-place-modal .place-name").val(this.model.get("name"));
			
			// hide the error message
			$("#edit-name-place-modal p.text-error").hide();
			
			// bind dom elements outside of the view
			this.bindExternalElements();
			
			return this;
		},
		
		/**
		 * Bind dom elements that are not in the view
		 */
		bindExternalElements:function() {
			// bind events of the edit modal to the view
			var modalEdit = {
				model				: this.model,
				checkPlace			: this.checkPlace,
				onClickValidButton	: this.validEditName,
				onKeyUpInput		: this.validEditName
			};
			_.bindAll(modalEdit, "checkPlace", "onClickValidButton", "onKeyUpInput");
			$("#edit-name-place-modal .valid-button").on("click", modalEdit.onClickValidButton);
			$("#edit-name-place-modal .place-name").on("keyup", modalEdit.onKeyUpInput);
		}
	});

	return Location;
});
