define( [
  "app",
  "views/appsgateview"
], function(App, AppsGateView) {

  var BrickView = {};

  /**
   * Basic Brick View class extending the AppsGate View class and an abstract class for all the brick views in the application
   */
  BrickView = AppsGateView.extend({

    /**
     * constructor
     */
    initialize:function() {
      BrickView.__super__.initialize.apply(this, arguments);
      // console.log("PresoTilesAlxAppsGate Init");
      this.dt = 0.1;
      this.size = 32;
      this.svg_point = null;


      this.x = this.y = 0;
      this.w = this.h = 5;
      this.innerMagnitude = 12;
      this.color = 'cyan';
      this.display = true;
      this.scaleToDisplayChildren = 0.5;
      this.validity = { pixelsMinDensity : 0,
        pixelsMaxDensity : 999999999,
        pixelsRatio		 : this.w / this.h };
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
      return {	x1 : 0.5*dt*size,
        y1 : 0.5*dt*size,
        x2 : 0.5*dt*size + size*(this.w-dt),
        y2 : 0.5*dt*size + size*(this.h-dt) };
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

        // we create the root element of this view
        var paper = Snap("#svgspace");
        var group  = paper.g();
        group.transform("t"+[this.x*size,this.y*size]);
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
        var r  = paper.rect(0.5*dt*size, 0.5*dt*size, size*(this.w-dt),size*(this.h-dt));
        r.attr({class:"tile", fill:this.color, stroke:"black"});

        this.bgRect = r;
        this.gView.add(r);
        this.root.add(this.gView);
        this.root.add(groupRoot);
        this.rect = r;

        // proceed to add the children views of this view
        if(this.model.children.length > 0 && this.children.length === 0){
          this.model.children.forEach(function(device){
            self.integrateBrick(device);
          });
        }

      }
      return this.root;
    },

    /**
     * Returns inner root element of this view
     */
    getInnerRoot:function() {
      return this.groot;
    },

    /**
     * Integrates automatically elements of a given brick's view, positioning them one after the other
     * with a default size
     * @param brick The brick model, which view should be integrated
     */
    integrateBrick:function(brick) {
      var parentWidth = Math.floor( this.innerMagnitude*this.w / Math.max(this.w, this.h) );
      var newX = this.children.length % parentWidth;
      var newY = Math.floor(this.children.length / parentWidth);
      var tile = this.appendChildFromBrick	( brick, function() {this.x = newX; this.y = newY; this.w = 1; this.h = 1;}, undefined, this.getChildrenContext(1, 1));
    },

    /**
     * Renders the elements of a given child and appends them to the elements of the current view
     * @param child The child view to append
     */
    primitivePlug:function(child) {
      this.render(),
      group = child.render();
      this.groot.add(group);
    },

    /**
     * Returns the current pixel density and pixel ration of the children of this view
     * @param w Width of this view
     * @param h Height of this view
     * @param MT Transform matrix
     */
    getChildrenContext:function(w, h, MT) {
      var root = this.groot;
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

        var dx = P1.x - P0.x,	dy = P1.y - P0.y,	scale = Math.sqrt( dx*dx + dy*dy );

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
      if(  scale < this.validity.pixelsMinDensity
        || scale > this.validity.pixelsMaxDensity ) {
          var newView = this.model.getNewViewWithContext(
            { pixelsRatio	: this.w / this.h
            , pixelsDensity	: scale }
          );
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
        // if the zoom isn't strong enough to display children, they are hidden
        if(scale < this.scaleToDisplayChildren) {
          if(this.display) {
            this.display = false;
            L_CB.push( function(v) {self.cb_Fade(v,1,0);} );
            res = true;
          }
          else {
            res = false;
          }
        }
        else {
          if(!this.display) {
            this.display = true;
            L_CB.push( function(v) {self.cb_Fade(v,0,1);} );
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
        this.root.parentNode.remove(this.root);this.root=null;
        this.rect.parentNode.remove(this.rect);this.rect=null;
        this.gView.parentNode.remove(this.gView);this.gView=null;
        this.groot.parentNode.remove(this.groot);this.groot=null;
      }
    }

  });

  // Return the reference to the BrickView
  return BrickView;

});
