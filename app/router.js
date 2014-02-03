define(function(require, exports, module) {
  "use strict";

  // External dependencies.
  var UniverseList = require("views/universelist");
  var MapUniverseView = require("views/mapUniverseView");

  // define the application router
  var Router = Backbone.Router.extend({
    routes: {
      ""		: "index",
			"reset"	: "index",
      "spatialUniverse" : "spatialUniverse"
    },

    // default route of the application
    index:function() {
      this.showView(new UniverseList());
    },


    spatialUniverse:function() {
      this.showView(new MapUniverseView());
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
