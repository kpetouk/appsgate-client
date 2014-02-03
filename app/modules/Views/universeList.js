define([
	"app",
  "text!templates/home/home.html"
], function(App, homeTemplate) {
 
	var UniverseList = {};
  
  /**
	 * View used as home page of the application
	 */
  UniverseList = Backbone.View.extend({
    el: $("#main"),
    template: _.template(homeTemplate),
		
		/**
		 * constructor
		 */
    initialize:function() {
			var self = this;
      UniverseList.__super__.initialize.apply(this, arguments);
			
		},

    // render the homepage of the application
    render:function() {
      this.$el.html(this.template());
      return this;
    }
  });

  return UniverseList;
});
