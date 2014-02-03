define([
  "app"
], function(App) {

  var Brick = {};

  /**
   * Brick Model class extending the Backbone model class and an abstract class for all the bricks in the application (universes, places, devices, services, programs...)
   */
  Brick = Backbone.Model.extend({

    /**
     * constructor
     */
    initialize:function() {
      this.parents		= [];
      this.children		= [];
      this.views = [];
      this.viewFactories= {};
    },

    /**
     * Appends a view factory to the model, which provides an appropriate view for the brick at a given level of zoom
     */
    appendViewFactory:function(name, constr, validity) {
      if(!validity) {throw('No validity domain defined for ' + name);}
      this.viewFactories[name] = {name:name,constr:constr,validity:validity,UISet:[]};
    },

    /**
     * Removes a view from the model
     * @param view The view to remove
     */
    unPlugView:function(view) {
      if(view.factory) {
        view.factory.UISet.push(view);
        var parent = view.parent;
        if(parent) {
          parent.removeChild(view);
        }
      }
    },

    /**
     * Provides a new view from a view factory given a context representing the current level of zoom
     * @param context The context containing the current pixel density and pixel ratio
     */
    getNewViewWithContext:function(context) {
      // Context contains informations such as ratio and pixels
      for(var i in this.viewFactories) {
        var factory = this.viewFactories[i];
        if (  factory.validity.pixelsMinDensity <= context.pixelsDensity
            && factory.validity.pixelsMaxDensity >= context.pixelsDensity
          && factory.validity.pixelsRatio === context.pixelsRatio
           ) {// This is the right factory!
             return this.getNewView(factory.name);
           }
      }
      return null;
    },

    /**
     * Provides an existing view if it exists or creates a new one from a view factory
     * @param name The name of the view to provide
     */
    getNewView:function(name) {
      var res = null, fact = null;
      // checking if the requested view factory already exists
      if(name && this.viewFactories[name]) {
        fact = this.viewFactories[name];
      }
      // otherwise we instantiate one
      else {
        var Constrs = Object.keys(this.viewFactories);
        if(Constrs.length > 0) {
          fact = this.viewFactories[Constrs[0]];
        }
      }
      if(fact) {
        // checking if the view already exists
        if(fact.UISet.length > 0) {
          res = fact.UISet.splice(0,1)[0];
        }
        // otherwise we create a new one
        else {
          res = new fact.constr({model:this});}
          res.validity = fact.validity;
          res.factory  = fact;
      }

      return res;
    },

    /**
     * Appends a parent to the current brick model
     * @param parent The parent brick model
     */
    appendParent:function(parent) {
      if(this.parents.indexOf(parent) == -1) {
        this.parents.push(parent);
        parent.appendChild(this);
      }
    },

    /**
     * Removes a parent from the current brick model
     * @param parent The parent brick to remove
     */
    removeParent:function(parent) {
      var pos = this.parents.indexOf(parent)
      if(pos !== -1) {
        this.parents.splice(pos,1);
        parent.removeChild(this);
      }
    },

    /**
     * Appends a child to the current brick model
     * @param child The child brick model to append
     */
    appendChild:function(child) {
      if(this.children.indexOf(child) == -1) {
        this.children.push(child);
        child.appendParent(this);
        // Also plug child's views
        for(view in this.views) {
          this.views[view].appendChildFromBrick(child);
        }
      }
    },

    /**
     * Removes a child from the current brick model
     * @param child The child brick model to remove
     */
    removeChild:function(child) {
      var pos = this.children.indexOf(child)
      if(pos !== -1) {
        this.children.splice(pos,1);
        child.removeParent(this);
        // Also unplug views
        for(view in this.views) {
          this.views[view].removeChildFromBrick(child);}
      }
    },

    /**
     * Appends a list of views to the current brick model
     * @param viewList The list of views to append
     */
    appendViews:function(viewList) {
      for(var i=0;i<viewList.length;i++) {
        if(this.views.indexOf( viewList[i] ) === -1) {
          this.views.push( viewList[i] );
          viewList[i].model = this;
        }
      }
    },

    /**
     * Removes a list of views from the current brick model
     * @param viewList The list of views to remove
     */
    removeViews:function(viewList) {
      var newViewList = [];
      for(var i=0;i<this.views.length;i++) {
        if(viewList.indexOf(this.views[i]) === -1) {
          newViewList.push(this.views[i]);
        }
        else {
          this.views[i].model = null;
        }
      }
      this.views = newViewList;
    },
  });
  // Return the reference to the Brick constructor
  return Brick;
});
