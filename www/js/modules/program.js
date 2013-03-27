define([
	"jquery",
	"underscore",
	"backbone",
	"text!templates/program/list.html"
], function($, _, Backbone, editorTemplate) {
	// initialize the module
	var Program = {};

	// router
	Program.Router = Backbone.Router.extend({
		routes: {
			"programs"			: "list",
			"programs/edit/:id"	: "edit",
			"programs/edit"		: "edit"
		},

		list:function() {
			var listView = new Program.Views.List();
			listView.render();
		},

		edit:function(id) {
			console.log(id);
		}
	});

	// instantiate the router
	var router = new Program.Router();

	// model
	Program.Model = Backbone.Model.extend({
		// override its synchronization method to send a notification on the network
		sync:function(method, model) {
			communicator.sendMessage("updateProgram", model.toJSON());
		}
	});

	// collection
	Program.Collection = Backbone.Collection.extend({
		model: Program.Model,

		initialize:function() {
			var self = this;

			// listen to the event when the list of programs is received
			dispatcher.on("listPrograms", function(programs) {
				_.each(programs, function(program) {
					self.add(program);
				});
				dispatcher.trigger("programsReady");
			});

			// listen to the event when a program appears and add it
			dispatcher.on("newProgram", function(program) {
				self.add(program);
			});

			// send the request to fetch the programs
			communicator.sendMessage("getPrograms", null);
		}
	});

	// views
	Program.Views = {};

	// render the list of all the programs
	Program.Views.List = Backbone.View.extend({
		el: $("#container"),
		template: _.template(editorTemplate),

		render:function() {
			this.$el.html(this.template({ programs : programs.models }));
		}
	});

	return Program;
});