define( [
  "app",
  "views/brickview",
  "snapsvg",
	"views/tools/dragmanager",
	"views/tools/utils",
  "text!templates/map/default.html"
], function(App, Brick, Snap, DragManager, AppsGateUtils, svgtemplate) {

  var MapUniverseView = {};

  /**
   * View representing the spatial universe
   */
  MapUniverseView = Brick.extend({

    el: $("#main"),
    template: _.template(svgtemplate),
    touchList:[],
    touchClickData:{},
    touchClickTimer:null,
    clickDelay:100,
    dblClickDelay:250,

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
    cbClic:function(e) {
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
        self.cbZoom(ms, ms+1000, M1, M2, self.groot.node, L_CB);
      });
    },

		/**
		 * Processes touches to determine whether it is a double tap
		 */
    processTouchList:function(ms) {
      this.touchList = this.touchList.splice(this.touchList.length-4,4);
			// Check if the events correspond to a double tap
      if(this.touchList.length === 4	&& this.touchList[0].ms > (ms-this.dblClickDelay) && this.touchList[0].evt === 1 && this.touchList[1].evt === 0 && this.touchList[2].evt === 1 && this.touchList[3].evt === 0) {
        var dx = 0;
        var dy = 0;
        for(var i=1;i<4;i++) {
          dx += this.touchList[i].x - this.touchList[i-1].x;
          dy += this.touchList[i].y - this.touchList[i-1].y;
        }
				// Determine if the same spot was double tapped
        if(Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          // clean up touchClick
          delete this.touchClickData[this.touchList[0].id]
          delete this.touchClickData[this.touchList[1].id]

          // callback
          this.cbClic({target: this.touchList[0].target});
        }
      }
    },

		/**
		 *	Dispatchs the touch click as a click event
		 */
    processClick:function() {
      var ms = Date.now();
      var clickData = {};
      var ptr;
      for(var i in this.touchClickData){
        ptr = this.touchClickData[i];
        if(ptr.click){
          var evt = new MouseEvent("click");
          evt.initMouseEvent("click",true,true);
          evt.clientX = ptr.clientX;
          evt.clientY = ptr.clientY;
          ptr.target.dispatchEvent(evt);
        }
        else {
          if(ptr.ms > ms - this.dblClickDelay) {
            clickData[i] = this.touchClickData[i];
          }
        }
      }
      this.touchClickData = clickData;
    },

		/**
		 * Handler for the touchstart event
		 */
    touchStartHandler:function(evt) {
      var self = this.node.ViewRoot;
      var ptr;
      var ms = Date.now();
      var timer = setTimeout(function() { self.processClick();}, 10+self.dblClickDelay);
      for(var i=0; i<evt.changedTouches.length;i++) {
        ptr = evt.changedTouches.item(i);
        self.touchClickData[ptr.identifier] = {target:ptr.target,id:ptr.identifier,x:ptr.clientX,y:ptr.clientY,ms:ms,timer:timer};
      }
      if(this.touchClickTimer) {
        clearTimeout(self.touchClickTimer);
        self.touchClickTimer = null;
      }

      if(evt.touches.length === 1) {
        ptr = evt.touches.item(0);
        var obj = {ms:ms,evt:1,id:ptr.identifier,x:ptr.clientX,y:ptr.clientY,target:evt.touches.item(0).target};
        self.touchList.push(obj);
      }
    },

		/**
		 * Handler for the touchend event
		 * @param evt The touchend event
		 */
    touchEndHandler:function(evt) {
			var self = this.node.ViewRoot;
      var ms  = Date.now();
      var ptr;
      // Manage click
      for(var i=0; i<evt.changedTouches.length; i++) {
        ptr = evt.changedTouches.item(i);
        if(self.touchClickData[ptr.identifier] && Math.abs(self.touchClickData[ptr.identifier].x - ptr.clientX) < 5 && Math.abs(self.touchClickData[ptr.identifier].y - ptr.clientY) < 5 && self.touchClickData[ptr.identifier].ms > ms-self.clickDelay) {
          self.touchClickData[ptr.identifier].click = true;
        }
      }
      // Manage double click
      if(evt.touches.length === 0) {
        ptr = evt.changedTouches.item(0);
        var obj = {ms:ms,evt:0,id:ptr.identifier,x:ptr.clientX,y:ptr.clientY};
        self.touchList.push(obj);
        // console.log( this.L_touches );
        self.processTouchList(ms);
      }
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

        paper.dblclick(this.cbClic);

        window.requestAnimFrame(function() {
          self.cbClic({target: svg
          });
        });

        // DragManager
        DragManager.init(this.root.node);
        DragManager.initSubscribersAddPtr();
        DragManager.initSubscribersSubPtr();
        DragManager.SubscribeAddPtr( 'MapUniverse',
                                     function(id, target) {
                                       // console.log('Adding a pointer', id);
                                       self.pushDragged( {id:id,target:target} );
                                     }
                                    );
                                    DragManager.SubscribeSubPtr( 'MapUniverse',
                                                                 function(id, target) {
                                                                   // console.log('Removing a pointer', id);
                                                                   self.removeDragged(id);
                                                                   self.processViewsToUnplug(id);
                                                                 }
                                                                );

																																this.root.touchstart(self.touchStartHandler);
																																this.root.touchend(self.touchEndHandler);
                                                                /*this.root.addEventListener	( 'touchstart', function(e) {self.touchstart(e)}, false);
                                                                this.root.addEventListener	( 'touchend'  , function(e) {self.touchend(e);} , false);*/
                                                                var zoomCB = function() {
                                                                  var cbList = [];
                                                                  self.computeSemanticZoom(self.idMatrix, cbList);
                                                                  if(cbList.length){
                                                                    AppsGateUtils.animate(300,
                                                                                     function(pos){
                                                                                       for(var i=0;i<cbList.length;i++){
                                                                                         try{
                                                                                           cbList[i](pos.dt);
                                                                                         } catch(e) {
                                                                                           alert('error on CB : ' + e);
																																													 console.warn(e);
                                                                                         }
                                                                                       }
                                                                                     }
                                                                                    );
                                                                  }
                                                                };

                                                                DragManager.addDraggable( this.groot.node, { eventNode	: this.root.node, cbZoom	: zoomCB});

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
     * @param L_CB Callback list
     */
    cbZoom:function(ms1,ms2,M1,M2,node,L_CB) {
      var self = this;
      var ms = Date.now();
      if(ms < ms2) {
        window.requestAnimFrame( function(time) {
          self.cbZoom(ms1,ms2,M1,M2,node,L_CB);
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
