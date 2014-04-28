define([
  "app",
  "models/device/device"
], function(App, Device) {

  var PhillipsHue = {};

  /**
   * Implementation of the Phillips Hue lamp
   * 
   * @class Device.PhillipsHue
   */
  PhillipsHue = Device.extend({
    /**
     * @constructor
     */
    initialize: function() {
      PhillipsHue.__super__.initialize.apply(this, arguments);
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
          $(btn).append("<span>Allumer<span>");
          var v = {"type": "action", "methodName":"setWhite", "target": {"iid": "X", "type": "mandatory"}, "args": [], "iid": "X", "phrase": "Allumer"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "switchOff":
          $(btn).append("<span>Eteindre<span>");
          var v = {"type": "action", "methodName":"Off", "target": {"iid": "X", "type": "mandatory"}, "args": [], "iid": "X", "phrase": "Eteindre"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected action found for PhilipsHue: " + act);
          btn = null;
          break;
      }
      return btn;
    },
    /**
     * return the list of available events
     */
    getEvents: function() {
      return ["switchOn", "switchOff"];
    },
    /**
     * return the keyboard code for a given event
    */
    getKeyboardForEvent: function(evt){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      switch(evt) {
        case "switchOn":
          $(btn).append("<span>on allume la lampe<span>");
          var v = {"type": "event", "eventName": "state", "source": {"iid": "X", "type": "mandatory"}, "eventValue": "true", "iid": "X", "phrase": "on allume "};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "switchOff":
          $(btn).append("<span>on eteint la lampe<span>");
          var v = {"type": "event", "eventName": "state", "source": {"iid": "X", "type": "mandatory"}, "eventValue": "false", "iid": "X", "phrase": "on eteint "};
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected event found for PhilipsHue: " + evt);
          btn = null;
          break;
      }
      return btn;
    },

        /**
     * return the list of available states
     */
    getStates: function() {
      return ["isOn", "isOff"];
    },
    /**
     * return the keyboard code for a given state
    */
    getKeyboardForState: function(state){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      switch(state) {
        case "isOn":
          $(btn).append("<span>La lampe est allumee<span>");
          var v = {"type": "state", "name": "isOn", "object": {"iid": "X", "type": "mandatory"}, "iid": "X", "phrase": " est allumee"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "isOff":
          $(btn).append("<span>La lampe est eteinte<span>");
          var v = {"type": "state", "name": "isOff", "object": {"iid": "X", "type": "mandatory"}, "iid": "X", "phrase": " est eteinte"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected state found for PhilipsHue: " + state);
          btn = null;
          break;
      }
      return btn;
    },

    /**
     * return the list of available device states
     */
    getDeviceStates: function() {
      return ["isOn", "getBrightness"];
    },
    /**
     * return the keyboard code for a given state
     */
    getKeyboardForDeviceState: function(state) {
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      var v = {"type": "deviceState", "iid": "X", "target": {"iid": "X", "type": "mandatory"}, "args":[]};
      switch(state) {
        case "isOn":
          $(btn).append("<span>La lampe est allumee<span>");
          v.methodName = "getCurrentState";
          v.returnType = "boolean";
          v.phrase = " est allumee";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "getBrightness":
          $(btn).append("<span>l'intensite<span>");
          v.methodName = "getLightBrightness";
          v.returnType = "number";
          v.phrase = " brille";
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected device state found for PhilipsHue: " + state);
          btn = null;
          break;
      }
      return btn;
    },

    /**
     * Send a message to the backend to update the attribute value
     */
    sendValue:function() {
      if (this.get("value") === "true") {
        this.remoteControl("On", []);
      } else {
        this.remoteControl("Off", []);
      }
    },

    /**
     * Send a message to the backend to update the attribute color
     */
    sendColor:function() {
      this.remoteControl("setColor", [{ type : "long", value : this.get("color") }], this.id);
    },

    /**
     * Send a message to the backend to update the attribute saturation
     */
    sendSaturation:function() {
      this.remoteControl("setSaturation", [{ type : "int", value : this.get("saturation") }], this.id);
    },
    
    /**
     * Send a message to the backend to update the attribute brightness
     */
    sendBrightness:function() {
      this.remoteControl("setBrightness", [{ type : "long", value : this.get("brightness") }], this.id);
    }
  });
  return PhillipsHue;
});
