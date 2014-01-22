define([
  "jquery",
  "underscore",
  "backbone",
  "grammar",
  "text!templates/program/menu/menu.html",
  "text!templates/program/menu/programContainer.html",
  "text!templates/program/menu/addButton.html",
  "text!templates/devices/menu/coreClockContainer.html",
  "text!templates/program/editor/editor.html"
], function($, _, Backbone, Grammar, programMenuTemplate, programContainerMenuTemplate, addProgramButtonTemplate, coreClockContainerMenuTemplate, programEditorTemplate) {
  // initialize the module
  var Program = {};

  // router
  Program.Router = Backbone.Router.extend({
    routes : {
      "programs"                      : "list",
      "programs/:id"          : "details"
    },

    list:function() {
      // display the side menu
      appRouter.showMenuView(new Program.Views.Menu());

      // set active the first element - displayed by default
      $($($(".aside-menu .list-group")[1]).find(".list-group-item")[0]).addClass("active");

      // display the first program
      appRouter.showView(new Program.Views.Editor({ model : programs.at(0) }));

      // update the url if there is at least one program
      if (programs.length > 0) {
        appRouter.navigate("#programs/" + programs.at(0).get("id"));
      }
    },

    details:function(id) {
      appRouter.showView(new Program.Views.Editor({ model : programs.get(id) }));
    }

  });

  // instantiate the router
  var router = new Program.Router();

  // model
  Program.Model = Backbone.Model.extend({
    // default values
    defaults: {
      runningState : "DEPLOYED",
      modified : true,
      userInputSource : "",
      source : {
        programName : "",
        seqParameters : [],
        author : "",
        target : "",
        daemon : "true",
        seqDefinitions : [],
        seqRules : [
          []
        ]
      }
    },

    /**
     * Extract the name and the daemon attributes from the source to simplify their usage w/ backbone and in the templates
     * 
     * @constructor
     */
    initialize:function() {
      var self = this;

      // name
      if (typeof this.get("name") === "undefined") {
        this.set("name", this.get("source").programName);
      } else {
        this.get("source").programName = this.get("name");
      }

      // daemon
      if (typeof this.get("daemon") === "undefined") {
        this.set("daemon", this.get("source").daemon);
      }

      // when the source has been updated, update the attributes of the program model
      this.on("change:source", function() {
        this.set("name", this.get("source").programName);
        this.set("daemon", this.get("source").daemon);
      });

      // each program listens to the event whose id corresponds to its own id
      dispatcher.on(this.get("id"), function(updatedVariableJSON) {
        self.set(updatedVariableJSON.varName, updatedVariableJSON.value);
      });
    },

    /**
     * Send a message to the server to perform a remote call
     * 
     * @param method Remote method name to call
     * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
     */
    remoteCall:function(method, args) {
      communicator.sendMessage({
        method  : method,
        args    : args
      });
    },

    // override its synchronization method to send a notification on the network
    sync:function(method, model) {
      console.log(model.toJSON());
      switch (method) {
        case "create":
          // create an id to the program
          var id;
        do {
          id = "program-" + Math.round(Math.random() * 10000).toString();
        } while (programs.where({ id : id }).length > 0);
        model.set("id", id);

        this.remoteCall("addProgram", [{ type : "JSONObject", value : model.toJSON() }]);
        break;
        case "delete":
          this.remoteCall("removeProgram", [{ type : "String", value : model.get("id") }]);
        break;
        case "update":
          if (model.changedAttributes()) {
          _.keys(model.changedAttributes()).forEach(function(attribute) {
            if (attribute === "runningState") {
              if (model.get("runningState") === "STARTED") {
                model.remoteCall("callProgram", [{ type : "String", value : model.get("id") }]);
              } else {
                model.remoteCall("stopProgram", [{ type : "String", value : model.get("id") }]);
              }
            } else {
              model.remoteCall("updateProgram", [{ type : "JSONObject", value : model.toJSON() }]);
            }
          });
        } else {
          model.remoteCall("updateProgram", [{ type : "JSONObject", value : model.toJSON() }]);
        }
        break;
      }
    },

    /**
     * Converts the model to its JSON representation
     */
    toJSON:function() {
      return {
        id                              : this.get("id"),
        runningState    : this.get("runningState"),
        modified        : this.get("modified"),
        source                  : this.get("source"),
        userInputSource : this.get("userInputSource")
      };
    }
  });

});
