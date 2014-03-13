define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var PhillipsHueCloseView = {};

  /**
	 * Class of a close view of a Phillips Hue Lamp
	 */
  PhillipsHueCloseView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){
      PhillipsHueCloseView.__super__.initialize.apply(this, arguments);
			this.name = "PhillipsHueCloseView";
    },

		/**
		 * Initializes the toggle button depending on the lamp current state
		 */
    initButtonState:function() {
      var buttonGroup = this.controlView.select("#ButtonGroup");
      var buttonBase = buttonGroup.select("#ButtonBase");
      var buttonText = buttonGroup.selectAll("text");
      var textSpanSet = buttonGroup.selectAll("tspan");

      // value can be string or boolean
      // string
      if (typeof this.model.get("value") === "string") {
        if (this.model.get("value") === "true") {
          buttonBase.attr({fill:"#ffd600"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML =  $.i18n.t("devices.lamp.action.turnOff") ;
          });
        } else {
          buttonBase.attr({fill:"#4300c1"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML = $.i18n.t("devices.lamp.action.turnOn");
          });
        }
        // boolean
      } else {
        if (this.model.get("value")) {
          buttonBase.attr({fill:"#ffd600"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML = $.i18n.t("devices.lamp.action.turnOff");
          });
        } else {
          buttonBase.attr({fill:"#4300c1"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML = $.i18n.t("devices.lamp.action.turnOn");;
          });
        }
      }
    },

    /**
     * Callback to toggle a lamp state
		 */
    onToggleLampButton:function() {
      var buttonGroup = this.controlView.select("#ButtonGroup");
      var buttonBase = buttonGroup.select("#ButtonBase");
      var buttonText = buttonGroup.selectAll("text");
      var textSpanSet = buttonGroup.selectAll("tspan");

      // value can be string or boolean
      // string
      if (typeof this.model.get("value") === "string") {
        if (this.model.get("value") === "true") {
          this.model.set("value", "false");
          buttonBase.attr({fill:"#4300c1"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML = $.i18n.t("devices.lamp.action.turnOn");;
          });
        } else {
          this.model.set("value", "true");
          buttonBase.attr({fill:"#ffd600"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML = $.i18n.t("devices.lamp.action.turnOff");
          });
        }
        // boolean
      } else {
        if (this.model.get("value")) {
          this.model.set("value", "false");
          buttonBase.attr({fill:"#4300c1"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML = $.i18n.t("devices.lamp.action.turnOn");;
          });
        } else {
          this.model.set("value", "true");
          buttonBase.attr({fill:"#ffd600"});
          textSpanSet.forEach(function(tspan){
            tspan.node.innerHTML = $.i18n.t("devices.lamp.action.turnOff");
          });
        }
      }

      // send the message to the backend
      this.model.save();
    },

		/**
		 * Adjust the text size and position inside the view
		 * @param text The Snap.svg text element to adjust
		 */
    adjustText:function(text) {
      var width = (this.w * this.size)/2;
      var height = (this.h * this.size)/8;
      var textBBox = text.getBBox();

      text.transform("t" + this.w*size/10 + "," + this.h*size/10 + "m" + width / textBBox.width  + ", 0, 0, " + height / textBBox.height + ", 0, 0");
    },

		/**
		 * Renders this view
		 */
    render:function() {
      var self = this;
      PhillipsHueCloseView.__super__.render.apply(this, arguments);

      if(!this.controlView) {
        var dt = this.dt;
        var size = this.getViewSize();
        var paper = Snap("#svgspace");
        var group  = paper.g();
        var rect = paper.rect(0.5*dt*size, 0.5*dt*size, size*(this.w-dt),size*(this.h-dt)).attr({fill:this.color,stroke:this.stroke, rx:6, ry:6});
        var text = paper.text(this.w*size/8, this.h*size/2, $.i18n.t(this.model.getProperty("name")));
        this.adjustText(text);

        group.add(rect,text);


        Snap.load("app/img/button.svg", function(f){
          var wrap = f.select("svg");
          var w = wrap.attr("width");
          var h = wrap.attr("height");
          var buttonGroup = f.select("g");
          var width=self.w*size/2, height=self.h*size/8;
          var matrix = ""+width / w +", 0, 0, "+height / h +"," + [self.w*size/4,self.h*size*3/4];
          buttonGroup.transform("m"+matrix);
          buttonGroup.click(function(){
            self.onToggleLampButton();
          });

          group.add(wrap)

          self.initButtonState();

        });

        this.controlView = group;

        this.bgRect.remove();
        this.root.add( this.controlView );
      }

      return this.root;
    },

		/**
		 * Removes all elements generated by this view
		 */
    deletePrimitives:function() {
      PhillipsHueCloseView.__super__.deletePrimitives.apply(this, []);

      if(this.controlView) {
        if(this.controlView.parentNode) {this.controlView.parentNode.removeChild(this.controlView);}
        this.controlView = null;
      }
    },

  });
  // Return the reference to the view
  return PhillipsHueCloseView;
});
