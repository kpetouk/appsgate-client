define([
  "app",
  "models/device/device"
], function(App, Device) {

  var SwitchSensor = {};

  /**
   * Implementation of switch sensor
   * Specific attributes are:
   *      switchNumber. Values are depend of the type of the switch
   *      buttonStatus, 0 when Off, 1 when On
   *
   * @class Device.SwitchSensor
   */
  SwitchSensor = Device.extend({
    /**
     * @constructor
     */
    initialize: function() {
      SwitchSensor.__super__.initialize.apply(this, arguments);
    },
        /**
     * return the list of available events
     */
    getEvents: function() {
      return ["switchUp", "switchBottom"];
    },
    /**
     * return the keyboard code for a given event
    */
    getKeyboardForEvent: function(evt){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      switch(evt) {
        case "switchUp":
          $(btn).append("<span>Le bouton du haut est clique<span>");
          var v = {"type": "event", "eventName": "switchNumber", "source": {"iid": "X", "type": "empty"}, "eventValue": "1", "iid": "X", "phrase": "le bouton haut est clique"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "switchBottom":
          $(btn).append("<span>Le bouton du bas est clique<span>");
          var v = {"type": "event", "eventName": "switchNumber", "source": {"iid": "X", "type": "empty"}, "eventValue": "1", "iid": "X", "phrase": "le bouton bas est clique"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected event found for SwitchSensor: " + evt);
          btn = null;
          break;
      }
      return btn;
    },

  });
  
  return SwitchSensor;
});
