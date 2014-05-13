define([
    "app",
    "models/brick",
    "text!templates/program/nodes/defaultActionNode.html",
], function(App, Brick, ActionTemplate) {

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

            // each device listens to the event whose id corresponds to its own id. This ensures to
            // receive only relevant events
            dispatcher.on(this.get("id"), function(updatedVariableJSON) {
                if(typeof updatedVariableJSON.varName === "undefined" && updatedVariableJSON.value.indexOf("DIDL-Lite") !== -1){
                    dispatcher.trigger("mediaBrowserResults", updatedVariableJSON.value);
                }
                else{
                    self.set(updatedVariableJSON.varName, updatedVariableJSON.value);
                }
            });
        },
        
        /**
         * return the list of available actions
         */
        getActions: function() {
            return [];
        },
        /**
         * return the keyboard code for a given action
        */
        getKeyboardForAction: function(act){
            console.error("No action has been defined for this device.");
            return "";
        },
        /**
         * return the list of available events
         */
        getEvents: function() {
            return [];
        },
        /**
         * return the keyboard code for a given event
        */
        getKeyboardForEvent: function(evt){
            console.error("No event has been defined for this device.");
            return "";
        },
        /**
         * return the list of available states
         */
        getStates: function() {
            return [];
        },
        /**
         * return the keyboard code for a given state
        */
        getKeyboardForState: function(state){
            console.error("No state has been defined for this device.");
            return "";
        },
        /**
         * return the list of available device states
         */
        getDeviceStates: function() {
            return [];
        },
        /**
         * return the keyboard code for a given state
        */
        getKeyboardForDeviceState: function(state) {
          console.error("No device state has been defined for this device.");
          return "";
        },
        /**
         * default method to build a button with its name as the name of the button
         */
        buildButtonFromBrick: function() {
            return "<button id='" + this.get("id") + "' class='btn btn-default btn-keyboard service-node'><span>" + this.get("name") + "<span></button>"
        },
        getJSONAction: function (type) {
            return {"type": "action", "target": {"iid": "X", "type": 'mandatory', "serviceType":this.get("type")}, "args": [], "iid": "X"};
        },
        
        getJSONEvent: function (type) {
            return {"type": "event",  "source": {"iid": "X", "type": 'mandatory', "serviceType":this.get("type")}, "iid": "X"};
        },
        getJSONState: function (type) {
            return {"type": "state", "object": {"iid": "X", "type": 'mandatory', "serviceType":this.get("type")}, "iid": "X"};
        },
        getJSONServiceState: function (type) {
            return {"type": "deviceState", "iid": "X", "target": {"iid": "X", "type": 'mandatory', "serviceType":this.get("type")}, "args":[]};
        },
        /**
         * Send a message to the server to perform a remote call
         * 
         * @param method Remote method name to call
         * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
         */
        remoteControl: function(method, args, callId) {
            // build the message
            var messageJSON = {
                targetType: "1",
                objectId: this.get("id"),
                method: method,
                args: args
            };

            if (typeof callId !== "undefined") {
                messageJSON.callId = callId;
            }

            // send the message
            communicator.sendMessage(messageJSON);
        },
		/**
     * @returns the action template specific for lamps
     */
    getTemplateAction: function() {
      return _.template(ActionTemplate);  
    },

    });
    return Service;
});
