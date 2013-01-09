define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/devices/details.html",
	"text!templates/devices/list.html",
	"text!templates/devices/edit.html",
], function($, _, Backbone, deviceDetailsTemplate, deviceListTemplate,
		deviceEditTemplate) {
	// initialize the module
	var Device = {};

	// router
	Device.Router = Backbone.Router.extend({
		routes: {
			"devices"		: "list",
			"devices/:cid"	: "details"
		},

		// list all the devices
		list:function() {
			var listView = new Device.Views.List();
			listView.render();
		},

		// give details on a device
		details:function(cid) {
			var detailsView = new Device.Views.Details({ model: devices.get(cid) });
			detailsView.render();
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

			// listen to "change" event (fired when user edit the model from a
			// view) to send the modifications to the server
			this.bind("change", function() {
				this.save();
			});

			// listen to update from the backend
			dispatcher.on("updateDevice", function(device) {
				if (device.id == self.get("id")) {
					self.set("name", device.name);
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

			// send the request to fetch the devices
			communicator.sendMessage("getDevices", null);

			// wait for the response
			dispatcher.on("listDevices", function(devices) {
				_.each(devices, function(device) {
					self.add(device);
				});
			});


			// listen to the event when a device appears and add it
			dispatcher.on("newDevice", function(device) {
				self.add(device);
			});
		}
	});

	// views
	Device.Views = {}
	
	// detailled view of a device
	Device.Views.Details = Backbone.View.extend({
		el: $("#appsgate"),
		tagName: "article",
		className: "device-container",
		template: _.template(deviceDetailsTemplate),
		editTemplate: _.template(deviceEditTemplate),

		// map the events and their callback
		events: {
			"click button.edit-device"			: "editDevice",
			"click button.save-device"			: "saveDevice",
			"click button.cancel-edit-device"	: "cancelEditDevice"
		},

		// render the detailled view of a device
		render:function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		// show the edit form
		editDevice:function() {
			this.$el.html(this.editTemplate(this.model.toJSON()));
		},

		// save the edits of the device
		saveDevice:function(e) {
			e.preventDefault();

			// update the modified attributes
			var id = parseInt($(e.target).closest("form").find("#id").val());
			var name = $(e.target).closest("form").find("#device-name").val();

			// update the model iif the ids are corresponding
			if (this.model.get("id") == id) {
				this.model.set({ name : name });
			}

			// back to the detailled view
			this.render();
		},

		// user cancelled the edition, go back to the detailled view
		cancelEditDevice:function(e) {
			e.preventDefault();
			this.render();
		},

	});

	// render the list of all the available devices
	Device.Views.List = Backbone.View.extend({
		el: $("#appsgate"),
		tagName: "section",
		className: "list-device-container",
		template: _.template(deviceListTemplate),

		initialize:function() {
			var self = this;

			devices.on("change", function() {
				self.render();
			});
		},

		// render the list of devices
		render:function() {
			this.$el.html(this.template({ devices: devices.models }));
		}
	});

	return Device;
});
