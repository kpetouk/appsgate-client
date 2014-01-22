// Break out the application running from the configuration definition to
// assist with testing.
require(["config"], function() {
  // Kick off the application.
  require(["domReady", "app"], function (domReady, app) {


		// All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
      // Get the absolute anchor href.
      var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
      // Get the absolute root.
      var root = location.protocol + "//" + location.host + app.root;

      // Ensure the root is part of the anchor href, meaning it's relative.
      if (href.prop.slice(0, root.length) === root) {
        // Stop the default event to ensure the link will not cause a page
        // refresh.
        evt.preventDefault();

        // `Backbone.history.navigate` is sufficient for all Routers and will
        // trigger the correct events. The Router's internal `navigate` method
        // calls this anyways.  The fragment is sliced from the root.
        Backbone.history.navigate(href.attr, true);
      }
    });

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
      app.initialize();

    });
  });
});


