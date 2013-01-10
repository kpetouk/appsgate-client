// configure requirejs
require.config({
	// initialize the application with the main application file
	deps: ["main"],
	paths: {
		// javascript folders
		templates: "../templates",

		// librairies
		jquery: "libs/jquery/jquery-min",
		underscore: "libs/underscore/underscore-min",
		backbone: "libs/backbone/backbone-min",
		raphael: "libs/raphael/raphael.2.1.0.amd"
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
