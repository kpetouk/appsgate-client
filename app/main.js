// Break out the application running from the configuration definition to
// assist with testing.
require(["config"], function() {
  // Kick off the application.
  require(["domReady", "app"], function (domReady, app) {

	  /**
     * Encapsulate actions to perform before switching the view to avoid ghost views
     * @returns {undefined}
     */
    Backbone.View.prototype.close = function() {
			// remove the view from the page
			//this.remove();

			// unbind all the events associated to the view
			this.unbind();
    };

    /**
     * Bind an event on a dom element that is not contained in the view
     * 
     * @param callback Callback to invoke when the event has been triggered
     * @param domElement dom element that will trigger the event
     * @param event Event to bind
     */
    Backbone.View.prototype.addExternalElement = function(domElements) {
      // instantiate the array to store external dom elements binded to the view - used in close() to avoid ghost views
      if (typeof this.externalElements === "undefined") {
        this.externalElements = [];
      }

      // add the domElement to the array containing all the external dom elements to the view
      this.externalElements = this.externalElements.concat(domElements);
    };


    // domReady is RequireJS plugin that triggers when DOM is ready
    domReady(function() {
			// initialise localisation
			$.i18n.init({ resGetPath:'app/locales/__lng__/__ns__.json', lng : 'fr-FR' }).done(function() {
				app.initialize();
				console.log("localisation initialized");
			});
    });
  });
});


