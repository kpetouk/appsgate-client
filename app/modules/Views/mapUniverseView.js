define( [
  "app",
  "views/brickview",
  "snapsvg",
  "text!templates/map/default.html"
], function(App, Brick, Snap, svgtemplate) {

  var MapUniverseView = {};

	/**
	 * View representing the spatial universe
	 */
  MapUniverseView = Brick.extend({

    el: $("#main"),
    template: _.template(svgtemplate),
		
		/**
		 * constructor
		 */
    initialize:function() {
			var self = this;
      MapUniverseView.__super__.initialize.apply(this, arguments);
			
		},

		/**
		 * Callback when an element is clicked, changes the zoom level to display the element
		 */
    cb_clic:function(e) {
		  var self = this.root.node.ViewRoot;
			var w = 1000;
			var h = window.innerHeight * 1000 / window.innerWidth;
			
			var M1 = self.groot.node.getCTM();
      var r = e.target;
      while(r && !r.classList.contains('ViewRoot')) {
        r = r.parentNode;
      }
			var viewCoords = r.ViewRoot.getViewCoords();
			
			self.svg_point.x = (viewCoords.x2-viewCoords.x1)/2;
			self.svg_point.y = (viewCoords.y2-viewCoords.y1)/2;
			self.svg_point = self.svg_point.matrixTransform(self.groot.node.getCTM());
			var dx = self.svg_point.x;
			var dy = self.svg_point.y;
			dx = dy = self.getViewSize()*6;
			
      r = r.ViewRoot.getInnerRoot();
			
			var M2 = r.node.getCTM().translate(dx-w/2,dy-h/2).inverse().multiply(self.groot.node.getCTM());

      var ms = Date.now();
      window.requestAnimFrame( function(time) {
        var L_CB = [];
        self.computeSemanticZoom( M1.inverse().multiply(M2), L_CB );
        for(var i=0;i<L_CB.length;i++) {
          L_CB[i](0);
        } // Start
        self.cb_zoom(ms, ms+1000, M1, M2, self.groot.node, L_CB);
      });
    },
		
		/**
		 * Handler for starting drag event
		 * @param x Mouse X coordinate
		 * @param y Mouse Y coordinate
		 * @param event Event that triggered the handler
		 */
		startViewDrag:function(x, y, event) {
			this.initialTransform = this.node.ViewRoot.groot.transform();
		},
		
		/**
		 * Handler for dragging event
		 * @param dx Change of X coordinate relatively to the previous position
		 * @param dy Change of Y coordinate relatively to the previous position
		 * @param mx Coordinate X of the mouse pointer
		 * @param my Coordinate Y of the mouse pointer
		 * @param event Event that triggered the handler
		 */
		viewDrag:function(dx, dy, mx, my, event) {
			var M = new Snap.Matrix();
			M.translate(dx,dy);
			M.add(this.initialTransform.localMatrix);
			this.node.ViewRoot.groot.transform("m" + M);
		},
		
		/**
		 * Renders this view
		 */
    render:function() {
      var self = this;

      if(!this.root) {

        this.$el.html(this.template());
        var paper = Snap("#svgspace");
				paper.attr({class:"ViewRoot", xlink:"http://www.w3.org/1999/xlink", width:"100%", height:"100%"});
				
				this.w = $("#svgspace").outerWidth()/this.size;
				this.h = $("#svgspace").outerHeight()/this.size;

        this.root= paper;
        this.root.node.ViewRoot = this;

        var groupRoot = paper.g();
        groupRoot.attr({class:"rootInternal"});
        this.groot = groupRoot;
        this.root.append(this.groot);
				this.root.drag(this.viewDrag, this.startViewDrag);

        var svg = this.root.node;
        this.svg_point = svg.createSVGPoint();
        this.set_svg_point( this.svg_point );
				
				AppsGate.Place.Collection.forEach(function(place) {
					if (place.get("id") !== "-1") {
						self.integrateBrick(place);
					}
				});
				
				paper.dblclick(this.cb_clic);

        window.requestAnimFrame(function() {
          self.cb_clic({target: svg
          });
        });
      }

      return this.root;
    },

		/**
		 * Callback applying the zooming transformation
		 * @param ms1
		 * @param ms2
		 * @param M1
		 * @param M2
		 * @param node Element to resize
		 * @param L_CB
		 */
    cb_zoom:function(ms1,ms2,M1,M2,node,L_CB) {
      var self = this;
      var ms = Date.now();
      if(ms < ms2) {
        window.requestAnimFrame( function(time) {
          self.cb_zoom(ms1,ms2,M1,M2,node,L_CB);
        });
      }
      else {
        ms=ms2;
      }
      var v = (ms-ms1)/(ms2-ms1);
      for(var i=0;i<L_CB.length;i++) {
        L_CB[i](v);
      }
      // Start
      node.setAttribute( 'transform',
                        'matrix(' + Math.easeInOutQuad(ms-ms1,M1.a,M2.a-M1.a,ms2-ms1) //(M1.a+(M2.a-M1.a)*dt)
                        + ',' + Math.easeInOutQuad(ms-ms1,M1.b,M2.b-M1.b,ms2-ms1) //(M1.b+(M2.b-M1.b)*dt)
                        + ',' + Math.easeInOutQuad(ms-ms1,M1.c,M2.c-M1.c,ms2-ms1) //(M1.c+(M2.c-M1.c)*dt)
                        + ',' + Math.easeInOutQuad(ms-ms1,M1.d,M2.d-M1.d,ms2-ms1) //(M1.d+(M2.d-M1.d)*dt)
                        + ',' + Math.easeInOutQuad(ms-ms1,M1.e,M2.e-M1.e,ms2-ms1) //(M1.e+(M2.e-M1.e)*dt)
                        + ',' + Math.easeInOutQuad(ms-ms1,M1.f,M2.f-M1.f,ms2-ms1) //(M1.f+(M2.f-M1.f)*dt)
                        + ')'
                       );
    }

  });
  // Return the reference to the MapUniverseView
  return MapUniverseView;
});
