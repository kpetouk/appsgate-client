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
      switch(act) {
        case "switchOn":
          return "<button class='btn btn-default btn-keyboard switch-on-node'><span>Allumer<span></button>";
          break;
        case "switchOff":
          return "<button class='btn btn-default btn-keyboard switch-off-node'><span>Eteindre<span></button>";
          break;
        default:
          console.error("unexpected action found for PhilipsHue: " + act);
          break;
      }
      return "";
    },
    /**
     * return the list of available actions
     */
    getEvents: function() {
      return ["switchOn", "switchOff"];
    },
    /**
     * return the keyboard code for a given action
    */
    getKeyboardForEvent: function(evt){
      switch(evt) {
        case "switchOn":
          return "<button class='btn btn-default btn-keyboard light-on-node'><span>La lampe s'allume<span></button>";
          break;
        case "switchOff":
          return "<button class='btn btn-default btn-keyboard light-off-node'><span>La lampe s'eteint<span></button>";
          break;
        default:
          console.error("unexpected event found for PhilipsHue: " + evt);
          break;
      }
      return "";
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
