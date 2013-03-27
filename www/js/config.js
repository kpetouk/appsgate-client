require.config({
    // initialize the application with the main application file
    deps: ["main"],
    paths:{
        // RequireJS plugin
        text: "libs/require/text",
        // RequireJS plugin
        domReady: "libs/require/domReady",
        // jQuery
        jquery: "libs/jquery/jquery-1.8.2",
        // jQuery UI
        jqueryui: "libs/jquery/jquery-ui-1.10.0.min",
        // bootstrap
        bootstrap: "libs/bootstrap/js/bootstrap.min",
        // underscore library
        underscore: "libs/underscore/underscore",
        // Backbone.js library
        backbone: "libs/backbone/backbone",
        // Modules
        communicator: "modules/communicator",
        location: "modules/location",
        device: "modules/device",
        program: "modules/program",
        home: "modules/home"
    },
    shim: {
        "bootstrap": {
            deps: ["jquery"]
        },
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: [ "underscore", "jquery" ],
            exports: "Backbone"
        },
        "jqueryui": {
            deps: [ "jquery" ]
        }
    }
});