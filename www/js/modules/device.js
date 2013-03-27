define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/devices/list/list.html",
	"text!templates/devices/list/contact.html",
	"text!templates/devices/list/illumination.html",
	"text!templates/devices/list/keyCard.html",
	"text!templates/devices/list/switch.html",
	"text!templates/devices/list/temperature.html",
	"text!templates/devices/details/details.html",
	"jqueryui"
], function($, _, Backbone, deviceListTemplate,
		contactListTemplate, illuminationListTemplate, keyCardListTemplate,
		switchListTemplate, temperatureListTemplate, deviceDetailsTemplate) {
	// initialize the module
	var Device = {};

	/**
	 * Router to handle the routes for the devices
	 *
	 * @class Device.Router
	 */
	Device.Router = Backbone.Router.extend({
		// define the routes for the devices
		routes: {
			"devices"				: "list",
			"devices/:id"			: "details"
		},

		/**
		 * @constructor
		 */
		initialize:function() {
			var self = this;

			/* this.dispatcher = _.clone(Backbone.Events);

			this.dispatcher.on("savedDevice", function() {
				router.navigate("devices");
				self.list();
			}); */
		},

		/**
		 * @method list Show the list of devices
		 */
		list:function() {
			appRouter.showView(new Device.Views.List());
		},

		/**
		 * Show the details of a device
		 *
		 * @method details
		 * @param id Id of the device to show
		 */
		details:function(id) {
			appRouter.showView(new Device.Views.Details({ model : devices.get(id) }));
		},

		// launch the interface to install a new device
		/* install:function(step) {
			if (this.installView === undefined) {
				this.installView = new Device.Views.Install.First();
			}
			this.installView.render();
		} */
	});

	// instantiate the router
	var router = new Device.Router();

	/**
	 * Abstract class regrouping common characteristics shared by all the devices
	 *
	 * @class Device.Model
	 */
	Device.Model = Backbone.Model.extend({

		/**
		 * @constructor 
		 */
		initialize:function() {
			var self = this;

			// when the user update the name, send the notification to the server
			this.on("change:name", function(model, name) {
				communicator.sendMessage({
					targetType : "1",
					objectId : model.get("id").toString(),
					method : "setUserObjectName",
					args : [{ type : "String", value : name }]
				});
			});

			// each device listens to the event whose id corresponds to its own id. This ensures to
			// receive only relevant events
			dispatcher.on(this.get("id"), function(updatedVariableJSON) {
				self.set(updatedVariableJSON.varName, updatedVariableJSON.value);
			});
		},

	});

	/**
	 * Implementation of temperature sensor
	 * Specific attribute is: 
	 * 	value, containing the last temperature sent by the backend, in degree Celsius
	 *
	 * @class Device.TemperatureSensor
	 */
	Device.TemperatureSensor = Device.Model.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			Device.TemperatureSensor.__super__.initialize.apply(this, arguments);
		}

	});

	/**
	 * Implementation of switch sensor
	 * Specific attributes are:
	 * 	switchNumber. Values are depend of the type of the switch
	 * 	buttonStatus, 0 when Off, 1 when On
	 *
	 * @class Device.SwitchSensor
	 */
	Device.SwitchSensor = Device.Model.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			Device.SwitchSensor.__super__.initialize.apply(this, arguments);
		}

	});

	/**
	 * Implementation of an illumination sensor
	 * @class Device.IlluminationSensor
	 */
	Device.IlluminationSensor = Device.Model.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			Device.IlluminationSensor.__super__.initialize.apply(this, arguments);
		}

	});

	/**
	 * @class Device.KeyCardSensor
	 */
	Device.KeyCardSensor = Device.Model.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			Device.KeyCardSensor.__super__.initialize.apply(this, arguments);
		}
	});

	/**
	 * @class Device.ContactSensor
	 */
	Device.ContactSensor = Device.Model.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			Device.ContactSensor.__super__.initialize.apply(this, arguments);
		}
	});

	// collection
	Device.Collection = Backbone.Collection.extend({
		model: Device.Model,

		/**
		 * Fetch the devices from the server
		 *
		 * @constructor
		 */
		initialize:function() {
			var self = this;

			// listen to the event when the list of devices is received
			dispatcher.on("listDevices", function(devices) {
				_.each(devices, function(device) {
					self.addDevice(device);
				});
				dispatcher.trigger("devicesReady");
			});

			// listen to the backend notifying when a device appears and add it
			dispatcher.on("newDevice", function(device) {
				self.addDevice(device);
			});

			// send the request to fetch the devices
			communicator.sendMessage({ targetType : "0", commandName : "getDevices" });
		},

		// check the type of device sent by the server, cast it and add it to the collection
		addDevice:function(device) {
			if (device.name == null) {
				device.name = "Non d&eacute;fini";
			}
			device.type = parseInt(device.type);
			switch (device.type) {
				case 0:
					this.add(new Device.TemperatureSensor(device));
					break;
				case 1:
					this.add(new Device.IlluminationSensor(device));
					break;
				case 2:
					this.add(new Device.SwitchSensor(device));
					break;
				case 3:
					this.add(new Device.ContactSensor(device));
					break;
				case 4:
					this.add(new Device.KeyCardSensor(device));
					break;
				default:
					console.log("unknown type");
					break;
			}
		}
	});

	// views
	Device.Views = {}
	
	// detailled view of a device
	Device.Views.Details = Backbone.View.extend({
		// el: $("#container"),
		template: _.template(deviceDetailsTemplate),

		// map the events and their callback
		events: {
			"click span.save"				: "saveDevice",
			"keypress :input.deviceName"	: "saveDevice",
			"click span.cancelEditDevice"	: "cancelEditDevice"
		},

		// render the detailled view of a device
		render:function() {

			this.$el.html(this.template({
				device : this.model,
				locations : locations.models
			}));

			switch (this.model.get("type")) {
				case 0:
					$(".sensorType").html("Capteur de temp&eacute;rature");
					$(".sensorValue").html(this.model.get("value") + "°C");
					break;
				case 1:
					$(".sensorType").html("Capteur de luminosit&eacute;");
					$(".sensorValue").html(this.model.get("value") + " Lux");
					break;
				case 2:
					$(".sensorType").html("Interrupteur");
					$(".sensorValue").hide();
					break;
				case 3:
					$(".sensorType").html("Capteur de contact");
					if (this.model.get("contact")) {
						$(".sensorValue").html("Ferm&eacute;");
					} else {
						$(".sensorValue").html("Ouvert");
					}
					break;
				case 4:
					$(".sensorType").html("Lecteur key-card");
					if (this.model.get("inserted")) {
						$(".sensorValue").html("Carte ins&eacute;r&eacute;e");
					} else {
						$(".sensorValue").html("Pas de carte ins&eacute;r&eacute;e");
					}
					break;
				default:
					break;
			}

			return this;
		},

		// save the edits of the device
		saveDevice:function(e) {
			if (e.type === "keypress" && e.keyCode === 13 || e.type === "click") {
				e.preventDefault();

				// update the modified attributes
				var id = $(e.target).closest("form").find("#id").val();
				var name = $(e.target).closest("form").find("#deviceName").val();
				var selectElement = $("select")[0];
				var locationId = parseInt(selectElement[selectElement.options.selectedIndex].value);

				// update the model iif the ids are corresponding
				if (this.model.get("id") == id) {

					if (locationId != -1) {
						communicator.sendMessage({
							targetType : "2",
							commandName : "moveDevice",
							srcLocationId : this.model.get("locationId").toString(),
							destLocationId : locationId.toString(),
							deviceId: this.model.get("id").toString()
						});
					}

					// move the device
					dispatcher.trigger("moveDevice", {
						srcLocationId: this.model.get("locationId"),
						destLocationId: locationId,
						deviceId: id
					});

					this.model.set("name", name);

					// go back to the previous view
					window.history.back();

					return false;
				}
			}
		},

		cancelEditDevice:function() {
			window.history.back();
		}
	});

	// render the list of all the available devices
	Device.Views.List = Backbone.View.extend({
		tpl: _.template(deviceListTemplate),
		tplContact: _.template(contactListTemplate),
		tplIllumination: _.template(illuminationListTemplate),
		tplKeyCard: _.template(keyCardListTemplate),
		tplSwitch: _.template(switchListTemplate),
		tplTemperature: _.template(temperatureListTemplate),

		events : {
			"click span.scan"					: "scanQRCode",
			"click button.validDeviceInstall"	: "installDevice"
		},

		initialize:function() {
			var self = this;

			devices.on("change", function() {
			// dispatcher.on("refreshDeviceList", function() {
				// refresh only when the list is currently displayed
				if (Backbone.history.fragment === "devices") {
					appRouter.showView(self);
					// self.render();
				}
			});

			devices.on("add", function() {
				if (Backbone.history.fragment === "devices") {
					appRouter.showView(self);
					// self.render();
				}
			});
		},

		// launch the interface to scan a QR code
		scanQRCode:function() {
			if (!navigator.camera) {
				alert("camera is not supported");
				return;
			}

			window.plugins.barcodeScanner.scan(
    			function(result) {
        			if (result.cancelled)
            			console.log("the user cancelled the scan");
        			else
        				$(".scannedSensor").text(result.text);
    			},
    			function(error) {
        			console.log("scanning failed: " + error);
    			}
			);

			return false;
		}, 

		// check the validity of the data and send to the backend the information to configure the device
		installDevice:function(e) {
			var selectElement = $("select")[0];

			// retrieve data from the form
			var device = new Device.Model({
				id 			: Math.round(Math.random() * 1000),
				type 		: $(".scannedSensor").text(),
				name 		: $("input.deviceName").val(),
				locationId	: parseInt(selectElement[selectElement.options.selectedIndex].value),
				status 		: 1
			});

			// add the new device to the collection of devices, update the location and refresh the list view once the modal is hidden
			$("#addDeviceModal").on("hidden", function() {
				devices.add(device);

				var location = locations.get(device.get("locationId"));
				location.get("devices").push(device.get("id"));
				location.save();
			});

			// hide the modal
			$("#addDeviceModal").modal("hide");

			// notify the backend
			communicator.sendMessage("newDevice", device.toJSON());
		},

		// render the list of devices
		render:function(direction) {
			var self = this;

			this.$el.html(this.tpl());
			_.each(devices.models, function(device) {
				switch (device.get("type")) {
					case 0:
						$(self.$el).find("tbody").append(self.tplTemperature({ device : device }));
						break;
					case 1:
						$(self.$el).find("tbody").append(self.tplIllumination({ device : device }));
						break;
					case 2:
						$(self.$el).find("tbody").append(self.tplSwitch({ device : device }));
						break;
					case 3:
						$(self.$el).find("tbody").append(self.tplContact({ device : device }));
						break;
					case 4:
						$(self.$el).find("tbody").append(self.tplKeyCard({ device : device }));
						break;
					default:
						break;
				}
			});

			// disable the possibility to launch the installation interface with no camera is detected
			// (user has to scan a qr code while installing a sensor)
			if (!navigator.camera) {
				$("button.showDeviceInstallModal").hide();
			}

			return this;
		}
	});

	return Device;
});
