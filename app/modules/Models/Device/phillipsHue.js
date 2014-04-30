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
      return ["switchOn", "switchOff", "blink"];
    },
    /**
     * return the keyboard code for a given action
     */
    getKeyboardForAction: function(act){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      switch(act) {
        case "switchOn":
          $(btn).append("<span data-i18n='keyboard.turn-on-lamp-action'/>");
          var v = {"type": "action", "methodName":"setWhite", "target": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "args": [], "iid": "X", "phrase": "language.turn-on-lamp-action"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "switchOff":
          $(btn).append("<span data-i18n='keyboard.turn-off-lamp-action'/>");
          var v = {"type": "action", "methodName":"Off", "target": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "args": [], "iid": "X", "phrase": "language.turn-off-lamp-action"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "blink":
          $(btn).append("<span data-i18n='devices.lamp.action.blink'/>");
          var v = {"type": "action", "methodName":"blink", "target": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "args": [], "iid": "X", "phrase": "language.blink-lamp-action"};
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
          $(btn).append("<span data-i18n='keyboard.is-turned-on-lamp-event'><span>");
          var v = {"type": "event", "eventName": "state", "source": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "eventValue": "true", "iid": "X", "phrase": "language.turned-on-lamp-event"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "switchOff":
          $(btn).append("<span data-i18n='keyboard.is-turned-off-lamp-event'><span>");
          var v = {"type": "event", "eventName": "state", "source": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "eventValue": "false", "iid": "X", "phrase": "language.turned-off-lamp-event"};
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
          $(btn).append("<span data-i18n='keyboard.is-turned-on-lamp-state'><span>");
          var v = {"type": "state", "name": "isOn", "object": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "iid": "X", "phrase": "language.is-turned-on-lamp-status"};
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "isOff":
          $(btn).append("<span data-i18n='keyboard.is-turned-off-lamp-state'><span>");
          var v = {"type": "state", "name": "isOff", "object": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "iid": "X", "phrase": "language.is-turned-off-lamp-status"};
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
      var v = {"type": "deviceState", "iid": "X", "target": {"iid": "X", "type": "mandatory", "deviceType":"7"}, "args":[]};
      switch(state) {
        case "isOn":
          $(btn).append("<span data-i18n='keyboard.is-turned-on-lamp-state'><span>");
          v.methodName = "getCurrentState";
          v.returnType = "boolean";
          v.phrase = "language.is-turned-on-lamp-status";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "getBrightness":
          $(btn).append("<span data-i18n='keyboard.light-brightness'><span>");
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
