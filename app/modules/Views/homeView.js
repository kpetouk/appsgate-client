define([
	"app",
  "text!templates/home/home.html",
	"text!templates/home/navbar.html",
	"text!templates/home/circlemenu.html",
	"text!templates/universes/universeContainer.html",
	"text!templates/universes/userUniverseContainer.html"
], function(App, homeTemplate, navbarTemplate, circleMenuTemplate, universeTemplate, userUniverseTemplate) {
 
	var HomeView = {};
  
  /**
	 * View used as home page of the application
	 */
  HomeView = Backbone.View.extend({
    el: $("#main"),
    template: _.template(homeTemplate),
		tplNavbar: _.template(navbarTemplate),
		tplCircleMenu: _.template(circleMenuTemplate),
		tplUniverseContainer: _.template(universeTemplate),
		tplUserUniverseContainer: _.template(userUniverseTemplate),
		
		/**
     * Bind events of the DOM elements from the view to their callback
     */
    events: {
      "click button.btn-toggle-edit"	: "toggleEditMode",
			"click div.fundamental-universe"		: "navigateIn",
			"click div.local-universe"		: "navigateIn",
			"click input.universe-name-input"		: "editUniverseName",
			"click div.btn-add" : "addNewUniverse",
			"hidden.bs.modal"	: "toggleModalState",
			"keyup #edit-name-modal input:text"			: "validEditName",
			"click #edit-name-modal button.valid-button"	: "validEditName",
    },

		
		/**
		 * constructor
		 */
    initialize:function() {
      HomeView.__super__.initialize.apply(this, arguments);
			
			this.editMode = false;
			
			
			this.listenTo(AppsGate.Root.Universes, "add", this.render);
			this.listenTo(AppsGate.Root.Universes, "remove", this.render);
			this.listenTo(AppsGate.Root.Universes, "change", this.render);
			
		},
		
		/**
		 *	Sets a fixed height for the universe list display
		 */
		adjustUniverseList:function() {
			var node = $("#universeList");
			var divSize = window.innerHeight-(node.offset().top + node.outerHeight(true) - node.innerHeight());
			node.height(divSize);
		},
		
		navigateIn:function(e){
			if(!this.zooming && !this.editMode){
				this.zooming = true;
				
				var node = $("#main");
				var divHeight = window.innerHeight-(node.offset().top + node.outerHeight(true) - node.innerHeight());
				var divWidth = window.innerWidth-(node.offset().left + node.outerWidth(true) - node.innerWidth());
				
				var target = e.target;
				while(target && !target.classList.contains('fundamental-universe') && !target.classList.contains('local-universe')) {
					target = target.parentNode;
				}
				target = $(target);
				var targetWidth = target.innerWidth();
				var targetHeight = target.innerHeight();
				var targetX = target.offset().left;
				var targetY = target.offset().top;
				
				var zoomingTarget = target.clone();
				target.css("opacity","0");

				zoomingTarget.css("position","absolute");
				zoomingTarget.offset({left:targetX,top:targetY});
				zoomingTarget.width(targetWidth);
				zoomingTarget.height(targetHeight);
				zoomingTarget.css("z-index", 1000);
				zoomingTarget.appendTo(node);
				
				var cb = function() {
					this.zooming = false;
					if(target.hasClass("fundamental-universe")) {
						AppsGate.Router.navigate(target.attr("id"), {trigger: true});
					}
					else {
					 var universe = AppsGate.Root.Universes.findWhere({id:target.attr("id")});
					 AppsGate.Router.navigate(universe.get("id"));
					 AppsGate.Router.showUniverse(universe);
					}
					
				};
				
				zoomingTarget.animate({top:node.offset().top-50, left:node.offset().left, width:divWidth, height:divHeight, opacity:0}, 1000, cb);
				$("#universeList").animate({opacity:0},500);
			}
		},

    // render the homepage of the application
    render:function() {
			var self = this;
			this.$el.html(this.tplNavbar);
      this.$el.append(this.template());
			this.$el.append(this.tplCircleMenu);
			
			this.adjustUniverseList();
			
			var fundamentalUniverses = AppsGate.Root.Universes.getFundamentalUniverses();
			
			fundamentalUniverses.forEach(function(universe) {
				$(self.$el.find(".local-universes")[0]).append(self.tplUniverseContainer({
					universe : universe
				}));
			});
			
			var localUniverses = AppsGate.Root.Universes.getLocalUniverses();
						
			localUniverses.forEach(function(universe) {
				$(self.$el.find(".user-universes")[0]).append(self.tplUserUniverseContainer({
					universe : universe
				}));
			});
			
			$( ".local-universe" ).draggable({
				helper: "clone",
				revert: "true",
				
				// Handle the end state. Append the corresponding brick to the drop target
				stop: function (e) {
					e.stopPropagation();
					
					var target = Snap.getElementByPoint(e.clientX, e.clientY).node;
			
					while(target !== null && typeof target.classList === 'undefined' && !target.classList.contains('btn-trashbin')) {
						target = target.parentNode;
					}
			
					// if the target is the trashbin, we delete the dragged element
					if(target !== null && typeof target.classList !== 'undefined' && target.classList.contains('btn-trashbin')) {
						var draggedUniverse = AppsGate.Root.Universes.get(e.target.id);
						
						var parent = draggedUniverse.parents[0];
						if(parent) {
							parent.removeChild(draggedUniverse);
							parent.save();
						}
						draggedUniverse.destroy();
						dispatcher.trigger("cancelEditMode");
					}
				}
			});

			$("#user_root").addClass("disabled");
			$("#program_root").addClass("disabled");
			
				
			// initialize the circle menu
			$(".circlemenu").circleMenu({
				trigger: "click",
				item_diameter: 50,
				circle_radius: 150,
				direction: 'top-right'
			});
			
			// translate the view
      this.$el.i18n();
			
			return this;
    },
		
		addNewUniverse:function() {
			var newUniverse = AppsGate.Root.Universes.add({name:$.i18n.t("universes.universe-no-name")});
			newUniverse.save();
			newUniverse.set("type", "UNIVERSE");
			newUniverse.set("name",$.i18n.t("universes.universe-no-name"));
			var test = $.i18n.t("universes.universe-no-name");
			console.log(test);
			var curHabitat = AppsGate.Root.Habitats.at(0);
			newUniverse.set("parent",curHabitat.get("id"));
			newUniverse.save();
		},
		
		toggleEditMode:function() {
			this.editMode = !this.editMode;
			if(this.editMode) {
				$(".editbar").removeClass("hidden");
				
				$(".toggle-edit-text").html($.i18n.t("navbar.stop-edit"));
			}
			else {
				$(".editbar").addClass("hidden");
				
				$(".toggle-edit-text").html($.i18n.t("navbar.edit"));
			}
		},
		
		editUniverseName:function(e) {
			if(this.editMode && !this.modalShown){
			
				var target = e.target;
				while(target && !target.classList.contains('fundamental-universe') && !target.classList.contains('local-universe')) {
					if (target.classList.contains('fundamental-universe')) {
						return;
					}
					target = target.parentNode;
				}
				this.editedModel = AppsGate.Root.Universes.get(target.id);
				this.initializeModal();
				$("#edit-name-modal").modal("show");
				
			}
		},
		
		/**
		 * Clear the input text, hide the error message and disable the valid button by default
		 */
		initializeModal:function() {
			$("#edit-name-modal input").val(this.editedModel.get("name"));
			$("#edit-name-modal .text-danger").addClass("hide");
			$("#edit-name-modal .valid-button").addClass("disabled");
			this.modalShown = true;
		},
		
		toggleModalState:function() {
			this.modalShown = !this.modalShown;
		},

		/**
		 * Check the current value of the input text and show a message error if needed
		 * 
		 * @return false if the typed name already exists, true otherwise
		 */
		checkName:function() {
			// name is empty
			if ($("#edit-name-modal input").val() === "") {
				$("#edit-name-modal .text-danger").removeClass("hide");
				$("#edit-name-modal .text-danger").text($.i18n.t("modal-edit-place.name-empty"));
				$("#edit-name-modal .valid-button").addClass("disabled");
				
				return false;
			}
			
			// name already existing
			if (AppsGate.Root.Universes.where({ name : $("#edit-name-modal input").val() }).length > 0) {
				$("#edit-name-modal .text-danger").removeClass("hide");
				$("#edit-name-modal .text-danger").text($.i18n.t("edit-name-modal.already-existing"));
				$("#edit-name-modal .valid-button").addClass("disabled");
				
				return false;
			}
			
			//ok
			$("#edit-name-modal .text-danger").addClass("hide");
			$("#edit-name-modal .valid-button").removeClass("disabled");
			
			return true;
		},

		
		/**
		 * Check if the name of the place does not already exist. If not, update the place
		 * Hide the modal when done
		 */
		validEditName:function(e) {
			var self = this;
			
			if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
				e.preventDefault();
				
				// update the name if it is ok
				if (this.checkName()) {
					self.$el.find("#edit-name-modal").on("hidden.bs.modal", function() {
						// set the new name to the place
						self.editedModel.set("name", $("#edit-name-modal input").val());
						
						// send the update to the backend
						self.editedModel.save();
						
						return false;
					});
					
					// hide the modal
					$("#edit-name-modal").modal("hide");
				}
			} else if (e.type === "keyup") {
				self.checkName();
			}
		},

		
  });

  return HomeView;
});
