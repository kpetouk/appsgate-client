define([
  "app",
	"models/device/device"
], function(App, Device) {

	var MediaBrowser = {};

/**
 * Implementation of the UPnP media browser
 *
 * @class Device.MediaBrowser
 */
  MediaBrowser = Device.extend({
    /**
     * @constructor
     */
    initialize:function() {
      MediaBrowser.__super__.initialize.apply(this,arguments);
    },
  });
	return MediaBrowser;
});
