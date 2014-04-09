define([
    "app",
    "text!templates/program/nodes/actionNode.html"
], function(App, actionNodeTemplate) {

    var ProgramMediator = {};
    // router
    ProgramMediator = Backbone.Model.extend({
        tplActionNode: _.template(actionNodeTemplate),
        initialize: function() {
            this.programJSON = {"iid":0};
            this.currentNode = 0;
            this.maxNodeId = 0;
        },
        setCurrentPos: function(id) {
            this.currentNode = id;
        },
        buttonPressed: function(button) {
            if ($(button).hasClass("switch-on-node")) {
                this.appendNode( this.getActionNode("On", "Allumer"), this.currentNode);
            }
            else if ($(button).hasClass("switch-off-node")) {
                 this.appendNode( this.getActionNode("Off", "Eteindre"), this.currentNode);

            }
            else if ($(button).hasClass("device-node")) {
                this.appendNode(this.getDevice(button.id), this.currentNode);
            }
            this.buildInputFromJSON();
        },
        appendNode: function(node, pos) {
            this.programJSON = this.recursivelyAppend(node, pos, this.programJSON);
        },
        recursivelyAppend: function(nodeToAppend, pos, curNode) {
            console.log("try to append" + nodeToAppend + ":" + pos + ":" +curNode);
            if (curNode.iid == pos) {
                console.log("Node updated");
                curNode = nodeToAppend;
            } else {
                for (var o in curNode) {
                    if (typeof curNode[o] === "object") {
                        curNode[o] = this.recursivelyAppend(nodeToAppend, pos, curNode[o]);
                    }
                }
            }
            return curNode;
        },
        getActionNode: function (name, phrase) {
            var actId = this.maxNodeId + 1;
            var tarId = this.maxNodeId + 2;
            this.maxNodeId+=2;
            return {"type":"action", "methodName":name, "args":[], "target":{"iid" : tarId }, "iid" : actId, "phrase": phrase};
            
        },
        
        getDevice: function(deviceId) {
            var deviceName = devices.get(deviceId).get("name");
            var tarId = this.maxNodeId++;
            return {"type": "device", "value": deviceId, "name":deviceName, "iid" : tarId};
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
            console.log(this.programJSON);
            switch (this.programJSON.type) {
                case "action":
                    $(".programInput").html(this.tplActionNode(this.programJSON));
                    break;
            }
        }

    });
    return ProgramMediator;
});