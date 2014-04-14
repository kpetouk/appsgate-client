define([
    "app",
    "text!rsrc/conToAbs.peg"
], function(App, grammar) {

    require(["peg"]);

    var ProgramGrammar = {};
    ProgramGrammar = Backbone.Model.extend({
        initialize: function() {
            this.grammar = this.build(grammar);
        },
        build : function(g) {
            console.log("Building the parser...");
            try {
                this.parser = PEG.buildParser(g, {
                    cache: false,
                    trackLineAndColumn: true
                });
                console.log("ok");
            } catch (e) {
                console.error("unable to build the parser");
                console.error(e);
            }
            return null;
        },
        
        parse: function (jsonObj) {
            try {
                var s = this.parseNode(jsonObj);
                console.log(s);
                this.parser.parse(s);
                return null;
            } catch (e) {
                console.warn("Invalid program");
                return this.tryParse(s, e);
            }
        },
        
        tryParse: function(toParse,e) {
            var l = e.offset-5;
            var id = toParse.substr(l,4);
            while(isNaN(id)) {
                id = id.substr(1);
            }
            return { "id":id, "expected": e.expected};
        },
        
        parseNode : function(obj) {
            var args = "";
            if (obj.length) {
                for (var k in obj) {
					args += this.parseNode(obj[k]) + " ";
				}
				return args;
            }
			if (obj.length == 0) {
				return "";
			}
            var type = obj.iid +":";
            if (obj.type) {
                type += obj.type;
            }
		
            for (var k in obj) {
				if (typeof obj[k] === "object") {
					if (obj[k].length != undefined) {
						args += "["+ this.parseNode(obj[k]) + "]";
					} else {
						args+= "("+ this.parseNode(obj[k]) + ")";
					}
				}
            }
            return type + args;
        }


    });

    return ProgramGrammar;
});
