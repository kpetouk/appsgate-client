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
      return ["opened","closed"];
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

        /**
     * return the list of available states
     */
    getStates: function() {
      return ["opened","closed"];
    },
    /**
     * return the keyboard code for a given state
    */
    getKeyboardForState: function(state){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      switch(state) {
        case "opened":
          $(btn).append("<span>la porte est ouverte<span>");
          var v = {"type": "state", "name": "isOpened", "object": {"iid": "X", "type": "mandatory"}, "iid": "X", "phrase": " est ouverte"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "closed":
          $(btn).append("<span>la porte est fermée<span>");
          var v = {"type": "state", "name": "isOpened", "object": {"iid": "X", "type": "mandatory"}, "iid": "X", "phrase": " est fermée"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected state found for Contact Sensor: " + state);
          btn = null;
          break;
      }
      return btn;
    },

    
    
  });
  return ContactSensor;
});
