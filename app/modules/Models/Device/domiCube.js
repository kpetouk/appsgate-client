define([
  "app",
  "models/device/device",
  "text!templates/program/nodes/domicubeEventNode.html"

], function(App, Device, EventTemplate) {

  var DomiCube = {};

  /**
   * Implementation of Domicube
   *
   * @class Device.DomiCube
   */
  DomiCube = Device.extend({
    /**
     * @constructor
     */
    initialize: function() {
      DomiCube.__super__.initialize.apply(this, arguments);
    },
        /**
     * return the list of available events
     */
    getEvents: function() {
      return ["Face1", "Face2", "Face3"];
    },
    /**
     * return the keyboard code for a given event
    */
    getKeyboardForEvent: function(evt){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      var v = this.getJSONEvent("mandatory");
      v.source.type = "device";
      v.source.deviceType = "210";
      v.source.value = this.get("id");
      switch(evt) {
        case "Face1":
          $(btn).append("<img src='/app/rsrc/night.png' width='36px'>");
          v.eventName = "newFace";
          v.eventValue = "1";
//          v.phrase = "language.pushed-telec-event-up";
          v.icon = "/app/rsrc/night.png";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "Face2":
          $(btn).append("<img src='/app/rsrc/meal.png' width='36px'>");
          v.eventName = "newFace";
          v.eventValue = "2";
//          v.phrase = "language.pushed-telec-event-up";
          v.icon = "/app/rsrc/meal.png";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "Face3":
          $(btn).append("<img src='/app/rsrc/music.png' width='36px'>");
          v.eventName = "newFace";
          v.eventValue = "3";
//          v.phrase = "language.pushed-telec-event-up";
          v.icon = "/app/rsrc/music.png";
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected event found for DomiCube: " + evt);
          btn = null;
          break;
      }
      return btn;
    },

    /**
     * @returns the action template specific for lamps
     */
    getTemplateAction: function() {
      return _.template(EventTemplate);  
    }
      
  });
  
  return DomiCube;
});
