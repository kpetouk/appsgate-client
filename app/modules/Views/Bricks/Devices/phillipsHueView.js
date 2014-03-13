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

  });
  // Return the reference to the PresoMediaRenderer constructor
  return PhillipsHueView;
});
