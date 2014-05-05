define([
  "app",
  "models/brick"
], function(App, Brick) {

  var Service = {};

  /**
   * Abstract class regrouping common characteristics shared by all the devices
   *
   * @class Device.Model
   */
  Service = Brick.extend({

    /**
     * @constructor 
     */
    initialize: function() {
      Service.__super__.initialize.apply(this, arguments);

      var self = this;

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
        objectId: this.get("id"),
        method		: method,
        args		: args
      };

      if (typeof callId !== "undefined") {
        messageJSON.callId = callId;
      }

      // send the message
      communicator.sendMessage(messageJSON);
    },

  });
  return Service;
});
