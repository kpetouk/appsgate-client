define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/home.html',
], function($, _, Backbone, homeTemplate) {
 
  // initialize the views array
  if (typeof AppsGate.Universe.Views === "undefined") AppsGate.Universe.Views = {};
  
  // home view
  AppsGate.Universe.Views.List = Backbone.View.extend({
    el: $("#main"),
    template: _.template(homeTemplate),

    // render the homepage of the application
    render:function() {
      this.$el.html(this.template());
      return this;
    }
  });

  return AppsGate.Universe.Views.List;
});
