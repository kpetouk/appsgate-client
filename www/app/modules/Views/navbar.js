define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/navbar.html',
], function($, _, Backbone, navbarTemplate) {
 
  // initialize the views array
  if (typeof AppsGate.Views === "undefined") AppsGate.Views = {};
  
  // home view
  AppsGate.Views.NavBar = Backbone.View.extend({
    el: $("#main"),
    template: _.template(navbarTemplate),

    // render the homepage of the application
    render:function() {
      this.$el.html(this.template());
      return this;
    }
  });

  return AppsGate.Views.NavBar;
});
