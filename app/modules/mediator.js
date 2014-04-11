define([
    "app",
    "text!templates/program/nodes/actionNode.html",
    "modules/grammar",

], function(App, actionNodeTemplate, Grammar) {

    var ProgramMediator = {};
    // router
    ProgramMediator = Backbone.Model.extend({
        tplActionNode: _.template(actionNodeTemplate),
        initialize: function() {
            this.programJSON = {"iid":0};
            this.currentNode = 0;
            this.maxNodeId = 0;
            this.Grammar = new Grammar();
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
            if (curNode.iid == pos) {
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
            return {"type":"action", "methodName":name, "target":{"iid" : tarId, "type": "empty" }, "args":[],  "iid" : actId, "phrase": phrase};
            
        },
        
        getDevice: function(deviceId) {
            var deviceName = devices.get(deviceId).get("name");
            var tarId = this.maxNodeId++;
            return {"type": "device", "value": deviceId, "name":deviceName, "iid" : tarId};
        },

        
        buildActionKeys: function() {
            var types = devices.getDevicesByType();
            for (type in types) {
                if (types[type].length > 0) {
                    o = types[type][0];
                    actions = o.getActions();
                    for(a in o.getActions()) {
                        $(".expected-elements").append(o.getKeyboardForAction(actions[a]));
                    }
                }
            }
            
        },
        
        buildInstKeys: function() {
            this.keyboard.append("<button class='btn btn-default btn-keyboard if-node'><span>Si<span></button>");
        },
        
        buildDevices: function() {
            devices.forEach(function(device) {
                if (device.get("type") != 21) {
                    $(".expected-elements").append(device.buildButtonFromDevice());
                }
            });
            
        },
        
        buildKeyboard: function() {
            this.buildActionKeys();
        },
        buildInputFromJSON: function() {
            this.checkProgram();
            switch (this.programJSON.type) {
                case "action":
                    $(".programInput").html(this.tplActionNode(this.programJSON));
                    break;
            }
        },
        checkProgram: function() {
            $(".expected-elements").html("");
            var n = this.Grammar.parse(this.programJSON);
            if (n == null) {
                console.log("Program is correct");
            } else {
                console.warn("Invalid at " + n.id);
                this.buildDevices();
            }
        }

    });
    return ProgramMediator;
});