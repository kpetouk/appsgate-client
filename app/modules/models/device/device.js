define([
    "app",
    "models/brick",
    "text!templates/program/nodes/defaultActionNode.html",

], function(App, Brick, ActionTemplate) {

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
            var self = this;

            // when a name is updated, update the grammar
            /*this.on("change:name", function() {
                delete window.grammar;
                window.grammar = new Grammar();
            });*/

            // each device listens to the event whose id corresponds to its own id. This ensures to
            // receive only relevant events
            dispatcher.on(this.get("id"), function(updatedVariableJSON) {
                self.set(updatedVariableJSON.varName, updatedVariableJSON.value);
            });
        },
        /**
         * Send the name of the device to the server
         */
        sendName: function() {
            // build the message
            var messageJSON = {
                method: "setUserObjectName",
                args: [
                    {type: "String", value: this.get("id")},
                    {type: "String", value: ""},
                    {type: "String", value: this.get("name")}
                ]
            };

            // send the message
            communicator.sendMessage(messageJSON);
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
         * return the list of available properties (only those returning a boolean)
         */
        getBooleanProperties: function() {
            return [];
        },            
        /**
         * return the list of available properties
         */
        getProperties: function() {
            return [];
        },
        /**
         * return the keyboard code for a given property
        */
        getKeyboardForProperty: function(property) {
          console.error("No property has been defined for this device.");
          return "";
        },
        /**
         * default method to build a button with its name as the name of the button
         */
        buildButtonFromDevice: function() {
            return "<button id='" + this.get("id") + "' class='btn btn-default btn-keyboard device-node'><span>" + this.get("name") + "<span></button>"
        },

        getJSONAction: function (type) {
            return {"type": "action", "target": {"iid": "X", "type": 'mandatory', "deviceType":this.get("type")}, "args": [], "iid": "X"};
        },
        
        getJSONEvent: function (type) {
            return {"type": "event",  "source": {"iid": "X", "type": 'mandatory', "deviceType":this.get("type")}, "iid": "X"};
        },
        getJSONState: function (type) {
            return {"type": "state", "object": {"iid": "X", "type": 'mandatory', "deviceType":this.get("type")}, "iid": "X"};
        },
        getJSONProperty: function (type) {
            return {"type": "deviceState", "iid": "X", "target": {"iid": "X", "type": 'mandatory', "deviceType":this.get("type")}, "args":[]};
        },

        /**
         * @returns the default template action
         */
        getTemplateAction: function() {
            return _.template(ActionTemplate); 
        },
        /**
         * Override its synchronization method to send a notification on the network
         */
        sync: function(method, model) {
            if (model.changedAttributes()) {
                switch (method) {
                    case "update":
                        _.keys(model.changedAttributes()).forEach(function(attribute) {
                            if (attribute === "name") {
                                model.sendName();
                            } else if (attribute === "plugState") {
                                model.sendPlugState();
                            } else if (attribute === "value" && (model.get("type") === "7" || model.get("type") === 7)) {
                                model.sendValue();
                            } else if (attribute === "value" && (model.get("type") === "8" || model.get("type") === 8)) {
                                model.sendValue();
                            } else if (attribute === "color" && (model.get("type") === "7" || model.get("type") === 7)) {
                                model.sendColor();
                            } else if (attribute === "saturation" && (model.get("type") === "7" || model.get("type") === 7)) {
                                model.sendSaturation();
                            } else if (attribute === "brightness" && (model.get("type") === "7" || model.get("type") === 7)) {
                                model.sendBrightness();
                            } else if ((attribute === "hour" || attribute === "minute") && (model.get("type") === "21" || model.get("type") === 21)) {
                                model.sendTimeInMillis();
                            } else if (attribute === "flowRate" && (model.get("type") === "21" || model.get("type") === 21)) {
                                model.sendTimeFlowRate();
                            }
                        });
                        break;
                    default:
                        break;
                }
            }
        }

    });
    return Device;
});
