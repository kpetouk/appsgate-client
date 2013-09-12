define([
	"jquery",
	"underscore",
	"backbone",
	"grammar",
	"text!templates/program/menu/menu.html",
	"text!templates/program/menu/programContainer.html",
	"text!templates/program/menu/addButton.html",
	"text!templates/program/editor/editor.html"
], function($, _, Backbone, Grammar, programMenuTemplate, programContainerMenuTemplate, addProgramButtonTemplate, programEditorTemplate) {
	// initialize the module
	var Program = {};

	// router
	Program.Router = Backbone.Router.extend({
		routes : {
			"programs"			: "list",
			"programs/:name"	: "details"
		},

		list:function() {
			// display the side menu
			appRouter.showMenuView(new Program.Views.Menu());
			
			// set active the first element - displayed by default
			$($(".aside-menu .list-group-item")[0]).addClass("active");
			
			// display the first program
			appRouter.showView(new Program.Views.Editor({ model : programs.at(0) }));
			
			// update the url
			appRouter.navigate("#programs/" + programs.at(0).get("name"));
		},
		
		details:function(name) {
			appRouter.showView(new Program.Views.Editor({ model : programs.findWhere({ name : name }) }));
		}
	});

	// instantiate the router
	var router = new Program.Router();

	// model
	Program.Model = Backbone.Model.extend({
		defaults: {
			source : {
				programName : "",
				seqParameters : [],
				author : "",
				target : "",
				daemon : "true",
				seqDefinitions : [],
				seqRules : [
					[]
				]
			}
		},
		
		/**
		 * Initialize the attributes of the programs and the source
		 * 
		 * @constructor
		 */
		initialize:function() {
			if (this.get("source").programName === "") {
				this.get("source").programName = this.get("name");
			}
			
			if (typeof this.get("daemon") !== "undefined") {
				this.get("daemon") ? this.get("source").daemon = "true" : this.get("source").daemon = "false";
			} else {
				this.get("source").daemon === "true" ? this.set("daemon", true) : this.set("daemon", false);
			}
		},
		
		/**
		 * Send a message to the server to perform a remote call
		 * 
		 * @param method Remote method name to call
		 * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
		 */
		remoteCall:function(method, args) {
			communicator.sendMessage({
				method	: method,
				args	: args
			});
		},

		// override its synchronization method to send a notification on the network
		sync:function(method, model) {
			switch (method) {
				case "create":
					if (programs.where({ name : model.get("name") }).length > 0) {
						this.remoteCall("updateProgram", [{ type : "JSONObject", value : model.get("source") }]);
					} else {
						this.remoteCall("addProgram", [{ type : "JSONObject", value : model.get("source") }]);
					}
					break;
				case "delete":
					this.remoteCall("removeProgram", [{ type : "String", value : model.get("name") }]);
					break;
				case "update":
					break;
			}
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
				if (programs.where({ name : program.name }).length === 0) {
					self.add(program);
				}
			});
			
			// listen to the event when a program has been removed
			dispatcher.on("removeProgram", function(programName) {
				var removedProgram = programs.findWhere({ name : programName });
				programs.remove(removedProgram);
			});
			
			// listen to the event when a program has been updated
			dispatcher.on("updateProgram", function(program) {
				programs.findWhere({ name : program.name }).set(program);
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
		tpl					: _.template(programMenuTemplate),
		tplProgramContainer	: _.template(programContainerMenuTemplate),
		tplAddProgramButton	: _.template(addProgramButtonTemplate),
		
		/**
		 * Bind events of the DOM elements from the view to their callback
		 */
		events : {
			"click a.list-group-item"						: "updateSideMenu",
			"show.bs.modal #add-program-modal"				: "initializeModal",
			"click #add-program-modal button.valid-button"	: "validAddProgram",
			"keyup #add-program-modal input:text"			: "validAddProgram"
		},
		
		/**
		 * Listen to the programs collection updates and refresh if any
		 * 
		 * @constructor
		 */
		initialize:function() {
			this.listenTo(programs, "add", this.render);
			this.listenTo(programs, "remove", this.render);
			this.listenTo(programs, "update", this.render);
		},
		
		/**
		 * Update the side menu to set the correct active element
		 * 
		 * @param e JS click event
		 */
		updateSideMenu:function(e) {
			_.forEach($("a.list-group-item"), function(item) {
				$(item).removeClass("active");
			});
			$(e.currentTarget).addClass("active");
		},
		
		/**
		 * Clear the input text, hide the error message, check the checkbox and disable the valid button by default
		 */
		initializeModal:function() {
			$("#add-program-modal input").val("");
			$("#add-program-modal .text-danger").addClass("hide");
			$("#add-program-modal input:checkbox").prop("checked", true);
			$("#add-program-modal .valid-button").addClass("disabled");
		},
		
		/**
		 * Check the current value of the input text and show an error message if needed and activate or disactivate the valid button
		 * 
		 * @return false if the typed name already exists, true otherwise
		 */
		checkProgramName:function() {
			// name is empty
			if ($("#add-program-modal input:text").val() === "") {
				$("#add-program-modal .text-danger")
						.text("Le nom du programme doit être renseigné.")
						.removeClass("hide");
				$("#add-program-modal .valid-button").addClass("disabled");
				
				return false;
			}
			
			// name already exists
			if (programs.where({ name : $("#add-program-modal input:text").val() }).length > 0) {
				$("#add-program-modal .text-danger")
						.text("Nom déjà existant")
						.removeClass("hide");
				$("#add-program-modal .valid-button").addClass("disabled");
				
				return false;
			}
			
			// ok
			$("#add-program-modal .text-danger").addClass("hide");
			$("#add-program-modal .valid-button").removeClass("disabled");
			
			return true;
		},
		
		/**
		 * Check if the name of the program does not already exist. If not, create the program
		 * Hide the modal when done
		 * 
		 * @param e JS event
		 */
		validAddProgram:function(e) {
			if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
				// create the program if the name is ok
				if (this.checkProgramName()) {
					
					// instantiate the program and add it to the collection after the modal has been hidden
					$("#add-program-modal").on("hidden.bs.modal", function() {
						// instantiate a model for the new program
						var program = new Program.Model({
							name	: $("#add-program-modal input:text").val(),
							daemon	: $("#add-program-modal input:checkbox").prop("checked")
						});

						// send the program to the backend
						program.save();

						// add it to the collection
						programs.add(program);
					});
					
					// hide the modal
					$("#add-program-modal").modal("hide");
				}
			} else if (e.type === "keyup") {
				this.checkProgramName();
			}
		},
		
		/**
		 * Render the side menu
		 */
		render:function() {
			var self = this;
			
			// initialize the content
			this.$el.html(this.tpl());
			
			// for each program, add a menu item
			programs.forEach(function(program) {
				self.$el.find(".list-group").append(self.tplProgramContainer({
					program : program,
					active	: Backbone.history.fragment.split("/programs")[1] === program.get("name") ? true : false
				}));
			});
			
			// "add program" button to the side menu
			this.$el.append(this.tplAddProgramButton());
			
			return this;
		}

	});
	
	/**
	 * Render the editor view
	 */
	Program.Views.Editor = Backbone.View.extend({
		tplEditor : _.template(programEditorTemplate),
		
		events : {
			"click button.delete-program-button"	: "deleteProgram",
			"click button.save-program-button"		: "saveProgram"
		},
		
		/**
		 * @constructor
		 */
		initialize:function() {
			this.grammar = new Grammar();
		},
		
		/**
		 * Callback when the user has clicked on the button to remove a program. Remove the program
		 */
		deleteProgram:function() {
			// delete the program
			// fake an id so that backbone does not refuse to delete it (because a model is considered new when it has no ids)
			this.model.set("id", -1);
			this.model.destroy();
			
			// navigate to the list of programs
			appRouter.navigate("#programs", { trigger : true });
		},
		
		/**
		 * Callback when the user has clicked on the button to save modifications done on a program. Send the update to the server
		 */
		saveProgram:function() {
			this.model.save();
			
		},
		
		/**
		 * Render the editor view
		 */
		render:function() {
			console.log(this.model);
			
			// render the editor with the program
			this.$el.html(this.tplEditor({
				program : this.model
			}));
			
			// initialize the popover
			this.$el.find("#delete-popover").popover({ html : true });
			
			return this;
		}
		
	});

	return Program;
});