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
	"text!templates/places/placeEditPalette.html"
], function(App, Snap, SvgMapView, BrickListView, svgTemplate, navbarTemplate, circleMenuTemplate, universeTabTemplate, draggableTemplate, placeEditTemplate) {
 
	var HabitatView = {};
  
  /**
	 * View used as home page of the application
	 */
  HabitatView = Backbone.View.extend({
    el: $("#main"),
    template: _.template(svgTemplate),
		tplNavBar: _.template(navbarTemplate),
		tplCircleMenu: _.template(circleMenuTemplate),
		tplUniverseTab: _.template(universeTabTemplate),
		tplDraggableView: _.template(draggableTemplate),
		tplPlaceEditPalette: _.template(placeEditTemplate),
		
		/**
     * Bind events of the DOM elements from the view to their callback
     */
    events: {
      "click button.btn-toggle-edit"	: "toggleEditMode",
			"click #place-edit-validbtn"	: "applyPlaceEdit",
			"click #place-edit-cancelbtn" : "cancelPlaceEdit"
    },

		
		/**
		 * constructor
		 */
    initialize:function() {
			var self = this;
      HabitatView.__super__.initialize.apply(this, arguments);
			
			this.editMode = false;
			
			dispatcher.on("editMode", function(brick) {
        if(!self.editMode){
					self.showPlaceEditPanel();
					self.toggleEditMode(true);
				}
			});

			
		},
		
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
		
		// render the homepage of the application
    render:function() {
			var self = this;
			this.$el.html(this.tplNavBar);
      this.$el.append(this.template());
			this.$el.append(this.tplCircleMenu);
					
			// draggable
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
				
				drag: function (e) {
					$("#draggableFeedback").offset({left:e.clientX,top:e.clientY});
				},
				
				// Handle the end state. Append the corresponding brick to the drop target
				stop: function (e) {
					self.addPlaceHandler(e, place);
				}
			});
			
			this.showEditPalette();
						
			this.initializeSvgMap();
			
			// initialize the svg map
			var svgMap = new SvgMapView();
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
	
		addPlaceHandler:function(e, place) {
			var self = this;
			// destroy the draggable clone
					place.removeViews(place.views);
					$("#draggableFeedback").addClass("hidden");
				
					var target = Snap.getElementByPoint(e.clientX, e.clientY).node;
					while(target && (typeof target.classList === 'undefined' || !target.classList.contains('ViewRoot'))) {
						target = target.parentNode;
					}
					
					if(target && target.ViewRoot && target.ViewRoot.model){
						self.DDTarget = target.ViewRoot.model;
						self.DDTargetX = e.clientX;
						self.DDTargetY = e.clientY;
						self.DDPlace = place;
						self.showPlaceEditPanel();
						//target.ViewRoot.model.appendChildWithCoord(place, e.clientX, e.clientY);
						
						//place.save();
					}

		},
		
		showEditPalette:function() {
			var self = this;
			$(self.$el.find(".edition-tabs")[0]).html("<ul class='edit-palette'></ul>");
			$(".edition-tabs").attr( "class", "edition-tabs" );
		
			var universes = AppsGate.Root.Universes.getFundamentalUniverses();
			
			universes.forEach(function(universe) {
				$(self.$el.find(".edit-palette")[0]).append(self.tplUniverseTab({
					universe : universe
				}));
				
				$(self.$el.find(".edition-tabs")[0]).append("<div class='palette-contents' id='" + universe.get("type").toLowerCase() + "'></div>");
				
				var contentListView = new BrickListView({el:self.$el.find("#"+universe.get("type").toLowerCase()), model:universe});
				contentListView.render();
			});
						
			$( ".edition-tabs" ).tabs();
			$( ".accordion").accordion({
				active: false,
				collapsible: true,
				heightStyle: "content"
			});
			
			$(".ui-tabs-panel").height($("#svgspace").outerHeight());
						    						
			$( ".ui-state-default" ).hover(function(){$(this).removeClass("ui-state-default");$(this).addClass("ui-state-hover")},function(){$(this).addClass("ui-state-default");$(this).removeClass("ui-state-hover")});


			if(this.editMode) {
				$(".editbar").removeClass("hidden");
			}
			else {
				$(".editbar").addClass("hidden");
			}
		},
		
		showPlaceEditPanel:function() {
			$( ".edition-tabs" ).tabs( "destroy" );
			$("#draggableFeedback").removeClass("hidden");
			$(this.$el.find(".edition-tabs")[0]).html(this.tplPlaceEditPalette);
			$(".toggle-edit-text").html($.i18n.t("navbar.stop-edit"));
			this.$el.i18n();
			
		},
		
		applyPlaceEdit:function() {
			$("#draggableFeedback").remove();
			this.DDPlace.set("name", $("#place-name-input")[0].value);
			this.DDPlace.setProperty("name", $("#place-name-input")[0].value);
			
			this.DDTarget.appendChildWithCoord(this.DDPlace, this.DDTargetX, this.DDTargetY);
			this.DDPlace.save();
			this.showEditPalette();
			//this.render();
			//this.toggleEditMode();
		},
		
		cancelPlaceEdit:function() {
		
			$("#draggableFeedback").remove();
			
			//this.toggleEditMode();
			this.showEditPalette();
			//this.render();
		},
	
		
  });

  return HabitatView;
});
