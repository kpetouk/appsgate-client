define([
  "app",
  "views/utils"
], function(App) {

  var uid = 0;
  var AppsGateView = {};

  /**
   * Basic AppsGate View class extending the Backbone View class and an abstract class for all the views in the application
   */
  AppsGateView = Backbone.View.extend({

    /**
     * Returns a unique id of this view
     */
    getUniqueId:function() {
      uid++;
      return 'ViewId_' + uid;
    },

    /**
     * constructor
     */
    initialize:function() {
      this.uid = this.getUniqueId();
      this.root	= null;
      this.children = [];
      this.parent		= null;
      if(this.model){
        this.model.appendViews([this]);
      }
    },

    /**
     * Appends a parent to this view
     * @param parent The parent view to this one
     */
    setParent:function(p) {
      if(this.parent === p) {
        return;
      }
      if(this.parent) {
        var parent = this.parent;
        this.parent = null;
        parent.removeChild(this);
      }
      this.parent = p;
      if(p) {
        p.appendChild(this);
      }
    },

    /**
     * Appends a child view to this view
     * @param child The child view to append
     */
    appendChild:function(child) {
      if(this.children.indexOf(child) == -1) {
        this.children.push(child);
        this.primitivePlug(child);
        child.setParent(this);
      }
    },

    /**
     * Removes a child view from this view
     * @param child The child view to remove
     */
    removeChild:function(child) {
      var pos = this.children.indexOf(child)
      if(pos !== -1) {
        this.children.splice(pos,1);
        this.primitiveUnPlug(child);
        child.setParent(null);
      }
    },

    /**
     * Appends a child view to this view from a given brick model
     * @param brick The brick model object from which build the child view
     * @param fParams The initialization parameters for the new view
     * @param constrName The name of the constructor of the view to build
     */
    appendChildFromBrick:function(brick, fParams, constrName) {
      // If a view constructor has been specified...
      if(constrName) {
        var view = brick.getNewView(constrName);
        if(view) {fParams.apply(view, []);
          this.appendChild(view);
          return view;}
      }
      // If there is an available existing view
      for(var p in brick.views) {
        var view = brick.views[p];
        if(view.parent === null) {
          fParams.apply(view, []);
          this.appendChild(view);
          return view;
        }
        else {
          console.log("\tchild view",p,"is still plugged to",view.parent);}
      }
      // Last, if there is a factory...
      var view = brick.getNewView();
      if(view) {
        if(fParams){
          fParams.apply(view, []);
        }
        this.appendChild(view);
        return view;
      }
      return null;
    },

    /**
     * Removes this view from a given brick
     * @param brick The brick model object to remove the view from
     */
    removeChildFromBrick:function(brick) {
      for(var p in brick.views) {
        if(brick.views[p].parent === this) {
          this.removeChild(brick.views[p]);
          break;
        }
      }
    },

    /**
     * Renders this view
     */
    render:function() {
      if(!this.root) {
        this.root = document.createElement('div');
        this.root.classList.add('BrickRoot');
        for(var i=0;i<this.children.length;i++) {
          this.primitivePlug(this.children[i]);
        }
      }
      return this.root;
    },

    /**
     * Removes the elements rendered by this view
     */
    deletePrimitives:function() {
      if(this.root) {
        this.root.parentNode.removeChild(this.root);
        this.root=null;
      }
    },

    /**
     * Forces rendering of this view
     */
    forceRender:function() {
      var primitiveParent;
      if(this.root) {primitiveParent = this.root.parentNode;
        this.deletePrimitives();
      }
      else {
        primitiveParent = null;
      }
      var root = this.Render();
      if(primitiveParent) {
        primitiveParent.appendChild(root);
      }
    },

    /**
     * Appends the elements rendered by a given child view to the elements rendered by this view
     * @param child The child view to render
     */
    primitivePlug:function(child) {
      var parent = this.Render(),
      node = child.Render();
      if(node.parentNode === null) {parent.append(node);}
    },

    /**
     * Removes the elements rendered by a child view from the elements rendered by this view
     * @param child The child view to remove
     */
    primitiveUnPlug:function(child) {
      if(child.root && child.root.parentNode) {child.root.parentNode.removeChild(child.root);}
    }

  });

  // Return the reference to the View
  return AppsGateView;
});
