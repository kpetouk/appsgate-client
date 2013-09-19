define([
	"underscore",
	"text!resources/grammar.peg",
	"peg"
], function(_, grammar) {

	// define the default root grammar
	var rootGrammar = "";

	/**
	 * @constructor
	 */
	function Grammar() {
		var self = this;

		// cannot be called as a function...
		if (!(this instanceof Grammar)) {
			throw new TypeError("Grammar constructor cannot be called as a function");
		}

		// strings for the list of events and actions
		var listOfEvents = "eventProgram";
		var listOfStatus = "statusProgram";
		var listOfActions = "actionProgram";

		// group the devices by types - if any for a type, insert its corresponding grammar and the list of devices
		var devicesByType = devices.getDevicesByType();
		_.keys(devicesByType).forEach(function(deviceType) {
			// append the rules to the grammar
			deviceTypesGrammar[deviceType].rules.forEach(function(r) {
				grammar += r + "\n";
			});
			// insert the list of the devices
			self.insertListOfDevices(deviceTypesGrammar[deviceType].listAnchor, devicesByType[deviceType]);

			// append the events to the list of events
			if (typeof deviceTypesGrammar[deviceType].eventAnchor !== "undefined") {
				listOfEvents += " / " + deviceTypesGrammar[deviceType].eventAnchor;
			}
			
			// append the status to the list of events because it is used at the same location in the grammar
			if (typeof deviceTypesGrammar[deviceType].statusAnchor !== "undefined") {
				listOfStatus += " / " + deviceTypesGrammar[deviceType].statusAnchor;
			}

			// append the actions to the list of actions
			if (typeof deviceTypesGrammar[deviceType].actionAnchor !== "undefined") {
				listOfActions += " / " + deviceTypesGrammar[deviceType].actionAnchor;
			}
		});

		// insert the list of events
		grammar = grammar.replace(/{{listOfEvents}}/g, listOfEvents);
		
		// insert the list of status
		grammar = grammar.replace(/{{listOfStatus}}/g, listOfStatus);

		// insert the list of actions
		grammar = grammar.replace(/{{listOfActions}}/g, listOfActions);

		// insert the list of programs
		this.insertListOfDevices("{{listOfPrograms}}", programs);

		// build the parser from the grammar
		this.parser = PEG.buildParser(grammar);
	}

	Grammar.prototype = {
		constructor: constructor,

		insertListOfDevices:function(grammarAnchor, listOfDevices) {
			var deviceNames = "";
			listOfDevices.forEach(function(d) {
				deviceNames += '"' + d.get("name") + '"/'; 
			});
			if (deviceNames !== "") {
				deviceNames = deviceNames.substring(0, deviceNames.length - 1);
			}

			var regexp = new RegExp(grammarAnchor, "g");
			grammar = grammar.replace(regexp, deviceNames);
		},

		parse:function(input) {
			try {
				return this.parser.parse(input);
			} catch(e) {
				throw e;
			}
		}
	};

	return Grammar;
});