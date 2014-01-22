define([
  "app",
	"models/device/device"
], function(App, Device) {

	var ContactSensor = {};
/**
 * @class Device.ContactSensor
 */
 ContactSensor = Device.extend({
    /**
     * @constructor
     */
    initialize: function() {
      ContactSensor.__super__.initialize.apply(this, arguments);
    }
  });
	return ContactSensor;
});
