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

  // collection
  Program.Collection = Backbone.Collection.extend({
    model: Program.Model,

    initialize:function() {
      var self = this;

      // sort the programs alphabetically
      this.comparator = function(place) {
        return place.get("name");
      };

      // listen to the event when the list of programs is received
      dispatcher.on("listPrograms", function(programs) {
        _.each(programs, function(program) {
          self.add(program);
        });

        dispatcher.trigger("programsReady");
      });

      // listen to the event when a program appears and add it
      dispatcher.on("newProgram", function(program) {
        self.add(program);

        // update the grammar to take the new program in consideration
        if (typeof window.grammar !== "undefined") {
          delete window.grammar;
        }
        window.grammar = new Grammar();
      });

      // listen to the event when a program has been removed
      dispatcher.on("removeProgram", function(program) {
        var removedProgram = programs.get(program.id);
        programs.remove(removedProgram);

        // update the grammar to remove the program from the grammar
        if (typeof window.grammar !== "undefined") {
          delete window.grammar;
        }
        window.grammar = new Grammar();
      });

      // listen to the event when a program has been updated
      dispatcher.on("updateProgram", function(program) {
        programs.get(program.id).set(program);
      });

      // send the request to fetch the programs
      communicator.sendMessage({
        method: "getPrograms",
        args: [],
        callId: "listPrograms"
      });
    }
  });
});
