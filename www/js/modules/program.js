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
			"programs/:id"		: "details"
		},

		list:function() {
			// display the side menu
			appRouter.showMenuView(new Program.Views.Menu());
			
			// set active the first element - displayed by default
			$($(".aside-menu .list-group-item")[0]).addClass("active");
			
			// display the first program
			appRouter.showView(new Program.Views.Editor({ model : programs.at(0) }));
			
			// update the url if there is at least one program
			if (programs.length > 0) {
				appRouter.navigate("#programs/" + programs.at(0).get("id"));
			}
		},
		
		details:function(id) {
			appRouter.showView(new Program.Views.Editor({ model : programs.get(id) }));
		}
	});

	// instantiate the router
	var router = new Program.Router();

	// model
	Program.Model = Backbone.Model.extend({
		// default values
		defaults: {
			runningState : "DEPLOYED",
			userInputSource : "",
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
		 * Extract the name and the daemon attributes from the source to simplify their usage w/ backbone and in the templates
		 * 
		 * @constructor
		 */
		initialize:function() {
			var self = this;
			
			// name
			if (typeof this.get("name") === "undefined") {
				this.set("name", this.get("source").programName);
			} else {
				this.get("source").programName = this.get("name");
			}
			
			// daemon
			if (typeof this.get("daemon") === "undefined") {
				this.set("daemon", this.get("source").daemon);
			}
			
			// when the source has been updated, update the attributes of the program model
			this.on("change:source", function() {
				this.set("name", this.get("source").programName);
				this.set("daemon", this.get("source").daemon);
			});
			
			// each program listens to the event whose id corresponds to its own id
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
			communicator.sendMessage({
				method	: method,
				args	: args
			});
		},

		// override its synchronization method to send a notification on the network
		sync:function(method, model) {
			switch (method) {
				case "create":
					// create an id to the program
					var id;
					do {
						id = "program-" + Math.round(Math.random() * 10000).toString();
					} while (programs.where({ id : id }).length > 0);
					model.set("id", id);
					
					this.remoteCall("addProgram", [{ type : "JSONObject", value : model.toJSON() }]);
					break;
				case "delete":
					this.remoteCall("removeProgram", [{ type : "String", value : model.get("id") }]);
					break;
				case "update":
					if (model.changedAttributes()) {
						_.keys(model.changedAttributes()).forEach(function(attribute) {
							if (attribute === "runningState") {
								if (model.get("runningState") === "STARTED") {
									model.remoteCall("callProgram", [{ type : "String", value : model.get("id") }]);
								} else {
									model.remoteCall("stopProgram", [{ type : "String", value : model.get("id") }]);
								}
							} else {
								model.remoteCall("updateProgram", [{ type : "JSONObject", value : model.toJSON() }]);
							}
						});
					} else {
						model.remoteCall("updateProgram", [{ type : "JSONObject", value : model.toJSON() }]);
					}
					break;
			}
		},
		
		/**
		 * Converts the model to its JSON representation
		 */
		toJSON:function() {
			return {
				id				: this.get("id"),
				runningState	: this.get("runningState"),
				source			: this.get("source"),
				userInputSource	: this.get("userInputSource")
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
				self.add(program);
			});
			
			// listen to the event when a program has been removed
			dispatcher.on("removeProgram", function(programId) {
				var removedProgram = programs.findWhere({ id : programId });
				programs.remove(removedProgram);
			});
			
			// listen to the event when a program has been updated
			dispatcher.on("updateProgram", function(program) {
				programs.get(program.id).set(program);
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
			"keyup #add-program-modal input:text"			: "validAddProgram",
			"click button.start-program-button"				: "onStartProgramButton",
			"click button.stop-program-button"				: "onStopProgramButton"
		},
		
		/**
		 * Listen to the programs collection updates and refresh if any
		 * 
		 * @constructor
		 */
		initialize:function() {
			this.listenTo(programs, "add", this.render);
			this.listenTo(programs, "remove", this.render);
			this.listenTo(programs, "change", this.render);
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
			
			if (typeof e !== "undefined") {
				$(e.currentTarget).addClass("active");
			} else {
				$("#side-" + Backbone.history.fragment.split("/")[1]).addClass("active");
			}
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
		 * Callback to start a program
		 * 
		 * @param e JS mouse event
		 */
		onStartProgramButton:function(e) {
			e.preventDefault();
			
			// get the program to start
			var program = programs.get($(e.currentTarget).attr("id"));
			
			// change its running state
			program.set("runningState", "STARTED");
			
			// send modification to the backend
			program.save();
			
			return false;
		},
		
		/**
		 * Callback to stop a program
		 * 
		 * @param e JS mouse event
		 */
		onStopProgramButton:function(e) {
			e.preventDefault();
			
			// get the program to stop
			var program = programs.get($(e.currentTarget).attr("id"))
			
			// change its running state
			program.set("runningState", "STOPPED");
			
			// send modification to the backend
			program.save();
			
			return false;
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
			
			// set active the current menu item
			this.updateSideMenu();
			
			return this;
		}

	});
	
	/**
	 * Render the editor view
	 */
	Program.Views.Editor = Backbone.View.extend({
		tplEditor : _.template(programEditorTemplate),
		
		events : {
			"click button.daemon-program-button"	: "onDaemonProgramButton",
			"click button.save-program-button"		: "onSaveProgramButton",
			"click button.delete-program-button"	: "onDeleteProgramButton",
			"keyup textarea"						: "onKeyUpTextarea",
			"click button.completion-button"		: "onClickCompletionButton"
		},
		
		/**
		 * @constructor
		 */
		initialize:function() {
			this.grammar = new Grammar();
		},
		
		/**
		 * Callback when the user has clicked on the button to toggle the daemon state of a program
		 */
		onDaemonProgramButton:function() {
			// update the attribute of the program and the source
			if (this.model.get("daemon")) {
				this.model.set("daemon", false);
				this.model.get("source").daemon = "false";
				$(".daemon-program-button")
						.removeClass("btn-info")
						.addClass("btn-default")
						.html("<i class='glyphicon glyphicon-unchecked'></i> Daemon");
			} else {
				this.model.set("daemon", true);
				this.model.get("source").daemon = "true";
				$(".daemon-program-button")
						.removeClass("btn-default")
						.addClass("btn-info")
						.html("<i class='glyphicon glyphicon-check'></i> Daemon");
			}
		},
		
		/**
		 * Callback when the user has clicked on the button to save modifications done on a program. Send the update to the server
		 */
		onSaveProgramButton:function() {
			this.model.save();
		},
		
		/**
		 * Callback when the user has clicked on the button to remove a program. Remove the program
		 */
		onDeleteProgramButton:function() {
			// delete the program
			this.model.destroy();
			
			// navigate to the list of programs
			appRouter.navigate("#programs", { trigger : true });
		},
		
		onKeyUpTextarea:function() {
			this.compileProgram();
		},
		
		onClickCompletionButton:function(e) {
			if ($(e.currentTarget).text() === "espace") {
				$("textarea").val($("textarea").val() + " ");
			} else {
				$("textarea").val($("textarea").val() + $(e.currentTarget).text());
			}
			this.compileProgram();
		},
		
		compileProgram:function() {
			// build the beginning of the user input source to be given to the parser
			var programInput = this.model.get("name") + " ecrit par Bob pour Alice ";
			if (this.model.get("daemon") === true || this.model.get("daemon") === "true") {
				programInput += "daemon ";
			} else {
				programInput += "notDaemon ";
			}
			programInput += $("textarea").val();
			
			// clear the error span
			$(".expected-elements").html("");
			
			try {
				var ast = this.grammar.parse(programInput);
				console.log(ast);
				$(".alert-danger").addClass("hide");
				$(".alert-success").removeClass("hide");
				
				this.model.set("source", ast);
				this.model.set("userInputSource", $("textarea").val());
			} catch(e) {
				$(".alert-danger").removeClass("hide");
				$(".alert-success").addClass("hide");
				
				e.expected.forEach(function(nextPossibility) {
					$(".expected-elements").append("<button class='btn btn-default completion-button'>" + nextPossibility.replace(/"/g, "") + "</button>&nbsp;");
				});
			}
		},
		
		/**
		 * Render the editor view
		 */
		render:function() {
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