define(function(require, exports, module) {
  "use strict";

  // External dependencies.
	var LoginView = require("views/login/loginview");
  var HomeView = require("views/homeview");
  var HabitatView = require("views/habitatview");

  // define the application router
  var Router = Backbone.Router.extend({
    routes: {
      ""		: "home",
			"login" : "login",
			"reset"	: "home",
			"home" : "home",
      "spatial_root" : "habitat"
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

    showView:function(view) {
      // remove and unbind the current view
      if (this.currentView) {
        this.currentView.close();
      }

      // update the content
      this.currentView = view;
      this.currentView.render();
    },

  });

  module.exports = Router;

});
