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
      switch(evt) {
        case "opened":
          $(btn).append("<span data-i18n='devices.contact.event.opened'/>");
          var v = {"type": "event", "eventName": "contact", "source": {"iid": "X", "type": "mandatory"}, "eventValue": "false", "iid": "X", "phrase":  "on ouvre" }; // TODO, use internationalization
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "closed":
          $(btn).append("<span data-i18n='devices.contact.event.closed'/>");
          var v = {"type": "event", "eventName": "contact", "source": {"iid": "X", "type": "mandatory"}, "eventValue": "true", "iid": "X", "phrase": "on ferme" }; // TODO, use internationalization
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
