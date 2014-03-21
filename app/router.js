define(function(require, exports, module) {
  "use strict";

  // External dependencies.
	var LoginView = require("views/login/loginview");
  var HomeView = require("views/homeview");
  var HabitatView = require("views/habitatview");
	var DevicesView = require("views/devicesview");
	var ServicesView = require("views/servicesview");
	var UniverseView = require("views/universeview");

  // define the application router
  var Router = Backbone.Router.extend({
    routes: {
      ""		: "login",
			"login" : "login",
			"reset"	: "home",
			"home" : "home",
      "spatial_root" : "habitat",
			"device_root" : "devices",
			"service_root" : "services"
    },

    // default route of the application
    login:function() {
      this.showView(new LoginView());
    },

		home:function() {
			this.showView(new HomeView());
		},
		
    habitat:function() {
      this.showView(new HabitatView());
    },
		
		devices:function() {
      this.showView(new DevicesView());
    },
		
		services:function() {
			this.showView(new ServicesView());
		},


    showView:function(view) {
      // remove and unbind the current view
      if (this.currentView) {
        this.currentView.close();
      }

      // update the content
      this.currentView = view;
      this.currentView.render();
    },
		
		showUniverse:function(universe) {
			var view = new UniverseView({model:universe});
			this.showView(view);
		}

  });

  module.exports = Router;

});
