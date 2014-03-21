define( [
  "app",
  "views/bricks/devices/deviceview"
], function(App, DeviceView) {

  var PlugView = {};

  /**
   * Class of a default view of smart plug
   */
  PlugView = DeviceView.extend({

    /**
     * constructor
     */
    initialize:function(){

      PlugView.__super__.initialize.apply(this, arguments);

    },

    /**
     * Callback to toggle a lamp state
     */
    onClickView:function() {
			if (this.dragged) return false;
      // value can be string or boolean
      // string
      if (typeof this.model.get("plugState") === "string") {
        if (this.model.get("plugState") === "true") {
          this.model.set("plugState", "false");
        } else {
          this.model.set("plugState", "true");
        }
        // boolean
      } else {
        if (this.model.get("plugState")) {
          this.model.set("plugState", "false");
        } else {
          this.model.set("plugState", "true");
        }
      }

      // send the message to the backend
      this.model.save();
    },

    render:function() {
      PlugView.__super__.render.apply(this, arguments);

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
      var icon = paper.image("app/img/sensors/plug.jpg", iconX, iconY, iconWidth, iconHeight);
      this.gView.add(text, icon);

      this.gView.click(function(){
        self.onClickView();
      });

      return this.root;
    },

  });
  // Return the reference to the PlugView
  return PlugView;
});
