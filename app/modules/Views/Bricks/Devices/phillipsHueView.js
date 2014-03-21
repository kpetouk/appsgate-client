define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var PhillipsHueView = {};

  /**
	 * Class of a default view of a Phillips Hue Lamp
	 */
  PhillipsHueView = DeviceView.extend({

		/**
		 * constructor
		 */
    initialize:function(){
			PhillipsHueView.__super__.initialize.apply(this, arguments);
			this.name = "PhillipsHueView";
    },
		
		 /**
     * Callback to toggle a lamp state
     */
    onClickView:function() {
			if (this.dragged) return false;
			var imgPath = null;
      // value can be string or boolean
      // string
      if (typeof this.model.get("value") === "string") {
        if (this.model.get("value") === "true") {
          this.model.set("value", "false");
					imgPath	= "app/img/HueOff.png";
					
        } else {
          this.model.set("value", "true");
					imgPath = "app/img/HueOn.png";

        }
        // boolean
      } else {
        if (this.model.get("value")) {
          this.model.set("value", "false");
					imgPath	= "app/img/HueOff.png";
        } else {
          this.model.set("value", "true");
					imgPath = "app/img/HueOn.png";

        }
      }
			
			this.icon.attr({href:imgPath});
      // send the message to the backend
      this.model.save();
    },
		
		render:function() {
      PhillipsHueView.__super__.render.apply(this, arguments);

      var self = this;


      var dt = this.dt;
      var size = this.getViewSize();
      var viewWidth = size*(this.w-dt);
      var viewHeight = size*(this.h-dt);
      var paper = Snap("#svgspace");
      var text = paper.text(0,0,$.i18n.t(self.model.getProperty("name")));
      text.transform("m" + (viewWidth/2) / text.getBBox().width  + ", 0, 0, " + (viewHeight/10) / text.getBBox().height + "," + viewWidth/5 + "," + viewHeight);

      var iconWidth = viewWidth-viewWidth/5;
      var iconHeight = viewHeight-viewHeight/5;
      var iconX = 1.5*(viewWidth/2 - iconWidth/2);
      var iconY = viewWidth/2 - iconWidth/2;
			var imgPath = null;
			if(typeof this.model.get("value") === "string") {
				if(this.model.get("value") === "true") {
					imgPath = "app/img/HueOn.png";
				}
				else {
					imgPath	= "app/img/HueOff.png";
				}
			}
			else{
				if(this.model.get("value")){
					imgPath = "app/img/HueOn.png";
				}
				else {
					imgPath = "app/img/HueOn.png";
				}
			}
      this.icon = paper.image(imgPath, iconX, iconY, iconWidth, iconHeight);
      this.gView.add(text, this.icon);

      this.gView.click(function(){
        self.onClickView();
      });

      return this.root;
    },

  });
  // Return the reference to the PresoMediaRenderer constructor
  return PhillipsHueView;
});
