define([
  "app",
  "models/device/device"
], function(App, Device) {

  var Plug = {};
  /**
   * @class Device.Plug
   */
  Plug = Device.extend({
    /**
     * @constructor
     */
    initialize:function() {
      Plug.__super__.initialize.apply(this, arguments);
    },
    /**
     *return the list of available actions
     */
    getActions: function() {
      return ["switchOn", "switchOff"];
    },
    /**
     * return the keyboard code for a given action
     */
    getKeyboardForAction: function(act){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      switch(act) {
        case "switchOn":
          $(btn).append("<span>Ouvrir<span>");
          $(btn).attr("json", '{"type": "action", "methodName":"on", "target": {"iid": "X", "type": "empty"}, "args": [], "iid": "X", "phrase": "Ouvrir"}');
          break;
        case "switchOff":
          $(btn).append("<span>Fermer<span>");
          $(btn).attr("json", '{"type": "action", "methodName":"off", "target": {"iid": "X", "type": "empty"}, "args": [], "iid": "X", "phrase": "Fermer"}');
          break;
        default:
          console.error("unexpected action found for PhilipsHue: " + act);
          btn = null;
          break;
      }
      return btn;
    },

    /**
     * Send a message to the backend to update the attribute plugState
     */
    sendPlugState:function() {
      if (this.get("plugState") === "true") {
        this.remoteControl("on", []);
      } else {
        this.remoteControl("off", []);
      }
    }
  });
  return Plug;
});
