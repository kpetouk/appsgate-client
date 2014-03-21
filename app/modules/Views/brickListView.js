define([
	"app",
	"snapsvg",
  "text!templates/bricks/bricklistview.html",
	"text!templates/bricks/bricklistitemview.html",
	"text!templates/bricks/brickDraggableView.html"
], function(App, Snap, listTemplate, leafTemplate, draggableTemplate) {
 
	var BrickListView = {};
  
  /**
	 * View used as home page of the application
	 */
  BrickListView = Backbone.View.extend({
    
    tplList: _.template(listTemplate),
		tplLeaf: _.template(leafTemplate),
		tplDraggableView: _.template(draggableTemplate),
		
		/**
     * Bind events of the DOM elements from the view to their callback
     */
    events: {
      "click button.btn-toggle-edit"	: "toggleEditMode",
			"click div.fundamental-universe"		: "navigateIn",
			"click input.universe-name-input"		: "editUniverseName",
			"hidden.bs.modal"	: "toggleModalState"
    },

		
		/**
		 * constructor
		 */
    initialize:function() {
      BrickListView.__super__.initialize.apply(this, arguments);
			
			/*var svgspace = Snap("#svgspace");
					svgspace.mousemove(function(e) {
						var el = Snap.getElementByPoint(e.clientX, e.clientY);
						el.attr({stroke:"red"});
						console.log(e.clientX +" " +e.clientY);
					});*/
			
		},
		
		// render the homepage of the application
    render:function() {
			var self = this;
			
			var childBricks = this.model.children;
			
			childBricks.forEach(function(brick) {
				var node = null;
				
				if(brick.children.length > 0){
					node = $(self.tplList({	brick : brick}));
					self.$el.append(node);
					var nodeListView = new BrickListView({el:$($("#"+brick.get("id")).find(".brick-list-children")[0]), model:brick});
					nodeListView.render();
				}
				else{
					node = $(self.tplLeaf({	brick : brick}));
					self.$el.append(node);
				}
				
				node[0].brick = brick;
			});
			
			// draggable
			$( ".brick-list-leaf, .brick-list-node" ).draggable({
				helper: null,
				clone:null,
				cloneView:null,
				place:null,
				
				// Handle the start state. Create a view to drag
				start: function (e, ui) {
					$("body").append(self.tplDraggableView);
					this.clone = $("#draggableFeedback");
					this.clone.css("position","absolute");
										
					this.cloneView = this.brick.getNewView("undefined", "#svgDraggable").render();
				
				},
				
				drag: function (e, ui) {
					this.clone.offset({left:e.clientX,top:e.clientY});
					
					var clientX = null;
			var clientY = null;
			if(e.type === "drag") {
				clientX = e.clientX;
				clientY = e.clientY;
			}
			else if (e.type === "touchend") {
				clientX = e.changedTouches[0].clientX;
				clientY = e.changedTouches[0].clientY;
			}
			
			
			$("#draggableFeedback").addClass("hidden");
			
			target = Snap.getElementByPoint(clientX, clientY).node;
			
			$("#draggableFeedback").removeClass("hidden");
			
			//console.log(target);
			while(target !== null && typeof target.classList === 'undefined' || !target.classList.contains('ViewRoot')) {
						target = target.parentNode;
					}
					
				if (target && target.ViewRoot) {
					var CTM = target.ViewRoot.groot.node.getCTM();
					this.cloneView.node.ViewRoot.root.transform("m" + CTM.a + "," + CTM.b + "," + CTM.c + "," + CTM.d + ",0,0" );
				}

				},
				
				// Handle the end state. Append the corresponding brick to the drop target
				stop: function (e,ui) {
				
					// destroy the draggable clone
					this.clone.remove();
					this.clone = null;
					var index = this.brick.views.indexOf(this.cloneView.node.ViewRoot);
					if(index > -1) {
						this.brick.views.splice(index,1);
					}
					
					var target = Snap.getElementByPoint(e.clientX, e.clientY).node;
					while(target && (typeof target.classList === 'undefined' || !target.classList.contains('ViewRoot'))) {
						target = target.parentNode;
					}
					
					if(target && target.ViewRoot && target.ViewRoot.model){
						var cloneNode = this.brick.clone();
						cloneNode.unset("id");
						cloneNode.type = this.brick.get("type");
						
						target.ViewRoot.model.appendChildWithCoord(cloneNode, e.clientX, e.clientY);
						
						
						AppsGate.Root.addKnownBrick(cloneNode);
						cloneNode.save();
					}

				}
			});

			
			// translate the view
      this.$el.i18n();
			return this;
    },
	
		
  });

  return BrickListView;
});