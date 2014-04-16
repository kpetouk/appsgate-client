define([
    "app",
    "modules/grammar",
    "text!templates/program/nodes/actionNode.html",
    "text!templates/program/nodes/ifNode.html",
    "text!templates/program/nodes/whenNode.html",
    "text!templates/program/nodes/deviceNode.html",
    "text!templates/program/nodes/eventNode.html",
    "text!templates/program/nodes/whitespaceNode.html"
], function(App, Grammar, actionNodeTemplate, ifNodeTemplate, whenNodeTemplate, deviceNodeTemplate, eventNodeTemplate, whitespaceNodeTemplate) {

    var ProgramMediator = {};
    // router
    ProgramMediator = Backbone.Model.extend({
        tplActionNode: _.template(actionNodeTemplate),
        tplIfNode: _.template(ifNodeTemplate),
        tplWhenNode: _.template(whenNodeTemplate),
        tplDeviceNode: _.template(deviceNodeTemplate),
        tplEventNode: _.template(eventNodeTemplate),
        tplWhiteSpaceNode: _.template(whitespaceNodeTemplate),
        initialize: function() {
            this.programJSON = {"iid": 0, type: "empty"};
            this.currentNode = 0;
            this.maxNodeId = 0;
            this.Grammar = new Grammar();
        },
        setCurrentPos: function(id) {
            this.currentNode = id;
        },
        buttonPressed: function(button) {
            if ($(button).hasClass("switch-on-node")) {
                this.appendNode(this.getActionJSON("On", "Allumer"), this.currentNode);
            }
            else if ($(button).hasClass("switch-off-node")) {
                this.appendNode(this.getActionJSON("Off", "Eteindre"), this.currentNode);
            }
            else if ($(button).hasClass("device-node")) {
                this.appendNode(this.getDeviceJSON(button.id), this.currentNode);
            } else if ($(button).hasClass("if-node")) {
                this.appendNode(this.getIfJSON(), this.currentNode);

            } else if ($(button).hasClass("when-node")) {
                this.appendNode(this.getWhenJSON(), this.currentNode);

            } else if ($(button).hasClass("light-on-node")) {
                this.appendNode(this.getEventJSON("state", "la lampe s'allume", "true"), this.currentNode);

            } else if ($(button).hasClass("light-off-node")) {
                this.appendNode(this.getEventJSON("state", "la lampe s'�teint", "false"), this.currentNode);
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
        getActionJSON: function(name, phrase) {
            var actId = this.maxNodeId + 1;
            var tarId = this.maxNodeId + 2;
            this.maxNodeId += 2;
            return {"type": "action", "methodName": name, "target": {"iid": tarId, "type": "empty"}, "args": [], "iid": actId, "phrase": phrase};
        },
        getEventJSON: function(name, phrase, value) {
            var actId = this.maxNodeId + 1;
            var tarId = this.maxNodeId + 2;
            this.maxNodeId += 2;
            return {"type": "event", "eventName": name, "source": {"iid": tarId, "type": "empty"}, "eventValue": value, "iid": actId, "phrase": phrase};
        },
        getDeviceJSON: function(deviceId) {
            var deviceName = devices.get(deviceId).get("name");
            var tarId = this.maxNodeId++;
            return {"type": "device", "value": deviceId, "name": deviceName, "iid": tarId};
        },
        getIfJSON: function() {
            var ifId = this.maxNodeId + 1;
            var bId = this.maxNodeId + 2;
            var thenId = this.maxNodeId + 3;
            var elseId = this.maxNodeId + 4;
            this.maxNodeId += 4;
            return {"type": "if", "iid": ifId, "expBool": {"type": "empty", "iid": bId}, "seqRulesTrue": {"type": "empty", "iid": thenId}, "seqRulesFalse": {"type": "empty", "iid": elseId}};
        },
        getWhenJSON: function() {
            var wID = this.maxNodeId + 1;
            var eId = this.maxNodeId + 2;
            var thenId = this.maxNodeId + 3;
            this.maxNodeId += 3;
            return {"type": "when", "iid": wID, "events": {"type": "empty", "iid": eId}, "seqRulesThen": {"type": "empty", "iid": thenId}};
        },
        buildActionKeys: function() {
            var types = devices.getDevicesByType();
            for (type in types) {
                if (types[type].length > 0) {
                    o = types[type][0];
                    actions = o.getActions();
                    for (a in actions) {
                        $(".expected-elements").append(o.getKeyboardForAction(actions[a]));
                    }
                }
            }

        },
        buildEventKeys: function() {
            var types = devices.getDevicesByType();
            for (type in types) {
                if (types[type].length > 0) {
                    o = types[type][0];
                    events = o.getEvents();
                    for (a in events) {
                        $(".expected-elements").append(o.getKeyboardForEvent(events[a]));
                    }
                }
            }

        },
        buildDevices: function() {
            devices.forEach(function(device) {
                if (device.get("type") != 21) {
                    $(".expected-elements").append(device.buildButtonFromDevice());
                }
            });

        },
        buildKeyboard: function(nodes) {
            $(".expected-elements").html("");

            if (nodes != null) {
                for (t in nodes) {
                    switch (nodes[t]) {
                        case '"if"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard if-node'><span>Si<span></button>");
                            break;
                        case '"when"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard when-node'><span>lorsque<span></button>");
                            break;
                        case '"while"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard while-node'><span>tant que<span></button>");
                            break;
                        case '"seqRules"':
                            break;
                        case '"setOfRules"':
                            break;
                        case '"keepState"':
                            break;
                        case '"device"':
                            this.buildDevices();
                            break;
                        case '"variable"':
                            console.log("variables not supported in the language right now")
                            break;
                        case '"action"':
                            this.buildActionKeys();
                            break;
                        case '"event"':
                            this.buildEventKeys();
                            break;
                        case "ID":
                            console.log("empty program");
                            break;

                        default:
                            console.log(nodes[t] + "not implemented right now");
                            break;
                    }
                }
            } else {
                console.warn("For now, it is not supported to have multiple instruction in one program.")
            }
        },
        buildInputFromRule: function(jsonNode) {
            var input = this.buildInputFromNode(jsonNode);
            input += this.tplWhiteSpaceNode({node: jsonNode, maxId: this.maxNodeId});
            return input;
        },
        buildInputFromNode: function(jsonNode) {
            param = {node: jsonNode, engine: this};
            var input = "";
            switch (jsonNode.type) {
                case "action":
                    input = this.tplActionNode(param);
                    break;
                case "if":
                    input = this.tplIfNode(param);
                    break;
                case "when":
                    input = this.tplWhenNode(param);
                    break;
                case "device":
                    input = this.tplDeviceNode(param);
                    break;
                case "event":
                    input = this.tplEventNode(param);
                    break;
                case "empty":
                    input = "<button class='btn btn-prog input-spot' id='" + jsonNode.iid + "'></button>";
                    break;
                default:
                    input = "<button class='btn btn-prog' id='" + jsonNode.iid + "'><span>" + jsonNode.type + "</span></button>";
            }
            return input;
        },
        buildInputFromJSON: function() {
            this.checkProgramAndBuildKeyboard();
            $(".programInput").html(this.buildInputFromRule(this.programJSON));
            var nextPos = $(".input-spot")[0];
            if(nextPos){
                $(nextPos).removeClass("input-spot");
                this.setCurrentPos(nextPos.id);
            }
        },
        checkProgramAndBuildKeyboard: function(programJSON) {
            if (typeof programJSON !== "undefined")
                this.programJSON = programJSON;
            var n = this.Grammar.parse(this.programJSON);
            if (n == null) {
                console.log("Program is correct");
            } else if (n.expected[0] === "ID") {
                this.checkProgramAndBuildKeyboard({"iid": 0, type: "empty"});
            } else {
                console.warn("Invalid at " + n.id);
                this.buildKeyboard(n.expected);
            }
        }

    });
    return ProgramMediator;
});