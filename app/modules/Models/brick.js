define([
  "app"
], function(App) {

  var Brick = {};

  /**
   * Brick Model class extending the Backbone model class and an abstract class for all the bricks in the application (universes, places, devices, services, programs...)
   */
  Brick = Backbone.Model.extend({

    initialize:function() {
      var self = this;
      Brick.__super__.initialize.apply(this, arguments);
      this.children = [];
      this.parents = [];
      this.views = [];
      this.viewFactories = {};

			this.x = this.getProperty("x")?parseInt(this.getProperty("x")):0;
			this.y = this.getProperty("y")?parseInt(this.getProperty("y")):0;
			this.w = this.getProperty("w")?parseInt(this.getProperty("w")):1;
			this.h = this.getProperty("h")?parseInt(this.getProperty("h")):1;
      
      dispatcher.on("newSpace-" + this.cid, function(id) {
        self.set("id", id);
      });

    },

    // Get the value of an attribute.
    getProperty: function(prop) {
      var result = null;
      var properties = this.get("properties")
      for(p in properties) {
        if(properties[p].key === prop){
          result = properties[p].value;
          break;
        }
      }
      return result;
    },

    setProperty:function(key,value) {
      var added = false;
      var properties = this.get("properties")?this.get("properties"):[];
      if(properties.length > 0) {
        for(p in properties) {
          if(properties[p].key === key) {
            properties[p].value = value;
            added = true;
            break;
          }
        }
      }
      if (!added) {
        properties.push({"key":key, "value":value});
        this.set("properties", properties);
      }
    },

    getTag: function(tagName) {
      var result = "";
      var tags = this.get("tags")
      for(t in tags) {
        if(tags[t].key === tagName){
          result = tags[t].value;
          break;
        }
      }
      return result;
    },

    /**
     * Send a message to the server to perform a remote call
     * 
     * @param method Remote method name to call
     * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
     * @param callId Identifier of the message
     */
    remoteCall:function(method, args, callId) {
      // build the message
      var messageJSON = {
        method		: method,
        args		: args
      };

      if (typeof callId !== "undefined") {
        messageJSON.callId = callId;
      }

      // send the message
      communicator.sendMessage(messageJSON);
    },

    /**
     * Override its synchronization method to send a notification on the network
     */
    sync:function(method, model) {
      // copy all useful data to attributes to keep them persistent
      if(model.type) model.set("type", model.type);
      if(model.parents.length > 0) model.set("parent", model.parents[0].get("id"));
      var childrenIds = [];
      for(c in model.children) {
        childrenIds.push(model.children[c].get("id"));
      }
      model.set("children", childrenIds);
			model.setProperty("x", "" + model.x);
			model.setProperty("y", "" + model.y);
			model.setProperty("w", "" + model.w);
			model.setProperty("h", "" + model.h);

      switch (method) {
        case "create":
          this.remoteCall("newSpace", [{ type : "String", value : model.get("parent") }, { type : "String", value : model.get("type") }, { type : "JSONObject", value : model.toJSON() }], "newSpace-" + model.cid);
        break;
        case "delete":
          this.remoteCall("removeSpace", [{ type : "String", value : model.get("id") }], "removeSpace-" + model.cid);
        break;
        case "update":
          this.remoteCall("updateSpace", [{ type : "String", value : model.get("id") }, { type : "JSONObject", value : model.toJSON() }], "updateSpace-" + model.cid);
        break;
        default:
          break;
      }
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
     * @param node to append to
     */
    getNewView:function(name, root) {
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
          res = new fact.constr({model:this, el:root});}
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
      this.set("parent", parent.get("id"));
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
     * Appends the children models based on the ids contained in the children attribute of this brick
     */
    initChildren:function() {
      var self = this;
			
      // initializing current node children
      this.get("children").forEach(function(childId) {
        var nodes = AppsGate.Root.where({id:childId});
        if(nodes.length === 1){
          self.appendChild(nodes[0]);
          nodes[0].initChildren();
        }
        else if(nodes.length > 1){
          console.log("WARNING! Several bricks seem to share the same id " + childId);
        }
      });
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

    appendChildWithCoord:function(child, x, y) {
      if(this.children.indexOf(child) == -1) {
        this.children.push(child);
        child.appendParent(this);
        // Also plug child's views
        for(view in this.views) {
          var curView = this.views[view];
          var screenPoint = $("#svgspace")[0].createSVGPoint();
          screenPoint.x = x;
          screenPoint.y = y;
          var CTM = curView.root.node.getCTM();
          var globalCTM = curView.groot.node.getCTM();
          var targetPoint = screenPoint.matrixTransform( curView.groot.node.getScreenCTM().inverse() );
          var newX = Math.round(targetPoint.x/curView.size);
          var newY = Math.round(targetPoint.y/curView.size);
					
					child.x = newX;
					child.y = newY;
					
          curView.appendChildFromBrick	( child, function() {this.x = newX; this.y = newY; this.w = 1; this.h = 1;}, undefined, curView.getChildrenContext(1, 1));
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
