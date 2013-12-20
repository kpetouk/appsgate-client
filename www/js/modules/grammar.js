define([
	"underscore",
	"text!resources/grammar.peg",
	"peg"
], function(_, grammarSource) {
	/**
	 * @constructor
	 */
	function Grammar() {
		var self = this;
		
		this.grammar = grammarSource;


		// build the parser from the grammar
		try {
			this.parser = PEG.buildParser(this.grammar);
		} catch (e) {
			console.warn(e);
		}
	}

	Grammar.prototype = {
		constructor: constructor,

		insertListOfDevices:function(grammarAnchor, listOfDevices, deviceType) {
			var deviceNames = "";
			listOfDevices.forEach(function(d) {
				deviceNames += '"<span class=' + "'device-name' data-device-type='" + deviceType + "'>" + d.get("name") + '</span>"/'; 
			});
			if (deviceNames !== "") {
				deviceNames = deviceNames.substring(0, deviceNames.length - 1);
			}

			var regexp = new RegExp(grammarAnchor, "g");
			this.grammar = this.grammar.replace(regexp, deviceNames);
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