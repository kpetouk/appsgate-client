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
        
        blankProgramJSON:{
            iid:0,
            type:"setOfRules",
            rules:[{iid: 1, type: "empty"}]
        },

        
        initialize: function() {
            this.programJSON = this.blankProgramJSON;
            this.currentNode = 1;
            this.maxNodeId = 1;
            this.Grammar = new Grammar();
        },
        setCurrentPos: function(id) {
            this.currentNode = id;
        },
        buttonPressed: function(button) {
            n = {};
            if ($(button).hasClass("specific-node")) {
                n = JSON.parse($(button).attr('json'));
            }
            else if ($(button).hasClass("device-node")) {
                n = this.getDeviceJSON(button.id);
            } else if ($(button).hasClass("if-node")) {
                n = this.getIfJSON();

            } else if ($(button).hasClass("when-node")) {
                n = this.getWhenJSON();

            } else if ($(button).hasClass("clock-node")) {
                n = this.getEventJSON("ClockAlarm", "il est 7h00", "7h00");

            }
            this.appendNode(this.setIidOfJson(n),this.currentNode);
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
        setIidOfJson : function(obj) {
            console.log("setIid:" + obj);
            if (obj.iid === "X")  {
                obj.iid = this.maxNodeId++;
            }
            for (var k in obj) {
				if (typeof obj[k] === "object") {
                    this.setIidOfJson(obj[k]);
                }
            }
            console.log(obj);
            return obj;
        },
        
        getDeviceJSON: function(deviceId) {
            var deviceName = devices.get(deviceId).get("name");
            return {"type": "device", "value": deviceId, "name": deviceName, "iid": "X"};
        },
        getIfJSON: function() {
            return {"type": "if", "iid": "X", "expBool": {"type": "empty", "iid": "X"}, "seqRulesTrue": {"type": "empty", "iid": "X"}, "seqRulesFalse": {"type": "empty", "iid": "X"}};
        },
        getWhenJSON: function() {
            return {"type": "when", "iid": "X", "events": {"type": "empty", "iid": "X"}, "seqRulesThen": {"iid": "X", "type": "seqRules",  "rules":[{"iid": "X", "type": "empty"}]}};
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
                        var self = this;

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
                case "seqRules": case "setOfRules":
                    jsonNode.rules.forEach(function(rule) {
                        input += self.buildInputFromNode(rule); 
                    });
                    break;
                default:
                    input = "<button class='btn btn-prog' id='" + jsonNode.iid + "'><span>" + jsonNode.type + "</span></button>";
                    break;
            }
            return input;
        },
        buildInputFromJSON: function() {
            this.checkProgramAndBuildKeyboard();
            $(".programInput").html(this.buildInputFromRule(this.programJSON));
        },
        checkProgramAndBuildKeyboard: function(programJSON) {
            if (typeof programJSON !== "undefined")
                this.programJSON = programJSON;
            var n = this.Grammar.parse(this.programJSON);
            if (n == null) {
                console.log("Program is correct");
            } else if (n.expected[0] === "ID") {
                this.checkProgramAndBuildKeyboard(this.blankProgramJSON);
            } else {
                console.warn("Invalid at " + n.id);
                this.setCurrentPos(n.id);
                this.buildKeyboard(n.expected);
            }
        }

    });
    return ProgramMediator;
});