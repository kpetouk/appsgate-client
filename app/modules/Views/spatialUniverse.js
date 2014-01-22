define([
  'app',
  'snapsvg',
  'text!templates/map/default.html',
], function(App, Snap, svgtemplate) {

  // initialize the views array
  if (typeof AppsGate.Universe.Views === "undefined") AppsGate.Universe.Views = {};

  // home view
  AppsGate.Universe.Views.SpatialUniverse = Backbone.View.extend({

		el: $("#main"),
    template: _.template(svgtemplate),

    initialize:function() {
			// Set zoom handler
			window.onmousewheel = document.onmousewheel = this.wheel;
		},

		/**
			* Sets custom functions to use Snap.svg
			*/
		initializeSnapSvg:function() {
			paper.unit=100;
				
			// Animates viewbox changes
			paper.animateViewBox = function( x, y, w, h, duration, easing_function, callback){
				paper.zooming = true;
				currentViewBox = paper.attr("viewBox");
				var cx = currentViewBox ? currentViewBox.x : 0,
					dx = x - cx,
					cy = currentViewBox ? currentViewBox.y : 0,
					dy = y - cy,
					cw = currentViewBox ? currentViewBox.width : $('#svgspace').outerWidth(),
					dw = w - cw,
					ch = currentViewBox ? currentViewBox.height : $('#svgspace').outerHeight(),
					dh = h - ch,
					self = this;;
				easing_function = easing_function || mina.linear;

				var interval = 25;
				var steps = duration / interval;
				var current_step = 0;
				var easing_formula = easing_function;

				var intervalID = setInterval( function()
					{
						var ratio = current_step / steps;
						var stepX = cx + dx * easing_formula( ratio );
						var stepY = cy + dy * easing_formula( ratio );
						var stepW = cw + dw * easing_formula( ratio );
						var stepH = ch + dh * easing_formula( ratio );
						console.log("step: " + current_step + ": " + stepX + "," + stepY + "," + stepW + "," + stepH )
						
						paper.attr({viewBox: "" + stepX + "," + stepY + "," + stepW + "," + stepH});
						if ( current_step++ >= steps )
						{
							clearInterval( intervalID );
							paper.zooming = false;
							callback && callback();
						}
					}, interval );
			};

			// Zooming function based on the mousewheel
			paper.zoomSvg = function(mouseX, mouseY, delta) {
				var multiplier = 1.005;
				if (delta < 0)
					multiplier = 0.995;

				var viewBox = paper.attr("viewBox");
				
				//console.log("viewBox: ");
				//console.log(viewBox);

				//mouse coordinates to viewbox coordinates at current scale
				x = viewBox.x + mouseX / paper.currentZoom;
				y = viewBox.y + mouseY / paper.currentZoom;

				paper.currentZoom *= multiplier;
				console.log("currentZoom: " + paper.currentZoom);
				paper.displayDevices();

				//scale the view box   
				viewBoxWidth = $('#svgspace').outerWidth() / paper.currentZoom;
				viewBoxHeight = $('#svgspace').outerHeight() / paper.currentZoom;
				//new coordinates to new viewbox coordinates at new scale
				paper.curX = x - mouseX / paper.currentZoom;
				paper.curY = y - mouseY / paper.currentZoom;

				//console.log("curX: " + paper.curX + ", curY: " + paper.curY);

				paper.attr({viewBox: "" + paper.curX + "," + paper.curY + "," + viewBoxWidth + "," + viewBoxHeight});
			};
			
			// Zooming function to zoom on a selected shape
			paper.zoomInPlace = function(event) {
				var element = event.srcElement;
			
				var bbox = element.getBBox();
				
				var horizontalZoom = $('#svgspace').outerWidth()/bbox.width;
				var verticalZoom = $('#svgspace').outerHeight()/bbox.height;
				paper.currentZoom = horizontalZoom < verticalZoom ? horizontalZoom : verticalZoom;
				
				//reduce zoom a bit to better see the element
				paper.currentZoom *= 0.5
				
				viewBoxWidth = $('#svgspace').outerWidth() / paper.currentZoom;
				viewBoxHeight = $('#svgspace').outerHeight() / paper.currentZoom;
				
				paper.animateViewBox(bbox.x-viewBoxWidth*0.25, bbox.y-viewBoxHeight*0.25, viewBoxWidth, viewBoxHeight, 500, mina.easeout, paper.displayDevices);
				
				var viewBox = paper.attr("viewBox");
				
				paper.curX = viewBox.x;
				paper.curY = viewBox.y;
				
				
				//console.log("viewBox: ");
				//console.log(viewBox);
				//console.log("bbox.x: " + bbox.x + ", bbox.y: " + bbox.y);
				//console.log("curX: " + paper.curX + ", curY: " + paper.curY);
				
			};
			
			// Draws elements to represent a place
			paper.drawPlace = function(number, place) {
				var size = paper.unit;
				var placeShape =	paper.rect(1.5*number*size,size,size,size).attr({class: "place-shape", fill: "white", stroke:"green"});
				var placeTitle = paper.text(1.5*number*size+10,size,place.get("name")).attr({class:"place-title"});
				var placeGroup = paper.group(placeShape, placeTitle).attr({id: place.get("id"), class: "place"});
				
				var bbox = placeShape.getBBox();
				var placeX = bbox.x;
				var placeY = bbox.y;
				var placeHUnit = bbox.width/7;
				var placeVUnit = bbox.height/7;
				
				// adding place devices
				var devices = place.get("devices");
				console.log(devices);
				
				// adding place summary
				var deviceNbText = paper.text(placeX+placeHUnit,placeY+placeVUnit, $.i18n.t("places-details.header.device-number-title") + ": " + devices.length).attr({class:"place-details"});
				var averageConsumption = paper.text(placeX+placeHUnit, placeY+placeVUnit*2, $.i18n.t("places-details.header.consumption-label") + ": " + place.getAverageConsumption()).attr({class:"place-details"});
				var averageTemperature = paper.text(placeX+placeHUnit, placeY+placeVUnit*3, $.i18n.t("places-details.header.temperature-label") + ": " + place.getAverageTemperature()).attr({class:"place-details"});
				var averageIllumination = paper.text(placeX+placeHUnit, placeY+placeVUnit*4, $.i18n.t("places-details.header.illumination-label") + ": " + place.getAverageIllumination()).attr({class:"place-details"});
				
				var placeDetails = paper.group(deviceNbText, averageConsumption, averageTemperature, averageIllumination).attr({class: "place-details"});
				
				placeGroup.add(placeDetails);
				
				// adding device items
				var col = 1;
				var row = 1;
				devices.forEach(function(deviceId){
					var device = AppsGate.Device.Collection.get(deviceId);
					if(typeof device !== 'undefined'){
						if(row <= 6){
							var deviceX = placeX+placeHUnit*col;
							var deviceY = placeY+placeVUnit*row;
							var deviceShape = paper.rect(deviceX, deviceY, placeHUnit, placeVUnit).attr({class: "device-shape", fill:"gray", stroke:"green"});
							var deviceTitle = paper.text(deviceX+placeHUnit*0.1, deviceY+placeVUnit/2,device.get("name")).attr({class:"device-title"});
							var deviceGroup = paper.group(deviceShape, deviceTitle).attr({id: device.get("id"), class: "device"});
							
							col += 2;
							col = col%6;
							if(col == 1){
								row += 2;
							}
						}
					}
				});
			};
			
			// toggles devices display
			paper.displayDevices = function() {
				if(paper.currentZoom > 3){
					$(".device").show();
					$(".place-details").hide();
					console.log("should display devices now");
				} else {
					$(".device").hide();
					$(".place-details").show();
					console.log("should hide devices now");
				}
			};

		},

    /**
     * Event handler for mouse wheel event.
     */
    wheel: function(event){
      var delta = 0;
      if (event.wheelDelta) { /* IE/Opera. */
        delta = event.wheelDelta/120;
      } else if (event.detail) { /** Mozilla case. */
      /** In Mozilla, sign of delta is different than in IE.
       * Also, delta is multiple of 3.
       */
      delta = -event.detail/3;
      }
      /** If delta is nonzero, handle it.
       * Basically, delta is now positive if wheel was scrolled up,
       * and negative, if wheel was scrolled down.
       */
      if (delta && !paper.zooming) {
        paper.zoomSvg(event.x, event.y, delta);
      }

      event.preventDefault();

    },
		
		startDrag:function (x, y, e) {
			var viewBox = paper.attr("viewBox");
			paper.curX = viewBox.x;
			paper.curY	= viewBox.y;
			//console.log("mouseX: " + x + ", mouseY: " + y);
			//console.log("viewBox.x: " + paper.curX + ", viewbox.y: " + paper.curY);
			//console.log(event);
		},
		
		moveDrag:function (dx, dy, mx, my, event) {
			var viewBox = paper.attr("viewBox");
		
			//console.log("dx: " + dx + ", dy: " + dy + ", currentZoom: " + paper.currentZoom);
		
			tx = paper.curX - dx / paper.currentZoom;
			ty = paper.curY - dy / paper.currentZoom;
			paper.attr({viewBox: "" + tx + "," + ty + "," + viewBox.width + "," + viewBox.height});
    },
		
		endDrag:function(event) {
			var viewBox = paper.attr("viewBox");
			paper.curX = viewBox.x;
			paper.curY	= viewBox.y;
		
			//console.log(event);
		},

    /**
			* render the spatial universe
			*/
    render:function() {
      var self = this;

      this.$el.html(this.template());
      window.paper = Snap("#svgspace");
			this.initializeSnapSvg();

      var initialWidth = $('#svgspace').outerWidth();
      var initialHeight = $('#svgspace').outerHeight();

      paper.attr({viewBox: "0,0," + initialWidth + "," + initialHeight});
			paper.currentZoom = 1;
			paper.curX = 0;
			paper.curY = 0;
			
			paper.drag(this.moveDrag, this.startDrag, this.endDrag);
			
			paper.dblclick(paper.zoomInPlace);

      var places = AppsGate.Place.Collection;
      var i = 1;
      places.forEach(function(place) {
        if (place.get("id") !== "-1") {
          paper.drawPlace(i, place);
          i++;
        }
      });
			
			paper.displayDevices();
      
			return this;
    }
  });

  return AppsGate.Universe.Views.SpatialUniverse;
});
