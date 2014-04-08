define([
    "app",
    "text!templates/program/nodes/actionNode.html"
], function(App, actionNodeTemplate) {

    var ProgramMediator = {};
    // router
    ProgramMediator = Backbone.Model.extend({
        tplActionNode: _.template(actionNodeTemplate),
        initialize: function() {
            this.programJSON = {};
        },
        buttonPressed: function(button) {
            while (button !== null && typeof button.classList === 'undefined' || !button.classList.contains('btn-keyboard')) {
                button = button.parentNode;
            }
            if ($(button).hasClass("switch-on-node")) {
                this.appendSwitchOn();
            }
            else if ($(button).hasClass("switch-off-node")) {
                this.appendSwitchOff();
            }
            else if ($(button).hasClass("device-node")) {
                this.appendDevice(button.id);
            }
            this.buildInputFromJSON();
        },
        appendSwitchOn: function() {
            console.log("Switch on button pressed");
            this.programJSON.type = "action";
            this.programJSON.methodName = "On";
            this.programJSON.args = [];
            console.log(this.programJSON);
            console.log(JSON.stringify(this.programJSON));
        },
        appendSwitchOff: function() {
            console.log("Switch on button pressed");
            this.programJSON.type = "action";
            this.programJSON.methodName = "Off";
            this.programJSON.args = [];
            console.log(this.programJSON);
            console.log(JSON.stringify(this.programJSON));
        },
        appendDevice: function(deviceId) {
            console.log("Device: " + deviceId + " button pressed");
            var deviceName = devices.get(deviceId).get("name");
            this.programJSON.target = {"type": "device", "value": deviceId, "name":deviceName};
            console.log(this.programJSON);
            console.log(JSON.stringify(this.programJSON));
        },
        buildKeyboard: function() {
            $(".expected-elements").append("<button class='btn btn-default btn-keyboard switch-on-node'><span>Allumer<span></button>");
            $(".expected-elements").append("<button class='btn btn-default btn-keyboard switch-off-node'><span>Eteindre<span></button>");
            var types = devices.getDevicesByType();
            devices.forEach(function(device) {
                if (device.get("type") != 21) {
                    $(".expected-elements").append("<button id='" + device.get("id") + "' class='btn btn-default btn-keyboard device-node'><span>" + device.get("name") + "<span></button>");
                }
            });
        },
        buildInputFromJSON: function() {
            switch (this.programJSON.type) {
                case "action":
                    $(".programInput").html(this.tplActionNode({
                        actionName: this.programJSON.methodName,
                        target: this.programJSON.target,
                    }));
                    break;
            }
        }

    });
    return ProgramMediator;
});