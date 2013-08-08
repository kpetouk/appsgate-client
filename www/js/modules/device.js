define([
	"jquery",
	"underscore",
	"backbone",
	"raphael",
	"text!templates/devices/list/list.html",
	"text!templates/devices/list/deviceContainer.html",
	"text!templates/devices/list/contact.html",
	"text!templates/devices/list/illumination.html",
	"text!templates/devices/list/keyCard.html",
	"text!templates/devices/list/switch.html",
	"text!templates/devices/list/temperature.html",
	"text!templates/devices/list/phillipsHue.html",
	"text!templates/devices/list/deviceListByCategory.html",
	"text!templates/devices/details/deviceContainer.html",
	"text!templates/devices/details/editModal.html",
	"text!templates/devices/details/contact.html",
	"text!templates/devices/details/illumination.html",
	"text!templates/devices/details/keyCard.html",
	"text!templates/devices/details/switch.html",
	"text!templates/devices/details/temperature.html",
	"text!templates/devices/details/phillipsHue.html",
	"jqueryui",
	"bootstrapSwitch",
	"bootstrapSlider",
	"colorWheel"
], function($, _, Backbone, Raphael, deviceListTemplate, deviceContainerListTemplate,
		contactListTemplate, illuminationListTemplate, keyCardListTemplate,
		switchListTemplate, temperatureListTemplate, phillipsHueListTemplate,
		deviceListByCategoryTemplate,
		deviceDetailsTemplate, editModalTemplate,
		contactDetailTemplate, illuminationDetailTemplate,
		keyCardDetailTemplate, switchDetailTemplate, temperatureDetailTemplate,
		phillipsHueDetailTemplate) {
	
	// initialize the module
	var Device = {};
	
	// global variables concerning the devices
	window.deviceTypesName = {
		0	: "Capteur de temp&eacute;rature",
		1	: "Capteur de luminosit&eacute;",
		2	: "Interrupteur",
		3	: "Capteur de contact",
		4	: "Lecteur de carte",
		5	: "Capteur de mouvement",
		6	: "Prise gigogne",
		7	: "Lampe Philips Hue"
	};

	/**
	 * Router to handle the routes for the devices
	 *
	 * @class Device.Router
	 */
	Device.Router = Backbone.Router.extend({
		// define the routes for the devices
		routes: {
			"devices": "list",
			"devices/types/:id": "deviceByType",
			"devices/:id": "details"
		},

		/**
		 * @constructor
		 */
		initialize: function() {
		},

		/**
		 * @method list Show the list of devices
		 */
		list: function() {
			appRouter.showView(new Device.Views.List());
		},
		
		deviceByType:function(typeId) {
			appRouter.showView(new Device.Views.DevicesByType({ id: typeId }));
		},

		/**
		 * Show the details of a device
		 *
		 * @method details
		 * @param id Id of the device to show
		 */
		details: function(id) {
			appRouter.showView(new Device.Views.Details({ model: devices.get(id) }));
		}
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
		initialize: function() {
			var self = this;

			// when the user update the name, send the notification to the server
			this.on("change:name", function(model, name) {
				self.remoteCall("setUserObjectName", [{ type : "String", value : name }]);
			});

			// each device listens to the event whose id corresponds to its own id. This ensures to
			// receive only relevant events
			dispatcher.on(this.get("id"), function(updatedVariableJSON) {
				self.set(updatedVariableJSON.varName, updatedVariableJSON.value);
			});
		},
		
		/**
		 * Send a message to the server to perform a remote call
		 * 
		 * @param method Remote method name to call
		 * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
		 */
		remoteCall:function(method, args) {
			// build the message
			var messageJSON = {
				targetType	: "1",
				objectId	: this.get("id"),
				method		: method,
				args		: args
			};
			
			// send the message
			communicator.sendMessage(messageJSON);
		}
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
		initialize: function() {
			Device.TemperatureSensor.__super__.initialize.apply(this, arguments);
			if (this.get("name") === "") {
				this.set("name", "Capteur temp&eacute;rature");
			}
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
		initialize: function() {
			Device.SwitchSensor.__super__.initialize.apply(this, arguments);
			if (this.get("name") === "") {
				this.set("name", "Interrupteur");
			}
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
		initialize: function() {
			Device.IlluminationSensor.__super__.initialize.apply(this, arguments);
			if (this.get("name") === "") {
				this.set("name", "Capteur luminosit&eacute;");
			}
		}

	});

	/**
	 * @class Device.KeyCardSensor
	 */
	Device.KeyCardSensor = Device.Model.extend({
		/**
		 * @constructor
		 */
		initialize: function() {
			Device.KeyCardSensor.__super__.initialize.apply(this, arguments);
			if (this.get("name") === "") {
				this.set("name", "Lecteur de carte");
			}
		}
	});

	/**
	 * @class Device.ContactSensor
	 */
	Device.ContactSensor = Device.Model.extend({
		/**
		 * @constructor
		 */
		initialize: function() {
			Device.ContactSensor.__super__.initialize.apply(this, arguments);
			if (this.get("name") === "") {
				this.set("name", "Capteur contact");
			}
		}
	});

	/**
	 * Implementation of the Phillips Hue lamp
	 * @class Device.PhillipsHue
	 */
	Device.PhillipsHue = Device.Model.extend({
		/**
		 * @constructor
		 */
		initialize: function() {
			Device.PhillipsHue.__super__.initialize.apply(this, arguments);
			if (this.get("name") === "") {
				this.set("name", "Lampe Phillips Hue");
			}
		},
		
		on:function() {
			this.remoteCall("On", []);
		},
		
		off:function() {
			this.remoteCall("Off", []);
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
		initialize: function() {
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
			communicator.sendMessage({
				method: "getDevices",
				args: [],
				callId: "listDevices"
			});
		},

		/**
		 * Check the type of device sent by the server, cast it and add it to the collection
		 * 
		 * @param device
		 */
		addDevice:function(device) {
			if (device.name === null) {
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
				case 7:
					this.add(new Device.PhillipsHue(device));
					break;
				default:
					console.log("unknown type");
					break;
			}
			
			if (device.placeId === "-1") {
				locations.get("-1").get("devices").push(device.id);
			}
	},
		
		getDevicesByType:function() {
			return devices.groupBy(function(device) {
				return device.get("type");
			});
		},
		
		getUnlocatedDevices:function() {
			return devices.filter(function(device) {
				return device.get("placeId") === "-1";
			});
		},
		
		getUnlocatedDevicesByType:function() {
			return _.groupBy(this.getUnlocatedDevices(), function(device) {
				return device.get("type");
			});
		}
	});

	// views
	Device.Views = {};

	// detailled view of a device
	Device.Views.Details = Backbone.View.extend({
		template: _.template(deviceDetailsTemplate),
		tplEditModal: _.template(editModalTemplate),
		tplContact: _.template(contactDetailTemplate),
		tplIllumination: _.template(illuminationDetailTemplate),
		tplKeyCard: _.template(keyCardDetailTemplate),
		tplSwitch: _.template(switchDetailTemplate),
		tplTemperature: _.template(temperatureDetailTemplate),
		tplPhillipsHue: _.template(phillipsHueDetailTemplate),
		
		// map the events and their callback
		events: {
			"click button.valid-button": "validEditDevice",
			"keypress :input.deviceName": "validEditDevice",
			"click .icon-chevron-left": "goBack",
			"click #button-back": "goBack"
		},
		
		/**
		 * @constructor
		 */
		initialize: function() {
			var self = this;
			
			// when the model is updated, update the view
			this.model.on("change", function() {
				self.$el.find(".device-name").html(self.model.get("name"));
				
				if (self.model.get("placeId") !== "-1") {
					self.$el.find(".device-location").html(locations.get(self.model.get("placeId")).get("name"));
				} else {
					self.$el.find(".device-location").html("Non localis&eacute;");
				}
				
				// update the value of the device
				if (self.model.get("type") === 7) { // philips hue
					if (self.model.get("value") === "true") {
						$(".switch").bootstrapSwitch("setState", true);
					} else {
						$(".switch").bootstrapSwitch("setState", false);
					}
				}
			});
		},

		/**
		 * Render the detailled view of a device
		 */
		render: function() {

			switch (this.model.get("type")) {
				case 0: // temperature sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/temperature.jpg",
						sensorType: deviceTypesName[0],
						locations: locations,
						deviceDetails: this.tplTemperature
					}));
					break;

				case 1: // illumination sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/illumination.jpg",
						sensorType: deviceTypesName[1],
						locations: locations,
						deviceDetails: this.tplIllumination
					}));
					break;

				case 2: // switch sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/doubleSwitch.jpg",
						sensorType: deviceTypesName[2],
						locations: locations,
						deviceDetails: this.tplSwitch
					}));
					break;

				case 3: // contact sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/contact.jpg",
						sensorType: deviceTypesName[3],
						locations: locations,
						deviceDetails: this.tplContact
					}));
					break;

				case 4: // key card sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/keycard.jpg",
						sensorType: deviceTypesName[4],
						locations: locations,
						deviceDetails: this.tplKeyCard
					}));
					break;

				case 7: // phillips hue
					this.$el.html(this.template({
						device: this.model,
						sensorType: deviceTypesName[7],
						locations: locations,
						deviceDetails: this.tplPhillipsHue
					}));

					// create the switches and bind their events
					this.$el.find(".switch")
							.bootstrapSwitch()
							.on("switch-change", this.switchChange);
					
					// create the color picker
					// compute its size
					var wheelRadius = Math.min(
							this.$el.find("#color-picker").width(),
							$(window).height()
					);
					wheelRadius -= 200;
				
					// instantiate the color wheel
					window.colorWheel = Raphael.colorwheel(
							this.$el.find("#color-picker").position().left + (this.$el.find("#color-picker").width() - wheelRadius) / 2,
							this.$el.find("#color-picker").position().top + 5,
							wheelRadius,
							"#F00");
					
					// bind the events
					// mobile -> touch
					if (navigator.userAgent.toLowerCase().match(/(ipad|ipod|iphone|android)/)) {
						window.colorWheel.onchange = this.changeIpadColor;
					} else { // desktop -> drag w/ the mouse
						window.colorWheel.ring.node.onmouseup = this.changeColor;
						window.colorWheel.square.node.onmouseup = this.changeColor;
					}
					
					// update the size of the color picker container
					this.$el.find("#color-picker").height(wheelRadius);

					break;
			}
			
			// this.$el.find(".popover-delete").popover();
			$("body").append(this.tplEditModal({
				device: this.model,
				locations: locations
			}));
			
			// bind events of the edit device modal to the view
			var modalView = {
				model: this.model,
				onClick: this.validEditDevice
			};
			_.bindAll(modalView, "onClick");
			
			$("#edit-device-modal .valid-button").bind("click", modalView.onClick);

			return this;
		},

		/**
		 * Save the edits of the device
		 */
		validEditDevice: function(e) {
			if (e.type === "keypress" && e.keyCode === 13 || e.type === "click") {
				e.preventDefault();

				// retrieved the modified attributes
				var name = $(".deviceName").val();
				var placeId = parseInt($("select option:selected").val());

				if (placeId !== -1) {
					/* communicator.sendMessage({
						method: "moveDevice",
						srcPlaceId: this.model.get("deviceId").toString(),
						destPlaceId: placeId.toString(),
						deviceId: this.model.get("id").toString()
					}); */
				}

				// move the device
				/* dispatcher.trigger("moveDevice", {
				 srcLocationId: this.model.get("locationId"),
				 destLocationId: locationId,
				 deviceId: id
				 }); */

				this.model.set("name", name);

				// go back to the previous view
				$("#editDeviceModal").modal("hide");

				return false;
			}
		},
		
		/**
		 * Show the modal window to edit the information about the device
		 */
		editDevice: function() {
			$("#editDeviceModal").modal("show");
		},

		/**
		 * Callback when the user changed the switch
		 * 
		 * @param e Event triggered
		 * @param data Contains the value of the switch
		 */
		switchChange: function(e, data) {
			// build the message
			var messageJSON = {
				targetType: "1",
				objectId: $(".box").attr("id"),
				args: []
			};
			messageJSON.method = (data.value ? "On" : "Off");

			// send the message
			communicator.sendMessage(messageJSON);
		},
		
		/**
		 * Send the new color to the lamp
		 * 
		 * @param color Color to send to the lamp in RGB hexadecimal format
		 */
		changeIpadColor: function(color) {
			// retrieve the lamp id and format the color
			var lampId = $(".box").attr("id");
			var rgb = Raphael.getRGB(color);
			var hsl = Raphael.rgb2hsl(rgb);
			
			// hue
			// build the message
			var messageJSON = {
				targetType : "1",
				objectId: $(".box").attr("id"),
				method: "setColor",
				args: [{ type: "long", value: Math.floor(hsl.h * 65535) }]
			}
			
			// send the message 
			communicator.sendMessage(messageJSON);
			
			// saturation
			// build the message
			messageJSON.method = "setSaturation";
			messageJSON.args = [{ type : "int", value : Math.floor(hsl.s * 255) }];
			
			// send the message
			communicator.sendMessage(messageJSON);
			
			// luminosity
			// build the message
			messageJSON.method = "setBrightness";
			messageJSON.args = [{ type : "long", value : Math.floor(hsl.l * 255) }];
			
			// send the message
			communicator.sendMessage(messageJSON);
		},
		
		changeColor: function(e) {
			var lampId = $(".box").attr("id");
			var rgb = Raphael.getRGB(colorWheel.color());
			var hsl = Raphael.rgb2hsl(rgb);

			// hue
			// build the message
			var messageJSON = {
				targetType : "1",
				objectId: $(".box").attr("id"),
				method: "setColor",
				args: [{ type: "long", value: Math.floor(hsl.h * 65535) }]
			}

			// send the message 
			communicator.sendMessage(messageJSON);

			// saturation
			// build the message
			messageJSON.method = "setSaturation";
			messageJSON.args = [{ type : "int", value : Math.floor(hsl.s * 255) }];
			
			// send the message
			communicator.sendMessage(messageJSON);

			// luminosity
			// build the message
			messageJSON.method = "setBrightness";
			messageJSON.args = [{ type : "long", value : Math.floor(hsl.l * 255) }];

			// send the message
			communicator.sendMessage(messageJSON);
		},
		
		goBack:function() {
			history.back();
		}
	});
	
	Device.Views.DevicesByType = Backbone.View.extend({
		tpl: _.template(deviceListByCategoryTemplate),
		
		render:function() {
			var self = this;
			
			this.$el.html(this.tpl({
				typeId			: this.id,
				deviceTypeName	: deviceTypesName[this.id],
				places			: locations
			}));
			
			this.$el.find(".switch").bootstrapSwitch();
			
			return this;
		}
	});

	// render the list of all the available devices
	Device.Views.List = Backbone.View.extend({
		tpl: _.template(deviceListTemplate),
		tplDeviceContainer: _.template(deviceContainerListTemplate),
		tplContact: _.template(contactListTemplate),
		tplIllumination: _.template(illuminationListTemplate),
		tplKeyCard: _.template(keyCardListTemplate),
		tplSwitch: _.template(switchListTemplate),
		tplTemperature: _.template(temperatureListTemplate),
		tplPhillipsHue: _.template(phillipsHueListTemplate),
		className: "span12",

		events: {
			"click span.scan": "scanQRCode",
			"click button.validDeviceInstall": "installDevice",
			"click button#flashDeviceButton": "flashDevice"
		},

		initialize: function() {
			var self = this;

			devices.on("change", function() {
				// refresh only when the list is currently displayed
				if (Backbone.history.fragment === "devices") {
					appRouter.showView(self);
				}
			});

			devices.on("add", function() {
				if (Backbone.history.fragment === "devices") {
					appRouter.showView(self);
				}
			});
		},

		// launch the interface to scan a QR code
		scanQRCode: function() {
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
		
		flashDevice: function() {
			if (!navigator.camera) {
				alert("camera is not supported");
				return;
			}

			window.plugins.barcodeScanner.scan(
					function(result) {
						if (result.cancelled) {
							console.log("the user cancelled the scan");
						} else {
							$(".scannedSensor").text(result.text);
							appRouter.navigate("#devices/" + result.text, { trigger : true });
						}
					},
					function(error) {
						console.log("scanning failed: " + error);
					}
			);
		},

		// check the validity of the data and send to the backend the information to configure the device
		installDevice: function(e) {
			var selectElement = $("select")[0];

			// retrieve data from the form
			var device = new Device.Model({
				id: Math.round(Math.random() * 1000),
				type: $(".scannedSensor").text(),
				name: $("input.deviceName").val(),
				placeId: parseInt(selectElement[selectElement.options.selectedIndex].value),
				status: 1
			});

			// add the new device to the collection of devices, update the location and refresh the list view once the modal is hidden
			$("#addDeviceModal").on("hidden", function() {
				devices.add(device);

				var location = locations.get(device.get("placeId"));
				location.get("devices").push(device.get("id"));
				location.save();
			});

			// hide the modal
			$("#addDeviceModal").modal("hide");

			// notify the backend
			communicator.sendMessage("newDevice", device.toJSON());
		},

		// user turns on or off a lamp
		switchChange: function(e, data) {
			// retrieve information about action to perform
			var lampId = $($(e.currentTarget).parents("li")[0]).attr("id");
			var value = data.value;

			// build the message
			var messageJSON = {
				targetType: "1",
				objectId: lampId,
				args: []
			};
			messageJSON.method = (value ? "On" : "Off");

			// send the message
			communicator.sendMessage(messageJSON);
		},

		// user changes the brightness of the lamp
		brightnessChange: function(e) {
			var lampId = $($(e.currentTarget).parents("article")[0]).attr("id");

			// build the message
			var messageJSON = {
				targetType: "1",
				objectId: lampId,
				method: "setBrightness",
				args: [{type: "long", value: e.value}]
			};

			// send the message
			communicator.sendMessage(messageJSON);
		},

		saturationChange: function(e) {
			var lampId = $($(e.currentTarget).parents("article")[0]).attr("id");
			console.log(lampId, e.value);

			// build the message
			var messageJSON = {
				targetType: "1",
				objectId: lampId,
				method: "setSaturation",
				args: [{type: "int", value: e.value}]
			};

			// send the message
			communicator.sendMessage(messageJSON);
		},

		colorChange: function(e) {
			var lampId = $($(e.srcElement).parents("article")[0]).attr("id");
			var methodName = $(e.srcElement).val();

			// build the message
			var messageJSON = {
				targetType: "1",
				objectId: lampId,
				method: methodName,
				args: []
			};

			// send the message
			communicator.sendMessage(messageJSON);
		},

		// render the list of devices
		render: function() {
			var self = this;
			
			// render the side menu
			$(".aside-menu-title").html("Dispositifs");
			$(".aside-menu-content").html("");
			
			// group the devices by type
			var types = devices.getDevicesByType();
			
			_.forEach(_.keys(types), function(type) {
				$(".aside-menu-content").append(self.tplDeviceContainer({
					type			: type,
					typeName		: deviceTypesName[type],
					devices			: types[type],
					places			: locations,
					unlocatedDevices: devices.filter(function(d) { return (d.get("placeId") === "-1" && d.get("type") == type) })
				}));
			});
			
			// render the first device type by default
			appRouter.showView(new Device.Views.DevicesByType({ id: _.keys(types)[0] }));
			
			/* this.$el.html(this.tpl());
			
			// compute the number of rows - 1 row contains 2 categories
			var nbRows = _.keys(types).length;
			if (nbRows % 2 === 1) {
				nbRows++;
			}
			
			// render each row
			for (var i = 0; i < nbRows; i += 2) {
				var rowContent = "<div class='row-fluid'>";
				
				var t = [_.keys(types)[i], _.keys(types)[i + 1]];
				for (type in t) {
					switch (t[type]) {
						case "0": // temperature sensor
							rowContent += this.tplDeviceContainer({
								type: "Temp&eacute;rature",
								devices: types[t[type]],
								nbDevices: types[t[type]].length,
								liDeviceTemplate: this.tplTemperature,
								locations: locations
							});
							break;
						case "1": // illumination sensor
							rowContent += this.tplDeviceContainer({
								type: "Luminosit&eacute;",
								devices: types[t[type]],
								nbDevices: types[t[type]].length,
								liDeviceTemplate: this.tplIllumination,
								locations: locations
							});
							break;
						case "2": // switch sensor
							rowContent += this.tplDeviceContainer({
								type: "Interrupteur",
								devices: types[t[type]],
								nbDevices: types[t[type]].length,
								liDeviceTemplate: this.tplSwitch,
								locations: locations
							});
							break;
						case "3": // contact sensor
							rowContent += this.tplDeviceContainer({
								type: "Contact",
								devices: types[t[type]],
								nbDevices: types[t[type]].length,
								liDeviceTemplate: this.tplContact,
								locations: locations
							});
							break;
						case "4": // key card sensor
							rowContent += this.tplDeviceContainer({
								type: "Lecteur carte",
								devices: types[t[type]],
								nbDevices: types[t[type]].length,
								liDeviceTemplate: this.tplKeyCard,
								locations: locations
							});
							break;
						case "7": // phillips hue
							rowContent += this.tplDeviceContainer({
								type: "Phillips Hue",
								devices: types[t[type]],
								nbDevices: types[t[type]].length,
								liDeviceTemplate: this.tplPhillipsHue,
								locations: locations
							});
							break;
					}
				}
				rowContent += "</div>";
				this.$el.find(".devices").append(rowContent);
			} */

			// disable the possibility to launch the installation interface with no camera is detected
			// (user has to scan a qr code while installing a sensor)
			if (!navigator.camera) {
				$("button.showDeviceInstallModal").hide();
			}

			// create the switches and bind their events
			$(".aside-menu-content .switch")
					.bootstrapSwitch()
					.on("switch-change", this.switchChange);

			return this;
		}
	});

	return Device;
});
