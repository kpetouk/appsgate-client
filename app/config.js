// This is the runtime configuration file.  It complements the Gruntfile.js by
// supplementing shared properties.
require.config({
  paths: {
    // Make vendor easier to access.
    "vendor": "../vendor",

    // Almond is used to lighten the output filesize.
    "almond": "../vendor/bower/almond/almond",

    // Opt for Lo-Dash Underscore compatibility build over Underscore.
    "underscore": "../vendor/bower/lodash/dist/lodash.underscore",

    // JQuery and Backbone
    "jquery": "../vendor/bower/jquery/jquery",
    "backbone": "../vendor/bower/backbone/backbone",

    // JQuery plugins
    "i18n": "../vendor/bower/i18next/release/i18next.amd.withJQuery-1.7.1",

    // RequireJS plugins
    "text": "../vendor/bower/requirejs-text/text",
    "domReady": "../vendor/bower/requirejs-domready/domReady",
		
    // Snap.svg
    "snapsvg": "../vendor/bower/Snap.svg/dist/snap.svg",

		// MomentJS
		"moment": "../vendor/bower/momentjs/moment",

    // Modules
    "modules": "../app/modules",

    // Collections
    "collections": "../app/modules/collections",

    // Models
    "models": "../app/modules/models",

    // Views
    "views": "../app/modules/views",

    // Templates
    "templates": "../app/templates"

  },


  shim: {
    // This is required to ensure Backbone works as expected within the AMD
    // environment.
    "underscore": {
      exports: "_"
    },
    "backbone": {
      // These are the two hard dependencies that will be loaded first.
      deps: ["jquery", "underscore"],

      // This maps the global `Backbone` object to `require("backbone")`.
      exports: "Backbone"
    },
    "i18n" : {
      deps: [ "jquery" ] 
    },
		"moment" : {
			exports: "moment"
		}

  }
});

// Setting up AppsGate globals.
if (!window.AppsGate) window.AppsGate = {};
if (!AppsGate.App) AppsGate.App = {};
if (!AppsGate.Universe) AppsGate.Universe = {};
if (!AppsGate.Place) AppsGate.Place = {};
if (!AppsGate.Device) AppsGate.Device = {};
if (!AppsGate.Program) AppsGate.Program = {};


