define([
  'jquery',
  'underscore',
  'backbone',
  'snapsvg',
  'text!templates/map/default.html',
], function($, _, Backbone, Snap, svgtemplate) {
 
  // initialize the views array
  if (typeof AppsGate.Universe.Views === "undefined") AppsGate.Universe.Views = {};
  
  // home view
  AppsGate.Universe.Views.SpatialUniverse = Backbone.View.extend({
    
		el: $("#main"),
    template: _.template(svgtemplate),
		
	
    // render the homepage of the application
    render:function() {
			this.$el.html(this.template());
      
			var paper = Snap("#svgspace");
			paper.rect(100,100,200,200);
			paper.text(50,50,"svgTEST");
			return this;

    },
  
	

});
	
	

  return AppsGate.Universe.Views.List;
});
