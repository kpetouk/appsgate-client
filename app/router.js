define(function(require, exports, module) {
  "use strict";

  // External dependencies.
  //var app = require("app");
  //var Backbone = require("backbone");
  require("views/universelist");
  require("views/spatialUniverse");

  // define the application router
  var Router = Backbone.Router.extend({
    routes: {
      ""		: "index",
			"reset"	: "index",
      "spatialUniverse" : "spatialUniverse"
    },

    // default route of the application
    index:function() {
      this.showView(new AppsGate.Universe.Views.List());
    },


    spatialUniverse:function() {
      this.showView(new AppsGate.Universe.Views.SpatialUniverse());
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
