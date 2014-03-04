define( [
  "app",
  "views/brickview"
], function(App, BrickView) {

  var MediaPlayerCloseView = {};

  /**
	 * Class of a close view of a Media Player
	 */
  MediaPlayerCloseView = BrickView.extend({

		/**
		 * constructor
		 */
    initialize:function(){
      MediaPlayerCloseView.__super__.initialize.apply(this, arguments);
			this.name = "MediaPlayerCloseView";
			this.volumeDisplay;
    },

		/**
		 * Allows to choose a media when open button is used
		 */
		onOpenButton:function() {
			// TODO
			//this.model.onBrowseMedia();
		},
		
		/**
		 * Plays the selected media if there is any
		 */
		onPlayButton:function() {
			// TODO
			//this.model.sendPlay();
		},
		
		/**
		 * Pauses/resumes the playback of the current media
		 */
		onPauseButton:function() {
			// TODO determine if something is playing then pause or resume
			this.model.sendPause();
		},
		
		/**
		 * Stops the playback of the current media if any
		 */
		onStopButton:function() {
			this.model.sendStop();
		},
		
		/**
		 * Sets the media player volume knob on a given volume level
		 * @param knobGroup Snap group element for the knob
		 * @param volume Volume to set
		 */
		initKnobPosition:function(knobGroup, volume) {
			var a = ((volume/100*26)-13);
			knobGroup.select("#volumeIndicator").transform("r"+ [a*10, knobGroup.knobcx, knobGroup.knobcy]);
			knobGroup.angle = -a;
			knobGroup.startAngle = -a;
			knobGroup.lastAngle = -a;
		},
		
		/**
		 * Volume knob startdrag handler
		 * @param x Drag x coordinate
		 * @param y Drag y coordinate
		 * @param evt Drag event
		 */
		dragKnobStart:function(x, y, evt) {
			evt.stopPropagation();
			this.startAngle = Snap.angle(this.knobcx, this.knobcy, x, y);
			this.lastAngle = this.angle;
			this.stop();
		},
		
		/**
		 * Volume knob dragmove handler
		 * @param dx Change of x coordinate to the previous position
		 * @param dy Change of y coordinate to the previous position
		 * @param x Current x position of the drag
		 * @param y Current y position of the drag
		 * @param evt Drag event
		 */
		dragKnobMove:function(dx, dy, x, y, evt) {
			evt.stopPropagation();
		
			var a = Snap.angle(this.knobcx,this.knobcy,x,y) - this.startAngle + this.angle;
			if(a < 0 && a < -13){
				a = -13;
			}
			else if ( a > 0 && a > 13){
				a = 13
			}
			this.select("#volumeIndicator").transform("r"+ [a*-10, this.knobcx, this.knobcy]);
			this.lastAngle = a;
			
			// translate the position of the knob to its volume value
			this.vol = Math.floor((-a + 13)/26*100);
			
			// update the volume display accordingly
			this.select("#volumeDisplay").node.innerHTML=this.vol;
			
		},
		
		/**
		 * Volume knob dragend handler
		 * @param evt Drag event
		 */
		dragKnobStop:function(evt) {
			evt.stopPropagation();
		
			this.angle = this.lastAngle;
			
			// update the model with the new value and send the data to the server
			var node = this.node;
			while(node && !node.classList.contains('ViewRoot')) {
        		node = node.parentNode;
      }
			node.ViewRoot.model.sendVolume(this.vol);
		},

		/**
		 * Renders the view
		 */
    render:function() {
      var self = this;
      MediaPlayerCloseView.__super__.render.apply(this, arguments);

      if(!this.controlView) {
        var dt = this.dt;
        var size = this.getViewSize();
				var viewWidth = size*(this.w-dt);
				var viewHeight = size*(this.h-dt);
        var paper = Snap("#svgspace");
        var group  = paper.g();
        var rect = paper.rect(0.5*dt*size, 0.5*dt*size, viewWidth,viewHeight).attr({fill:this.color,stroke:"black"});
        var text = paper.text(0,0,$.i18n.t(this.model.getProperty("name")));
				text.transform("m" + (viewWidth/2) / text.getBBox().width  + ", 0, 0, " + (viewHeight/10) / text.getBBox().height + "," + viewWidth/5 + "," + viewWidth/5);
        group.add(rect,text);
				
				// Adding control buttons
				Snap.load("app/img/button.svg", function(f){
          var wrap = f.select("svg");
          var w = wrap.attr("width");
          var h = wrap.attr("height");
					var width=viewWidth/5, height=self.h*size/10;
					
          var buttonGroupOpen = f.select("g");
					var buttonGroupPlay = buttonGroupOpen.clone();
					var buttonGroupResumePause = buttonGroupOpen.clone();
					var buttonGroupStop = buttonGroupOpen.clone();
					
          buttonGroupOpen.transform("m"+width / w +", 0, 0, "+height / h +"," + [viewWidth*0.1,viewHeight*0.9]);
					buttonGroupOpen.selectAll("tspan").forEach(function(tspan){tspan.node.innerHTML =  $.i18n.t("devices.mediaplayer.action.browse")});
					buttonGroupOpen.click(function() {self.onOpenButton()});
					
          buttonGroupPlay.transform("m"+width / w +", 0, 0, "+height / h +"," + [viewWidth*0.4,viewHeight*0.9]);
          buttonGroupPlay.selectAll("tspan").forEach(function(tspan){tspan.node.innerHTML = $.i18n.t("devices.mediaplayer.action.play")});
					buttonGroupPlay.click(function() {self.onPlayButton()});
					
					buttonGroupResumePause.transform("m"+width / w +", 0, 0, "+height / h +"," + [viewWidth*0.6,viewHeight*0.9]);
          buttonGroupResumePause.selectAll("tspan").forEach(function(tspan){tspan.node.innerHTML = $.i18n.t("devices.mediaplayer.action.pause")});
					buttonGroupResumePause.click(function() {self.onPauseButton()});
					
					buttonGroupStop.transform("m"+width / w +", 0, 0, "+height / h +"," + [viewWidth*0.8,viewHeight*0.9]);
          buttonGroupStop.selectAll("tspan").forEach(function(tspan){tspan.node.innerHTML = $.i18n.t("devices.mediaplayer.action.stop")});
					buttonGroupStop.click(function() {self.onStopButton()});

          group.add(wrap)

        });
				
				// Adding a volume control knob
				var knobX = viewWidth*0.8;
				var knobY = viewHeight*0.7;
				var knobRadius = size/12;
				var knobBase = paper.circle(knobX,knobY, knobRadius).attr({stroke:"green", strokeWidth:knobRadius*0.1});
				var knobIndicator = paper.circle(knobX,knobY-size/14, knobRadius*0.1).attr({id:"volumeIndicator", fill:"white"});
				var volumeLabel = paper.text(0,0, $.i18n.t("devices.mediaplayer.action.volume")).attr({fill:"green"});
				volumeLabel.transform("m" + knobRadius / volumeLabel.getBBox().width  + ", 0, 0, " + (knobRadius/4) / volumeLabel.getBBox().height + "," + (knobX - knobRadius/2) + "," + (knobY));
				console.log(this.model);
				var volumeValue = paper.text(0, 0, this.model.get("volume")).attr({id:"volumeDisplay", fill:"green"});
				volumeValue.transform("m" + knobRadius / volumeValue.getBBox().width  + ", 0, 0, " + (knobRadius/4) / volumeValue.getBBox().height + "," + (knobX - knobRadius/2) + "," + (knobY + knobRadius/4));
				
				var volumeKnob = paper.g(knobBase,knobIndicator,volumeLabel,volumeValue);
				volumeKnob.knobcx = knobBase.attr("cx");
				volumeKnob.knobcy = knobBase.attr("cy");
				volumeKnob.angle = 0;
				volumeKnob.startAngle;
				volumeKnob.lastAngle;
				volumeKnob.drag(this.dragKnobMove, this.dragKnobStart, this.dragKnobStop);
				
				// Set the actual volume level
				this.initKnobPosition(volumeKnob,this.model.get("volume"));
				group.add(volumeKnob);
				
        this.controlView = group;

				// Remove the previous view and add the new one
        this.bgRect.remove();
        this.root.add( this.controlView );
      }

      return this.root;
    },

		/**
		 * Removes all elements generated by the view
		 */
    deletePrimitives:function() {
      MediaPlayerCloseView.__super__.deletePrimitives.apply(this, []);

      if(this.controlView) {
        if(this.controlView.parentNode) {this.controlView.parentNode.removeChild(this.controlView);}
        this.controlView = null;
      }
    },

  });
  // Return the reference to the MediaPlayerCloseView
  return MediaPlayerCloseView;
});
