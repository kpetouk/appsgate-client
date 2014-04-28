define([
    "app",
    "modules/grammar",
    "text!templates/program/nodes/defaultActionNode.html",
    "text!templates/program/nodes/lampActionNode.html",
    "text!templates/program/nodes/ifNode.html",
    "text!templates/program/nodes/whenNode.html",
    "text!templates/program/nodes/deviceNode.html",
    "text!templates/program/nodes/eventNode.html",
    "text!templates/program/nodes/stateNode.html",
    "text!templates/program/nodes/keepStateNode.html",
    "text!templates/program/nodes/whileNode.html",
    "text!templates/program/nodes/whitespaceNode.html",
    "text!templates/program/nodes/booleanExpressionNode.html",
    "text!templates/program/nodes/comparatorNode.html",
    "text!templates/program/nodes/numberNode.html"
], function(App, Grammar, defaultActionTemplate, lampActionTemplate, ifNodeTemplate, whenNodeTemplate, deviceNodeTemplate, eventNodeTemplate, stateNodeTemplate, keepStateNodeTemplate, whileNodeTemplate, whitespaceNodeTemplate, booleanExpressionNodeTemplate, comparatorNodeTemplate, numberNodeTemplate) {

    var ProgramMediator = {};
    // router
    ProgramMediator = Backbone.Model.extend({
        tplDefaultActionNode: _.template(defaultActionTemplate),
        tplLampActionNode: _.template(lampActionTemplate),
        tplIfNode: _.template(ifNodeTemplate),
        tplWhenNode: _.template(whenNodeTemplate),
        tplDeviceNode: _.template(deviceNodeTemplate),
        tplEventNode: _.template(eventNodeTemplate),
        tplStateNode: _.template(stateNodeTemplate),
        tplKeepStateNode: _.template(keepStateNodeTemplate),
        tplWhileNode: _.template(whileNodeTemplate),
        tplWhiteSpaceNode: _.template(whitespaceNodeTemplate),
        tplBooleanExpressionNode: _.template(booleanExpressionNodeTemplate),
        tplComparatorNode: _.template(comparatorNodeTemplate),
        tplNumberNode: _.template(numberNodeTemplate),
        initialize: function() {
            this.resetProgramJSON();
            this.currentNode = 1;
            this.maxNodeId = 1;
            this.lastAddedNode = null;
            this.Grammar = new Grammar();
        },
        resetProgramJSON: function() {
            this.programJSON = {
                iid: 0,
                type: "setOfRules",
                rules: [{iid: 1, type: "empty"}]
            }
        },
        loadProgramJSON: function(programJSON) {
            this.programJSON = programJSON;
            this.maxNodeId = this.findMaxId(programJSON);
            this.currentNode = -1;
        },
        findMaxId: function(curNode) {
            for (var o in curNode) {
                if (typeof curNode[o] === 'object') {
                    this.findMaxId(curNode[o]);
                }
                if (curNode[o].iid > this.maxNodeId) {
                    this.maxNodeId = curNode[o].iid;
                }
            }
            return this.maxNodeId;
        },
        setCurrentPos: function(id) {
            this.currentNode = id;
        },
        setCursorAndBuildKeyboard: function(id) {
            this.setCurrentPos(id);
            this.checkProgramAndBuildKeyboard(this.programJSON);
        },
        buttonPressed: function(button) {
            n = {};
            if ($(button).hasClass("specific-node")) {
                n = JSON.parse($(button).attr('json'));
            } else if ($(button).hasClass("device-node")) {
                n = this.getDeviceJSON(button.id);
            } else if ($(button).hasClass("number-node")) {
                n = {
                    "type": "number",
                    "iid": "X",
                    "value": "0"
                };
            } else if ($(button).hasClass("if-node")) {
                n = this.getIfJSON();
            } else if ($(button).hasClass("when-node")) {
                n = {
                    "type": "when",
                    "iid": "X",
                    "events": {
                        "type": "mandatory",
                        "iid": "X"
                    },
                    "seqRulesThen": {
                        "iid": "X",
                        "type": "seqRules",
                        "rules": [{
                                "iid": "X",
                                "type": "mandatory"
                            }]
                    }
                };
            } else if ($(button).hasClass("while-node")) {
                n = {
                    "type": "while",
                    "iid": "X",
                    "state": this.getEmptyJSON("mandatory"),
                    "rules": {
                        "iid": "X",
                        "type": "seqRules",
                        "rules": [this.getEmptyJSON("mandatory")]
                    },
                    "rulesThen": {
                        "iid": "X",
                        "type": "seqRules",
                        "rules": [this.getEmptyJSON("empty")]
                    }
                };
            } else if ($(button).hasClass("whileKeep-node")) {
                n = {
                    "type": "while",
                    "iid": "X",
                    "state": this.getEmptyJSON("mandatory"),
                    "rules": {
                        "type": "keepState",
                        "iid": "X",
                        "state": this.getEmptyJSON("mandatory")
                    }
                };

            } else if ($(button).hasClass("clock-node")) {
                n = this.getEventJSON("ClockAlarm", "il est 7h00", "7h00");
            } else if ($(button).hasClass("TODO-node")) {
                console.warn("Node has to be implemented");
            }

            this.lastAddedNode = this.setIidOfJson(n)
            this.appendNode(this.lastAddedNode, this.currentNode);

            // reset the selection because a node was added
            this.setCurrentPos(-1);
            this.buildInputFromJSON();
        },
        appendNode: function(node, pos) {
            this.programJSON = this.recursivelyAppend(node, pos, this.programJSON);
        },
        recursivelyAppend: function(nodeToAppend, pos, curNode) {
            if (parseInt(curNode.iid) === parseInt(pos)) {
                curNode = nodeToAppend;
            } else {
                for (var o in curNode) {
                    if (typeof curNode[o] === "object") {
                        // If adding an element to a rules array, we add an empty element to allow further insertions
                        if (parseInt(curNode[o].iid) === parseInt(pos) && $.isArray(curNode) && (curNode[o].type === "mandatory" || curNode[o].type === "empty")) {
                            curNode.push(this.setIidOfJson(this.getEmptyJSON("empty")));
                        }
                        curNode[o] = this.recursivelyAppend(nodeToAppend, pos, curNode[o]);

                    }
                }
            }
            return curNode;
        },
        removeSelectedNode: function() {
            this.programJSON = this.recursivelyRemove(this.currentNode, this.programJSON);
            this.buildInputFromJSON();
        },
        recursivelyRemove: function(pos, curNode, parentNode) {
            if (parseInt(curNode.iid) === parseInt(pos)) {
                curNode = {iid: curNode.iid, type: "empty"};
            } else {
                for (var o in curNode) {
                    if (typeof curNode[o] === "object") {
                        curNode[o] = this.recursivelyRemove(pos, curNode[o], curNode);
                        if (curNode[o].iid === pos && curNode[o].type === "empty") {
                            if (typeof curNode.iid === "undefined") {
                                this.setCursorAndBuildKeyboard(parentNode.iid);
                            }
                            else {
                                this.setCursorAndBuildKeyboard(curNode.iid);
                            }
                        }
                    }
                }
            }
            return curNode;
        },
        setNodeAttribute: function(iid, attribute, value) {
            this.recursivelySetNodeAttribute(iid, attribute, value, this.programJSON);
        },
        recursivelySetNodeAttribute: function(iid, attribute, value, curNode) {
            if (parseInt(curNode.iid) === parseInt(iid)) {
                curNode[attribute] = value;
            }
            else {
                for (var o in curNode) {
                    if (typeof curNode[o] === "object") {
                        this.recursivelySetNodeAttribute(iid, attribute, value, curNode[o]);
                    }
                }
            }
        },
        setIidOfJson: function(obj) {
            if (obj.iid === "X") {
                obj.iid = this.maxNodeId++;
            }
            for (var k in obj) {
                if (typeof obj[k] === "object") {
                    this.setIidOfJson(obj[k]);
                }
            }
            return obj;
        },
        getDeviceJSON: function(deviceId) {
            var deviceName = devices.get(deviceId).get("name");
            return {"type": "device", "value": deviceId, "name": deviceName, "iid": "X"};
        },
        getIfJSON: function() {
            return {
                "type": "if",
                "iid": "X",
                "expBool": {
                    "type": "empty",
                    "iid": "X"
                    },
                "seqRulesTrue": {
                    "type": "seqRules",
                    "iid": "X",
                    "rules" : [
                               {
                                "type":"empty",
                                "iid":"X"
                                }
                                ]
                    },
                "seqRulesFalse": {
                    "type": "seqRules",
                    "iid": "X",
                    "rules" : [
                               {
                                "type":"empty",
                                "iid":"X"
                                }
                                ]
                    }
                };
        },
        getEmptyJSON: function(type) {
            return {"type": "empty", "iid": "X"};
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
        buildStateKeys: function() {
            var types = devices.getDevicesByType();
            for (type in types) {
                if (types[type].length > 0) {
                    o = types[type][0];
                    states = o.getStates();
                    for (a in states) {
                        $(".expected-elements").append(o.getKeyboardForState(states[a]));
                    }
                }
            }
        },
        buildDeviceStateKeys: function() {
            var types = devices.getDevicesByType();
            for (type in types) {
                if (types[type].length > 0) {
                    o = types[type][0];
                    states = o.getDeviceStates();
                    for (a in states) {
                        $(".expected-elements").append(o.getKeyboardForDeviceState(states[a]));
                    }
                }
            }
        },
        buildBooleanKeys: function() {
            var v = {"type":"boolean", "value" : "true", "iid":"X"};
            var f = {"type":"boolean", "value" : "false", "iid":"X"};
            var btn_v = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' >Vrai</button>");
            var btn_f = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' >Faux</button>");
            $(btn_v).attr("json", JSON.stringify(v));
            $(btn_f).attr("json", JSON.stringify(f));
            $(".expected-elements").append(btn_v);
            $(".expected-elements").append(btn_f);

        },
        buildDevices: function() {
            devices.forEach(function(device) {
                if (device.get("type") != 21) {
                    $(".expected-elements").append(device.buildButtonFromDevice());
                }
            });
        },
        buildBooleanExpressionKeys: function() {

            var btnAnd = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ><span data-i18n='language.if-and'/></button>");
            var v = {"type": "booleanExpression", "iid": "X", "operator":"&&", "leftOperand": {"iid": "X", "type": "mandatory"}, "rightOperand": {"iid": "X", "type": "mandatory"}};
            $(btnAnd).attr("json", JSON.stringify(v));
            $(".expected-elements").append(btnAnd);

        },
        buildComparatorKeys: function() {

            var btnEq = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ><span data-i18n='language.if-equals'/></button>");
            var v = {"type": "comparator", "iid": "X", "comparator":"==", "leftOperand": {"iid": "X", "type": "mandatory"}, "rightOperand": {"iid": "X", "type": "mandatory"}};
            $(btnEq).attr("json", JSON.stringify(v));
            $(".expected-elements").append(btnEq);
            var btnSup = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ><span data-i18n='language.if-sup'/></button>");
            var v = {"type": "comparator", "iid": "X", "comparator":">", "leftOperand": {"iid": "X", "type": "mandatory"}, "rightOperand": {"iid": "X", "type": "mandatory"}};
            $(btnSup).attr("json", JSON.stringify(v));
            $(".expected-elements").append(btnSup);
            var btnInf = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ><span data-i18n='language.if-inf'/></button>");
            var v = {"type": "comparator", "iid": "X", "comparator":"<", "leftOperand": {"iid": "X", "type": "mandatory"}, "rightOperand": {"iid": "X", "type": "mandatory"}};
            $(btnInf).attr("json", JSON.stringify(v));
            $(".expected-elements").append(btnInf);
            var btnDiff = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ><span data-i18n='language.if-dif'/></button>");
            var v = {"type": "comparator", "iid": "X", "comparator":"!=", "leftOperand": {"iid": "X", "type": "mandatory"}, "rightOperand": {"iid": "X", "type": "mandatory"}};
            $(btnDiff).attr("json", JSON.stringify(v));
            $(".expected-elements").append(btnDiff);

        },
        buildKeyboard: function(nodes) {
            $(".expected-elements").html("");

            if (nodes != null) {
                for (t in nodes) {
                    switch (nodes[t]) {
                        case '"if"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard if-node'><span data-i18n='language.if-keyword'><span></button>");
                            break;
                        case '"comparator"':
                            this.buildComparatorKeys();
                            break;
                        case '"booleanExpression"':
                            this.buildBooleanExpressionKeys();
                            break;
                        case '"when"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard when-node'><span data-i18n='language.when-keyword'><span></button>");
                            break;
                        case '"while"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard while-node'><span data-i18n='language.while-keyword'><span></button>");
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard whileKeep-node'><span data-i18n='language.while-keep'><span></button>");
                            break;
                        case '"state"':
                            this.buildStateKeys();
                            break;
                        case '"seqRules"':
                            break;
                        case '"setOfRules"':
                            break;
                        case '"keepState"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard keepState-node'><span data-i18n='language.keep-state'><span></button>");
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
                        case '"deviceState"':
                            this.buildDeviceStateKeys();
                            break;
                        case '"boolean"':
                            this.buildBooleanKeys();
                            break;
                        case "ID":
                            console.log("empty program");
                            break;
                        case '"number"':
                            $(".expected-elements").append("<button class='btn btn-default btn-keyboard number-node'><span>valeur<span></button>");
                            break;

                        default:
                            break;
                    }
                }
            } else {
                console.warn("For now, it is not supported to have multiple instruction in one program.")
            }

            $(".expected-elements").i18n();
        },
        getDeviceName: function(id) {
            if (devices.get(id) == undefined) {
                console.warn("device not found: " + id);
                return "Not FOUND";
            }
            return devices.get(id).get("name");
        },
        buildActionNode: function(param) {
            var result = "";
            if (param.node.deviceType == "7") {
                result = this.tplLampActionNode(param);
            }
            else {
                result = this.tplDefaultActionNode(param);
            }

            return result;

        },
        buildInputFromNode: function(jsonNode) {
            var self = this;

            param = {
                node: jsonNode,
                engine: this
            };
            var input = "";
            switch (jsonNode.type) {
                case "action":
                    input = this.buildActionNode(param);
                    break;
                case "if":
                    input = this.tplIfNode(param);
                    break;
                case "booleanExpression":
                    input = this.tplBooleanExpressionNode(param);
                    break;
                case "comparator":
                    input = this.tplComparatorNode(param);
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
                case "state":
                case "deviceState":
                    input = this.tplStateNode(param);
                    break;
                case "while":
                    input = this.tplWhileNode(param);
                    break;
                case "keepState":
                    input = this.tplKeepStateNode(param);
                    break;
                case "empty":
                    input = "<div class='btn btn-default btn-prog input-spot' id='" + jsonNode.iid + "'></div>";
                    break;
                case "seqRules":
                case "setOfRules":
                    jsonNode.rules.forEach(function(rule) {
                        input += self.buildInputFromNode(rule);
                    });
                    break;
                case "boolean":
                    input = "<button class='btn btn-prog btn-primary' id='" + jsonNode.iid + "'><span>" + jsonNode.value + "</span></button>";
                    break;
                case "number":
                    input = this.tplNumberNode(param);
                    break;
<<<<<<< HEAD
=======
                case "number":
                    input = this.tplNumberNode(param);
                    break;
>>>>>>> FETCH_HEAD
                default:
                    input = "<button class='btn btn-prog btn-primary' id='" + jsonNode.iid + "'><span>" + jsonNode.type + "</span></button>";
                    break;
            }
            return input;
        },
        buildInputFromJSON: function() {
            this.checkProgramAndBuildKeyboard();
            $(".programInput").html(this.buildInputFromNode(this.programJSON));

            if (this.currentNode === -1 && this.lastAddedNode !== null) {
                var nextInput = $("#" + this.lastAddedNode.iid).parent().nextAll(".input-spot");
                this.setCursorAndBuildKeyboard(parseInt(nextInput.first().attr("id")));
            }
            
            // if no input point is chosen at this point, we select the last empty element
            if($(".expected-elements").children().length === 0) {
                var lastInputPoint = $(".programInput").children(".input-spot").last();
                this.setCursorAndBuildKeyboard(parseInt(lastInputPoint.attr("id")));
            }
            
            appRouter.currentMenuView.$el.i18n();
        },
        checkProgramAndBuildKeyboard: function(programJSON) {
            if (typeof programJSON !== "undefined")
                this.programJSON = programJSON;
            var n = this.Grammar.parse(this.programJSON, this.currentNode);
            if (n == null) {
                console.log("Program is correct");
            } else if (n.expected[0] === "ID") {
                this.resetProgramJSON();
                this.checkProgramAndBuildKeyboard();
            } else {
                console.warn("Invalid at " + n.id);
                if (typeof n.id !== "undefined") {
                    this.setCurrentPos(n.id);
                }
                this.buildKeyboard(n.expected);
            }
        }
    });
    return ProgramMediator;
});
