define([
  "app",
  "models/brick"
], function(App, Brick) {

  var Device = {};

  /**
   * Abstract class regrouping common characteristics shared by all the devices
   *
   * @class Device.Model
   */
  Device = Brick.extend({

    /**
     * @constructor 
     */
    initialize: function() {
      Device.__super__.initialize.apply(this, arguments);

      var self = this;

      // each device listens to the event whose id corresponds to its own id. This ensures to
      // receive only relevant events
      dispatcher.on(this.getProperty("ref"), function(updatedVariableJSON) {
        self.set(updatedVariableJSON.varName, updatedVariableJSON.value);
      });
    },

    /**
     * Send a message to the server to perform a remote call
     * 
     * @param method Remote method name to call
     * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
     */
    remoteControl:function(method, args, callId) {
      // build the message
      var messageJSON = {
        targetType	: "1",
        objectId	: this.getProperty("ref"),
        method		: method,
        args		: args
      };

      if (typeof callId !== "undefined") {
        messageJSON.callId = callId;
      }

      // send the message
      communicator.sendMessage(messageJSON);
    },


    /**
     * Override its synchronization method to send a notification on the network
     */
    sync:function(method, model) {
			var args = arguments;
      if (method == "update" && model.changedAttributes()) {
        _.keys(model.changedAttributes()).forEach(function(attribute) {
          if (attribute === "name") {
            model.sendName();
          } else if (attribute === "plugState") {
            model.sendPlugState();
          } else if (attribute === "value" && (model.getProperty("deviceType") === "7" || model.getProperty("deviceType") === 7)) {
            model.sendValue();
          } else if (attribute === "value" && (model.getProperty("deviceType") === "8" || model.getProperty("deviceType") === 8)) {
            model.sendValue();
          } else if (attribute === "color" && (model.getProperty("deviceType") === "7" || model.getProperty("deviceType") === 7)) {
            model.sendColor();
          } else if (attribute === "saturation" && (model.getProperty("deviceType") === "7" || model.getProperty("deviceType") === 7)) {
            model.sendSaturation();
          } else if (attribute === "brightness" && (model.getProperty("deviceType") === "7" || model.getProperty("deviceType") === 7)) {
            model.sendBrightness();
          } else if ((attribute === "hour" || attribute === "minute") && (model.getProperty("deviceType") === "21" || model.getProperty("deviceType") === 21)) {
            model.sendTimeInMillis();
          } else if (attribute === "flowRate" && (model.getProperty("deviceType") === "21" || model.getProperty("deviceType") === 21)) {
            model.sendTimeFlowRate();
          }  else {
            Device.__super__.sync.apply(model,args);
          }

        });
      }
      else {
        Device.__super__.sync.apply(model,arguments);
      }
    }


  });
  return Device;
});
