define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/devices/details.html",
	"text!templates/devices/list.html",
	"text!templates/devices/edit.html",
	"text!templates/devices/installFirst.html",
	"jqueryui"
], function($, _, Backbone, deviceDetailsTemplate, deviceListTemplate,
		deviceEditTemplate, deviceInstallFirstTemplate) {
	// initialize the module
	var Device = {};

	// router
	Device.Router = Backbone.Router.extend({
		routes: {
			"devices"				: "list",
			"devices/d:direction"	: "list",
			"devices/install/:step"	: "install",
			"devices/:id"			: "details"
		},

		initialize:function() {
			var self = this;

			this.dispatcher = _.clone(Backbone.Events);

			this.dispatcher.on("savedDevice", function() {
				router.navigate("devices");
				self.list();
			});
		},

		// list all the devices
		list:function(direction) {
			/* this.navigate("devices");
			if (direction !== undefined) {
				if (direction !== "right") {
					direction = "left";
				}
			} */

			if (this.listView === undefined) {
				this.listView = new Device.Views.List();
			}

			this.listView.render();
		},

		// give details on a device
		details:function(id) {
			var detailsView = new Device.Views.Details({ model: devices.get(id) });
			detailsView.render();
		},

		// launch the interface to install a new device
		install:function(step) {
			if (this.installView === undefined) {
				this.installView = new Device.Views.Install.First();
			}
			this.installView.render();
		}
	});

	// instantiate the router
	var router = new Device.Router();

	// model
	Device.Model = Backbone.Model.extend({

		/**
		 * @constructor
		 */
		initialize:function() {
			var self = this;

			// listen to update from the backend
			dispatcher.on("updateDevice", function(device) {
				if (device.id == self.get("id")) {
					self.set("name", device.name);
					self.set("locationId", device.locationId);
				}
			});
		},

		// override its synchronization method
		sync:function(method, model) {
			communicator.sendMessage("updateDevice", model.toJSON());
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
					self.add(device);
				});
				dispatcher.trigger("devicesReady");
			});

			// listen to the backend notifying when a device appears and add it
			dispatcher.on("newDevice", function(device) {
				self.add(device);
			});

			// send the request to fetch the devices
			communicator.sendMessage("getDevices", null);
		}
	});

	// views
	Device.Views = {}
	
	// detailled view of a device
	Device.Views.Details = Backbone.View.extend({
		el: $("#container"),
		// template: _.template(deviceDetailsTemplate),
		editTemplate: _.template(deviceEditTemplate),

		// map the events and their callback
		events: {
			"click span.save"				: "saveDevice",
			"keypress :input.deviceName"	: "saveDevice",
			"click span.cancelEditDevice"	: "cancelEditDevice"
		},

		// render the detailled view of a device
		render:function() {
			this.$el.html(this.editTemplate({
				device : this.model,
				locations : locations.models
			}));

			/* var self = this;

			this.$el.toggle("slide", { direction : "left" }, "fast", function() {
				self.$el.html(self.editTemplate({
					device : self.model,
					locations : locations.models
				}));
				self.$el.toggle("slide", { direction : "right" }, "fast");
			}); */

			return this;
		},

		// save the edits of the device
		saveDevice:function(e) {
			if (e.type === "keypress" && e.keyCode === 13 || e.type === "click") {
				e.preventDefault();

				// update the modified attributes
				var id = parseInt($(e.target).closest("form").find("#id").val());
				var name = $(e.target).closest("form").find("#deviceName").val();
				var selectElement = $("select")[0];
				var locationId = parseInt(selectElement[selectElement.options.selectedIndex].value);

				// update the model iif the ids are corresponding
				if (this.model.get("id") == id) {
					// remove the device from the old location
					var oldLocation = locations.get(this.model.get("locationId"));
					oldLocation.get("devices").splice(oldLocation.get("devices").indexOf(this.model.get("id")), 1);
					oldLocation.save();

					// update the model and notify the backend
					this.model.set({
						name : name,
						locationId : locationId
					});
					this.model.save();

					// add the device to the new location
					locations.get(this.model.get("locationId")).get("devices").push(this.model.get("id"));
					locations.get(this.model.get("locationId")).save();

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
		el: $("#container"),
		template: _.template(deviceListTemplate),

		events : {
			"click span.scan"					: "scanQRCode",
			"click button.validDeviceInstall"	: "installDevice"
		},

		initialize:function() {
			var self = this;

			devices.on("change", function() {
				// refresh only when the list is currently displayed
				if (Backbone.history.fragment === "devices") {
					self.render();
				}
			});

			devices.on("add", function() {
				if (Backbone.history.fragment === "devices") {
					self.render();
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
			this.$el.html(this.template({ devices : devices.models }));
			if (!navigator.camera) {
				$("button.showDeviceInstallModal").hide();
			}
			return this;
			
			/* var self = this;

			if (direction !== undefined) {
				this.$el.toggle("slide", { direction : direction }, "fast", function() {
					self.$el.html(self.template({ devices : devices.models }));
					if (direction === "left") {
						direction = "right";
					} else {
						direction = "left";
					}
					self.$el.toggle("slide", { direction : direction }, "fast");
				});
			} else {
				this.$el.html(this.template({ devices : devices.models }));
			} */
		}
	});

	// views for the installation
	Device.Views.Install = {};

	// main view for the installation of a new device
	Device.Views.Install.Main = Backbone.View.extend({
		el: $("#container"),
		
		/**
		 * @constructor
		 */
		initialize:function() {
			this.$el.html(this.template());
			this.firstView = new Device.Views.Install.First();
			this.secondView = new Device.Views.Install.Second();
		},

		// render the view corresponding to the current step of the installation
		render:function() {
		}
	});

	// first step
	Device.Views.Install.First = Backbone.View.extend({
		el: $("#container"),
		template: _.template(deviceInstallFirstTemplate),

		events: {
			"click span.scan": 	"scanQRCode",
			"click span.cancelInstallDevice"	: "cancelInstallDevice"
		},

		// render the install interface
		render:function() {
			this.$el.html(this.template());
			return this;
		},

		// render the previous view when the user cancelled the installation
		cancelInstallDevice:function() {
			window.history.back();
		}
	});

	// second step
	Device.Views.Install.Second = Backbone.View.extend({
		el: $(".deviceInstallInstruction"),

		initialize:function() {
			console.log(this.$el);
			console.log($(".install-device-container"));
			console.log($(".typeSensor").html());
		}
	});

	return Device;
});
