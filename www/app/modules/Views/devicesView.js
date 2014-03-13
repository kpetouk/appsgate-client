define([
	"app",
	"snapsvg",
	"views/svgmapview",
	"views/bricklistview",
  "text!templates/map/default.html",
	"text!templates/home/navbar.html",
	"text!templates/home/circlemenu.html",
	"text!templates/universes/universeTab.html",
	"text!templates/bricks/brickDraggableView.html",
	"text!templates/bricks/brickEditPalette.html"
], function(App, Snap, SvgMapView, BrickListView, svgTemplate, navbarTemplate, circleMenuTemplate, universeTabTemplate, draggableTemplate, brickEditTemplate) {
 
	var DevicesView = {};
  
  /**
	 * View used as home page of the application
	 */
  DevicesView = Backbone.View.extend({
    el: $("#main"),
    template: _.template(svgTemplate),
		tplNavBar: _.template(navbarTemplate),
		tplCircleMenu: _.template(circleMenuTemplate),
		tplUniverseTab: _.template(universeTabTemplate),
		tplDraggableView: _.template(draggableTemplate),
		tplBrickEditPalette: _.template(brickEditTemplate),
		
		/**
     * Bind events of the DOM elements from the view to their callback
     */
    events: {
      "click button.btn-toggle-edit"	: "toggleEditMode",
			"click #brick-edit-validbtn"	: "applyBrickEdit",
			"click #brick-edit-cancelbtn" : "cancelBrickEdit",
			"click #size-choice-buttons" : "changeBrickSize"
    },

		
		/**
		 * constructor
		 */
    initialize:function() {
			var self = this;
      DevicesView.__super__.initialize.apply(this, arguments);
			
			this.editMode = false;
			
			dispatcher.on("editMode", function(brick) {
        if(!self.editMode){
					self.toggleEditMode(true);
				}
				self.showBrickEditPanel(brick);
			});

			
		},
		
		/**
		 * Resizes the svg area taking in account the elements surrounding it
		 */
		initializeSvgMap:function() {
			var node = $("#svgspace");
			var divSize = window.innerHeight-node.offset().top;
			node.height(divSize);
		},
		
		toggleEditMode:function(mode) {
			this.editMode = typeof mode === 'boolean' ? mode:!this.editMode;
			if(this.editMode) {
				$(".editbar").removeClass("hidden");
				
				$(".toggle-edit-text").html($.i18n.t("navbar.stop-edit"));
			}
			else {
				$(".editbar").addClass("hidden");
				
				$(".toggle-edit-text").html($.i18n.t("navbar.edit"));

			}
		},
		
		/**
		 * Overrides view default render to render the spatial view of the application
		 */
    render:function() {
			var self = this;
			
			// add menus and navbars
			this.$el.html(this.tplNavBar);
      this.$el.append(this.template());
			this.$el.append(this.tplCircleMenu);
					
			// Enabling drag & drop on the add button to allow adding places
			$( ".btn-add" ).draggable({
				helper: null,
				place:null,
				
				// Handle the start state. Create a view to drag
				start: function (e) {
					$("body").append(self.tplDraggableView);
					$("#draggableFeedback").css("position","absolute");
					
					place = AppsGate.Root.Places.add({name:$.i18n.t("places.place-no-name")});
					
					place.getNewView("PlaceBrickView", "#svgDraggable").render();
				
				},
				
				// Handle the drag state. Move the cloned view as the cursor moves
				drag: function (e) {
					$("#draggableFeedback").offset({left:e.clientX,top:e.clientY});
				},
				
				// Handle the end state. Append the corresponding brick to the drop target
				stop: function (e) {
					self.addPlaceHandler(e, place);
				}
			});
			
			// Initialize the default edit palette
			this.showEditPalette();
						
			// Initialize the svg canvas size
			this.initializeSvgMap();
			
			// Render the svg map view
			var svgMap = new SvgMapView({model:AppsGate.Root.Universes.getDevicesUniverse()});
			svgMap.render();
										
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
	
		/**
		 * Handler for creating a place, when the new place is dropped in the map area
		 */
		addPlaceHandler:function(e, place) {
			var self = this;
			// destroy the draggable clone
			place.removeViews(place.views);
			$("#draggableFeedback").addClass("hidden");
			
			// detect the view on which the new place was dropped on
			var target = Snap.getElementByPoint(e.clientX, e.clientY).node;
			while(target && (typeof target.classList === 'undefined' || !target.classList.contains('ViewRoot'))) {
				target = target.parentNode;
			}
			
			// if a view is found, open a edit palette for the room to add
			if(target && target.ViewRoot && target.ViewRoot.model){
				self.DDTarget = target.ViewRoot.model;
				self.DDTargetX = e.clientX;
				self.DDTargetY = e.clientY;
				self.showBrickEditPanel(place);
			}
		},

		/**
		 * Appends the default edition palette to the navbar, without displaying it, unless it's in edit mode
		 */
		showEditPalette:function() {
			var self = this;
			
			// adding root elements for the palette
			$(self.$el.find(".edition-tabs")[0]).html("<ul class='edit-palette'></ul>");
			$(".edition-tabs").attr( "class", "edition-tabs" );
		
			// Using only fundamental universes to populate the palette TODO: add local and user universes to the tabs
			var universes = AppsGate.Root.Universes.getFundamentalUniverses();
			
			// Adding a tab for each universe
			universes.forEach(function(universe) {
				$(self.$el.find(".edit-palette")[0]).append(self.tplUniverseTab({
					universe : universe
				}));
				
				$(self.$el.find(".edition-tabs")[0]).append("<div class='palette-contents' id='" + universe.get("type").toLowerCase() + "'></div>");
				
				// adding an accordion for each element with children or a simple div otherwise
				var contentListView = new BrickListView({el:self.$el.find("#"+universe.get("type").toLowerCase()), model:universe});
				contentListView.render();
			});
			
			// activating jquery ui tabs and accordion widgets
			$( ".edition-tabs" ).tabs();
			$( ".accordion").accordion({
				active: false,
				collapsible: true,
				heightStyle: "content"
			});
			
			// setting pallete's size same as svg are in order to ensure scrolling
			$(".ui-tabs-panel").height($("#svgspace").outerHeight());

			// making divs in the list react to hover using same styles as jquery ui widgets
			$( ".ui-state-default" ).hover(function(){$(this).removeClass("ui-state-default");$(this).addClass("ui-state-hover");},function(){$(this).addClass("ui-state-default");$(this).removeClass("ui-state-hover");});

			// display the tablette if in edit mode, hide otherwise
			if(this.editMode) {
				$(".editbar").removeClass("hidden");
			}
			else {
				$(".editbar").addClass("hidden");
			}
		},
		
		/**
		 * Appends the place edition palette to the navbar
		 * @param place model if already exists
		 */
		showBrickEditPanel:function(brick) {
			try{
				$( ".edition-tabs" ).tabs( "destroy" );
			} catch (e) {
				console.log(e);
			}
			$("#draggableFeedback").removeClass("hidden");
			$(this.$el.find(".edition-tabs")[0]).html(this.tplBrickEditPalette({brick:brick}));
			
			this.editedBrick = brick;
			
			this.$el.i18n();
			$(".toggle-edit-text").html($.i18n.t("navbar.stop-edit"));
			
		},
		
		/**
		 * Changes the edited brick size, when a size button button is pressed
		 */
		changeBrickSize:function(e) {
			var pressedButton = e.target;
			if (pressedButton.tagName == "SPAN") {
				pressedButton = pressedButton.parentNode;
			}
			switch (pressedButton.id) {
				case "btn-size-1":
					this.editedBrick.w = 1;
					this.editedBrick.h = 1;
        break;
        case "btn-size-2":
					this.editedBrick.w = 2;
					this.editedBrick.h = 2;
        break;
        case "btn-size-3":
					this.editedBrick.w = 3;
					this.editedBrick.h = 3;
					break;
        case "btn-size-4":
					this.editedBrick.w = 4;
					this.editedBrick.h = 4;
					break;
				default:
					this.editedBrick.w = 1;
					this.editedBrick.h = 1;
				break;
			}
			this.editedBrick.redrawViews();
		},
		
		/**
		 * Called when apply button is pressed in place edit palette
		 * Saves the changes to the server
		 */
		applyBrickEdit:function() {
			$("#draggableFeedback").remove();
			if(this.editedBrick){
				this.editedBrick.set("name", $("#brick-name-input")[0].value);
				this.editedBrick.setProperty("name", $("#brick-name-input")[0].value);
				
				if(this.DDTarget){
					this.DDTarget.appendChildWithCoord(this.editedBrick, this.DDTargetX, this.DDTargetY, $("#brick-width-input")[0].value, $("#brick-height-input")[0].value);
				}
				else if (this.editedBrick.get("type") !== "DEVICE" && this.editedBrick.get("type") !== "SERVICE"){
					this.editedBrick.w = $("#brick-width-input")[0].value;
					this.editedBrick.h = $("#brick-height-input")[0].value;
				}
				this.editedBrick.redrawViews();
				this.editedBrick.save();
			}
			this.showEditPalette();
		},
		
		/**
		 * Cancels the changes of the edited place
		 */
		cancelBrickEdit:function() {
			$("#draggableFeedback").remove();
			if(this.editedBrick) {
				delete this.editedBrick;
			}
			if(this.DDTarget){
				this.DDTarget = null;
			}
			this.showEditPalette();
		},
	
		
  });

  return DevicesView;
});
