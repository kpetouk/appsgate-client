require.config({
	paths: {
		jquery: "libs/jquery/jquery-min",
		underscore: "libs/underscore/underscore-min",
		backbone: "libs/backbone/backbone-min",
		// communicator: "communicator",
		templates: "../templates"
	},

	shim: {
		"underscore": {
			exports: "_"
		},
		"backbone": {
			deps: [ "underscore", "jquery" ],
			exports: "Backbone"
		}
	}
});

require([
	"app"
], function(app) {
	app.initialize();
});
