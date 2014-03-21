define( [
  "app",
	"snapsvg",
  "views/appsgateview",
	"text!templates/bricks/brickDraggableView.html"
], function(App, Snap, AppsGateView, draggableTemplate) {

  var BrickView = {};

  /**
   * Basic Brick View class extending the AppsGate View class and an abstract class for all the brick views in the application
   */
  BrickView = AppsGateView.extend({
	
		tplDraggableView: _.template(draggableTemplate),

    /**
     * constructor
     */
    initialize:function() {
      BrickView.__super__.initialize.apply(this, arguments);
			this.name = "BrickView";
      this.dt = 0.1;
      this.size = 32;
			this.nameHeight	=0;
      this.svg_point = null;
      this.draggedList = [];
      this.toUnplugList = [];


      this.x = this.model?this.model.x:0;
			this.y = this.model?this.model.y:0;
      this.w = this.model?this.model.w:1;
			this.h = this.model?this.model.h:1;
      this.innerMagnitude = 12;
      this.color = 'white';
			this.stroke = 'black';
      this.display = true;
      this.scaleToDisplayChildren = 0.5;
      this.validity = { pixelsMinDensity : 0,
        pixelsMaxDensity : 999999999,
        pixelsRatio : this.w / this.h
			};
				
			if(typeof this.el === 'undefined' || this.el.tagName !== 'svg') {
				this.el = "#svgspace";
			}
    },

		/**
		 * Converts the model to its JSON representation.
		 */
		toJSON:function() {
			return {
				name : this.name,
				dt		: this.dt,
				size	: this.size,
				x : this.x,
				y : this.y,
				innerMagnitude : this.innerMagnitude,
				color : this.color,
				scaleToDisplayChildren : this.scaleToDisplayChildren,
				display : this.display,
				validity : this.validity,
			};
		},
	
    /**
		 * Adds an element to the dragged list
		 * @param obj Element to add
		 */
    pushDragged:function(obj) {
      var node = obj.target;
      obj.nodesList = [];
      while(node.parentNode) {
        obj.nodesList.push(node);
        node=node.parentNode;
      }
      this.draggedList.push(obj);
    },

		/**
		 * Removes an element from the dragged list
		 * @param idPtr Pointer id to remove
		 */
    removeDragged:function(idPtr) {
      for(var i=0; i<this.draggedList.length; i++) {
        if(this.draggedList[i].id === idPtr) {
          this.draggedList.splice(i,1);
          break;
        }
      }
    },
		
		/**
		 * Returns the id of an element if it is in the dragging list
		 * @param node Node to evaluate
		 */
    isDragging:function(node) {
      for(var i=0; i<this.draggedList.length; i++) {
        if(this.draggedList[i].nodesList.indexOf(node) >= 0) {
          return this.draggedList[i].id;
        }
      }
      return null;
    },

		/**
		 * Adds an element to the list of elements to unplug
		 * @param view The view to add
		 */
    pushViewToUnplug:function(view) {
      this.toUnplugList.push(view);
    },

		/**
		 * Unplugs the view referenced in the list of items to unplug
		 * @param idPtr Pointer id
		 */
    processViewsToUnplug:function(idPtr) {
      // Unplug only if the tile is no more related to any pointer
      var list = [];
      for(var i=0; i<this.toUnplugList.length; i++) {
        if(this.isDragging(this.toUnplugList[i].root) === null) {
          this.toUnplugList[i].brick.unPlugView(toUnplugView[i]);
        }
        else {
          list.push(this.toUnplugList[i]);
        }
      }
      this.toUnplugList = list;
    },

    /**
     * Sets the svg origin point attribute for this view
     * @param p The svg point to set
     */
    set_svg_point:function(p) {
      this.svg_point = p;
    },

    /**
     * Returns the svg point of this view
     */
    get_svg_point:function() {
      return this.svg_point;
    },

    /**
     * Returns the size of a spatial unit rendered by this view
     */
    getViewSize:function() {
      return this.size;
    },

    /**
     * Returns the coordinates relative to this view
     */
    getViewCoords:function() {
			dt = this.dt;
      size = this.size;
      return {	x1 : 0.5*dt*size,
        y1 : 0.5*dt*size,
        x2 : 0.5*dt*size + size*(this.w-dt),
        y2 : 0.5*dt*size + size*(this.h-dt) };
    },

		// Handle the start state. Create a view to drag
		startDrag: function (x, y, e) {
			e.stopPropagation();
			
			console.log("started dragging");
			
      var self = this.node.ViewRoot;
			
			self.root.attr({display:"none"});
			
			$("body").append(self.tplDraggableView);
			$("#draggableFeedback").css("position","absolute");
			$("#draggableFeedback").css("z-index","9999");
									
			this.draggedViewSvg = self.model.getNewView("undefined", "#svgDraggable").render();
				
		},
				
		moveDrag: function (dx, dy, x, y, e) {
			e.stopPropagation();
			$("#draggableFeedback").offset({left:e.clientX,top:e.clientY});
			
			var clientX = null;
			var clientY = null;
			if(e.type === "mouseup") {
				clientX = e.clientX;
				clientY = e.clientY;
			}
			else if (e.type === "touchend") {
				clientX = e.changedTouches[0].clientX;
				clientY = e.changedTouches[0].clientY;
			}
			
			
			$("#draggableFeedback").addClass("hidden");
			
			target = Snap.getElementByPoint(x, y).node;
			
			$("#draggableFeedback").removeClass("hidden");
			
			//console.log(target);
			while(target !== null && typeof target.classList === 'undefined' || !target.classList.contains('ViewRoot')) {
						target = target.parentNode;
					}
					
				if (target && target.ViewRoot) {
								var CTM = target.ViewRoot.groot.node.getCTM()
;
				//console.log(target);
				console.log(CTM);
				console.log("m" + CTM.a + "," + CTM.b + "," + CTM.c + "," + CTM.d + "," + CTM.e + "," + CTM.f);
				this.draggedViewSvg.node.ViewRoot.root.transform("m" + CTM.a + "," + CTM.b + "," + CTM.c + "," + CTM.d + ",0,0" );
				}

		},
				
				// Handle the end state. Append the corresponding brick to the drop target
		stopDrag: function (e) {
			var self = this.node.ViewRoot;
			e.stopPropagation();
			$("#draggableFeedback").remove();
			
			var clientX = null;
			var clientY = null;
			if(e.type === "mouseup") {
				clientX = e.clientX;
				clientY = e.clientY;
			}
			else if (e.type === "touchend") {
				clientX = e.changedTouches[0].clientX;
				clientY = e.changedTouches[0].clientY;
			}
			
			target = Snap.getElementByPoint(clientX, clientY).node;
			
			while(target && typeof target.classList === 'undefined' || (!target.classList.contains('btn-trashbin') && !target.classList.contains('ViewRoot'))) {
						target = target.parentNode;
					}
			
			// if the target is the trashbin, we delete the dragged element
			if(target && typeof target.classList !== 'undefined' && target.classList.contains('btn-trashbin')) {
				var parent = self.model.parents[0];
				if(parent) {
					parent.removeChild(self.model);
					parent.save();
				}
				self.model.destroy();
				dispatcher.trigger("cancelEditMode");
			}
			else if (target && target.ViewRoot && target.ViewRoot.model) {
				self.moveView(clientX,clientY, target.ViewRoot);
				
				self.root.attr({display:"block"});
			}
			else {
				self.root.attr({display:"block"});
			}
			
			console.log("stopped dragging, removing listener");
			self.root.undrag();
			self.rect.attr({"stroke-width":"2"});
			self.dragged = false;
					
		},

		moveView:function(x,y, target) {
			if(this.model.parents[0] !== target.model) {
				var parent = this.model.parents[0];
				parent.removeChild(this.model);
				parent.save();
				target.model.appendChild(this.model);
				
			}
			var screenPoint = $("#svgspace")[0].createSVGPoint();
			screenPoint.x = x;
			screenPoint.y = y;
			var CTM = target.root.node.getCTM();
			var globalCTM = target.groot.node.getCTM();
			var targetPoint = screenPoint.matrixTransform( target.groot.node.getScreenCTM().inverse() );
			var newX = Math.round(targetPoint.x/this.size);
			var newY = Math.round(targetPoint.y/this.size);

			this.model.x = newX;
			this.model.y = newY;
			this.root.transform("t" + [newX*this.size,newY*this.size]);
			
		},

    /**
     * Renders this view
     */
    render:function() {
      var self = this;

      // if this view isn't yet rendered we add the elements of this view to the svg canvas
      if(!this.root) {
        dt = this.dt;
        size = this.size;
				
				// The space for children
				if(this.model.isGroup) {
					this.nameHeight = 11;
				}
        
				// we create the root element of this view
				var paper = Snap(this.el);
        var group  = paper.g();
				if(this.el === "#svgspace"){
					group.transform("t"+[this.x*size,this.y*size]);
				}
        group.attr({class:"ViewRoot"});

        this.root = group;
        this.root.node.ViewRoot = this;
				
				// initialize the svg point for this view
        this.svg_point = paper.node.createSVGPoint();

        // initialize the root for children views
        var groupRoot = paper.g();
        groupRoot.attr({class:"rootInternal"});

        // resize the group root based on its inner magnitude
        var scale = (Math.max(this.w,this.h)-2*dt)/this.innerMagnitude;
        groupRoot.transform("t" + dt*size +", "+ dt*size + "s" + scale + ',' + scale);
        this.groot = groupRoot;

        // add the basic graphical elements of this view
        this.gView = paper.g();
				var shadow = paper.rect(0.5*dt*size, 0.5*dt*size, size*(this.w-dt),(this.nameHeight+size)*(this.h-dt));
				shadow.attr({class:"shadow", rx:"6", ry:"6", fill:this.color});
        var r  = paper.rect(0.5*dt*size, 0.5*dt*size, size*(this.w-dt),(this.nameHeight+size)*(this.h-dt));
        r.attr({class:"tile", rx:"6", ry:"6", fill:this.color, stroke:this.stroke, "stroke-width":"2"});
				var border = paper.rect(0.5*dt/2*size, 0.5*dt/2*size, size*(this.w-dt/2),(this.nameHeight+size)*(this.h-dt/2));
				border.attr({rx:"6", ry:"6", fill:"none", stroke:"black", "stroke-width":"0.5"});
				
				this.bgRect = r;
				this.shadow = shadow;
        this.gView.add(shadow);
				this.gView.add(r);
				this.gView.add(border);
								
				if(this.model.isGroup) {
					this.childrenIndicator = paper.rect(1.5*dt*size, this.nameHeight+1.5*dt*size, size*(this.w-3*dt), (this.nameHeight+size)*(this.h-0.5-dt)).attr({class:"tile", rx:"6", ry:"6", fill:this.stroke, stroke:"black", "stroke-width":"0.5"});
				
					if(this.model.children.length > 0 && scale >= this.scaleToDisplayChildren) {
						this.childrenIndicator.attr({"display":"inherit"});
					}
					else {
						this.childrenIndicator.attr({"display":"none"});
					}

					this.gView.add(this.childrenIndicator);
				
					var text = paper.text(3,this.nameHeight+1.5*dt*size,this.model.getProperty("name"));
					this.gView.add(text);
				}
								
				this.root.add(this.gView);
        this.root.add(groupRoot);
        this.rect = r;
				
				// handle taphold
				var detectTapHold = function(e) {
					var startX = e.clientX;
					var startY = e.clientY;
					
					var multitouch = e.originalEvent != null && e.originalEvent.touches[1] != null ? true : false;
					if(self.dragged != true && !multitouch){
					pressTimer = window.setTimeout(function() {
						if(startX == e.clientX && startY == e.clientY) {
							dispatcher.trigger("editMode", self.model);
							console.log("set draggable");
							self.root.drag(self.moveDrag, self.startDrag, self.stopDrag);
							self.dragged = true;
							self.rect.attr({"stroke-width":"4"});
						}
					},1000);
					}
					return false;
				};
				
				var pressTimer;
				this.gView.mousedown(detectTapHold);
				this.gView.mouseup(function(e) {
					// Clear timeout
					clearTimeout(pressTimer);
					return false;
				});


        // proceed to add the children views of this view
        if(this.model.children.length > 0 && this.children.length === 0){
          this.model.children.forEach(function(child){
            self.appendChildFromBrick(child);
          });
        }

      }
      return this.root;
    },
		
		redrawView:function() {
			this.x = this.model.x;
			this.y = this.model.y;
			this.w = this.model.w;
			this.h = this.model.h;
			if(this.root) {
				this.root.remove();
				this.root = null;
			}
		
			if(this.parent) {
				this.parent.primitivePlug(this);
				this.model.children.forEach(function(child) {
					child.views.forEach(function(view){
						view.redrawView();
					});
				});
			}
		},
		
    /**
     * Returns inner root element of this view
     */
    getInnerRoot:function() {
      return this.groot;
    },

    /**
     * Renders the elements of a given child and appends them to the elements of the current view
     * @param child The child view to append
     */
    primitivePlug:function(child) {
			try{
				this.render();
				var group = child.render();
				this.groot.add(group);
			} catch (e) {
				if(group)group.remove();
				console.log(e);
			}
    },

    /**
     * Returns the current pixel density and pixel ratio of the children of this view
     * @param w Width of this view
     * @param h Height of this view
     * @param MT Transform matrix
     */
    getChildrenContext:function(w, h, MT) {
      var root = this.groot;
			var scale = -1;
      if(root) {
        var M = null;
        // if there is a transform matrix, we add it to the matrix of this view
        if(MT) {
          M = MT.multiply( root.node.getCTM() );
        }
        else {
          M = root.node.getCTM();
        }

        // we evaluate the pixel density of this view
        this.svg_point.x = 0;
        this.svg_point.y = 0;

        var P0 = this.svg_point.matrixTransform( M );

        this.svg_point.x = 1;
        this.svg_point.y = 0;

        var P1 = this.svg_point.matrixTransform( M );

        var dx = P1.x - P0.x,	dy = P1.y - P0.y;
				scale = Math.sqrt( dx*dx + dy*dy );

      }
      else {
				scale = 0;
      }
      return {pixelsDensity:scale,pixelsRatio:w/h};
    },

    /**
     * Performs the semantic zoom given the transform matrix, the origin and the destination level of zoom
     * @param MT The transform matrix of this view
     * @param L_toAppear The destination level of zoom
     * @param L_toDisappear The origin level of zoom
     */
    computeSemanticZoom:function(MT, L_toAppear, L_toDisappear) {
      var scale = this.getChildrenContext(this.w, this.h, MT).pixelsDensity;
      if(this.adaptRender(scale,L_toAppear,L_toDisappear)) {
        // Recursing across semantic zoom structure
        for(var i=0;i<this.children.length;i++) {
          this.children[i].computeSemanticZoom(MT, L_toAppear, L_toDisappear);
        }
      }
    },

    /**
     * Adapts the rendered view given the level of zoom
     * @param scale Current pixel density
     * @param L_CB Level to appear/disappear
     */
    adaptRender:function(scale, L_CB) {
      var res;
      var self = this;

      // if the current pixel density isn't in the view domain of validity, we try to create a new adapted view
      if(  scale < this.validity.pixelsMinDensity || scale > this.validity.pixelsMaxDensity ) {
				var newView = this.model.getNewViewWithContext({ pixelsRatio	: this.w / this.h, pixelsDensity	: scale });
          // the new view replaces the invalid one
          if(newView) {
            newView.x = this.x;
            newView.y = this.y;
            newView.w = this.w;
            newView.h = this.h;
            this.parent.appendChild( newView );
            L_CB.push( function(v) {
              self.cb_Fade(v,1,0,self.root.node);
              newView.cb_Fade(v,0,1,newView.root.node);
              if(v>=1) {
                self.model.unPlugView( self );
              }
            });
          }
          else {
            console.log("Warning, no other compatible presentations...");
          }
        }
				
				if(scale < this.scaleToDisplayChildren) {
					if(this.display) {
						this.display = false;
						L_CB.push(
							function(v) {
								if(self.childrenIndicator && self.childrenIndicator.node.parentElement && self.model.children.length > 0) {
									self.cb_Fade(v,0,1,self.childrenIndicator.node);
								}
								self.cb_Fade(v,1,0);
							});
						res = true;
					} else {
						res = false;
					}
				} else {
					if(!this.display) {
						this.display = true;
						L_CB.push(
							function(v) {
								if(self.childrenIndicator && self.childrenIndicator.node.parentElement) {
									self.cb_Fade(v,1,0,self.childrenIndicator.node);
								}
								self.cb_Fade(v,0,1);
							});
					}
					res = true;
				}
        return res;
    },

    /**
     * Shows/fades a given view
     * @param dt 
     * @param v0 Initial opacity
     * @param v1 Target opacity
     * @param node Node to show/fade
     */
    cb_Fade:function(dt, v0, v1, node) {
      if(!node) {
        node = this.getInnerRoot().node;
      }
      if(v0 === 0 && dt === 0) {
        node.style.display = 'inherit';
      }
      node.style.opacity = Math.easeInOutQuad(dt, v0, v1-v0, 1);
      if(v1 === 0 && dt >= 1) {
        node.style.display = 'none';
      }
    },

    /**
     * Deletes the svg elements of this view
     */
    deletePrimitives:function() {
      console.log("PresoTilesAlxAppsGate::deletePrimitives", this);
      if(this.root) {
				if(this.root.parentNode) {
					this.root.parentNode.remove(this.root);this.root=null;
					this.rect.parentNode.remove(this.rect);this.rect=null;
					this.gView.parentNode.remove(this.gView);this.gView=null;
					this.groot.parentNode.remove(this.groot);this.groot=null;
				} else {
					this.root = null; this.rect = null; this.gView = null; this.groot = null;
				}
      }
    }

  });

  // Return the reference to the BrickView
  return BrickView;

});
