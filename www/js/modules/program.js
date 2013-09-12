define([
	"jquery",
	"underscore",
	"backbone",
	"grammar",
	"text!templates/program/menu/programContainer.html",
	"text!templates/program/editor/editor.html"
], function($, _, Backbone, Grammar, programContainerMenuTemplate, programEditorTemplate) {
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
			appRouter.showMenuView(new Program.Views.Menu());
			appRouter.showView(new Program.Views.Editor({ model : programs.at(0) }));
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
			communicator.sendMessage({
				method	: "updateProgram",
				args	: [{ type : "JSONObject", value : model.get("source") }]
			});
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
				console.log("programs are ready!!");
				dispatcher.trigger("programsReady");
			});

			// listen to the event when a program appears and add it
			dispatcher.on("newProgram", function(program) {
				self.add(program);
			});

			// send the request to fetch the programs
			communicator.sendMessage({
				method: "getPrograms",
				args: [],
				callId: "listPrograms"
			});
		}
	});

	/**
	 * Namespace for the views
	 */
	Program.Views = {};
	
	/**
	 * Render the side menu for the programs
	 */
	Program.Views.Menu = Backbone.View.extend({
		tplProgramContainer	: _.template(programContainerMenuTemplate),
		
		/**
		 * @constructor
		 */
		initialize:function() {
		},
		
		/**
		 * Render the side menu
		 */
		render:function() {
			var self = this;
			
			// clear the content
			this.$el.html("");
			
			// for each program, add a menu item
			programs.forEach(function(program) {
				self.$el.append(self.tplProgramContainer({
					program : program
				}));
			});
			
			return this;
		}

	});
	
	/**
	 * Render the editor view
	 */
	Program.Views.Editor = Backbone.View.extend({
		tplEditor : _.template(programEditorTemplate),
				
		events: {
			"keyup textarea"	: "onKeyPress"
		},
		
		/**
		 * @constructor
		 */
		initialize:function() {
			this.grammar = new Grammar();
		},
				
		onKeyPress:function() {
			try {
				// $("#ast").html(this.grammar.parse($("textarea").val()));
				console.log(JSON.stringify(this.grammar.parse($("textarea").val())));
			} catch (e) {
				$("#error-area").html("");
				if (typeof e.expected !== "undefined") {
					e.expected.forEach(function(nextPossibility) {
						nextPossibility = nextPossibility.replace(/\"/g, "");
						$("#error-area").append(nextPossibility + "<br>");
					});
				} else {
					console.log(e);
				}
			}
		},
		
		/**
		 * Render the editor view
		 */
		render:function() {
			this.$el.html(this.tplEditor({
				program : this.model
			}));
			
			return this;
		}
		
	});

	return Program;
});