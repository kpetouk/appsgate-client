define([
  "app",
  "models/device/device"
], function(App, Device) {

  var ContactSensor = {};
  /**
   * Implementation of a Contact sensor
   * @class Device.ContactSensor
   */
  ContactSensor = Device.extend({
    /**
     * @constructor
     */
    initialize: function() {
      ContactSensor.__super__.initialize.apply(this, arguments);
    },
    
    
     /**
     * return the list of available events
     */
    getEvents: function() {
      return ["opened",'closed'];
    },
    /**
     * return the keyboard code for a given event
    */
    getKeyboardForEvent: function(evt){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      var v = this.getJSONEvent("mandatory");
      switch(evt) {
        case "opened":
          $(btn).append("<span data-i18n='devices.contact.event.opened'/>");
          v.eventName = "contact";
          v.eventValue = "false";
          v.phrase = "devices.contact.event.opened";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "closed":
          $(btn).append("<span data-i18n='devices.contact.event.closed'/>");
          v.eventName = "contact";
          v.eventValue = "true";
          v.phrase = "devices.contact.event.closed";
          $(btn).attr("json", JSON.stringify(v));
          break;          
        default:
          console.error("unexpected event found for Contact Sensor: " + evt);
          btn = null;
          break;
      }
      return btn;
    },
    
    
  });
  return ContactSensor;
});
