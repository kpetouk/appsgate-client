define([
  "app",
  "modules/mediator",
  "text!templates/program/reader/reader.html"
  ], function(App, Mediator, programEditorTemplate) {

    var ProgramReaderView = {};
    /**
    * Render the editor view
    */
    ProgramReaderView = Backbone.View.extend({
      tplEditor: _.template(programEditorTemplate),
      events: {
        "click button.start-program-button": "onStartProgramButton",
        "click button.stop-program-button": "onStopProgramButton",
        "click button.delete-program-button": "onDeleteProgramButton",
      },
      /**
      * @constructor
      */
      initialize: function() {
        this.Mediator = new Mediator();
        if(typeof this.model !== "undefined"){
          this.Mediator.loadProgramJSON(this.model.get("body"));
          this.listenTo(this.model, "change", this.refreshDisplay);
        }
        this.Mediator.readonly = true;

        this.listenTo(devices, "change", this.refreshDisplay);
        this.listenTo(services, "change", this.refreshDisplay);
      },
      /**
      * Callback to start a program
      *
      * @param e JS mouse event
      */
      onStartProgramButton: function(e) {
        e.preventDefault();

        // get the program to start
        var program = programs.get($(e.currentTarget).attr("id"));

        program.set("runningState", "PROCESSING");
        program.remoteCall("callProgram", [{type: "String", value: program.get("id")}]);

        // refresh the menu
        this.render();

        return false;
      },
      /**
      * Callback to stop a program
      *
      * @param e JS mouse event
      */
      onStopProgramButton: function(e) {
        e.preventDefault();

        // get the program to stop
        var program = programs.get($(e.currentTarget).attr("id"));

        program.set("runningState", "DEPLOYED");
        program.remoteCall("stopProgram", [{type: "String", value: program.get("id")}]);
        // refresh the menu
        this.render();

        return false;
      },
      /**
      * Callback when the user has clicked on the button to remove a program. Remove the program
      */
      onDeleteProgramButton: function() {
        // delete the program
        this.model.destroy();

        // navigate to the list of programs
        appRouter.navigate("#programs", {trigger: true});
      },
      refreshDisplay: function(e) {
        if (e.get("type") !== 21) {
          this.Mediator.buildInputFromJSON();
          // translate the view
          this.$el.i18n();
          var self = this;
          _.defer(function() {
            self.applyReadMode();
          });
        }
      },
      applyReadMode: function() {
        // setting selects in read mode
        $('.editorWorkspace').find('select').prop('disabled', true);
        $('.editorWorkspace :input').prop('disabled', true);
        $(".programInput").find(".btn").addClass("btn-read-only");
        $(".programInput").find(".btn-primary").addClass("btn-primary-ro");
        $(".programInput").find(".btn-prog-action").addClass("btn-prog-action-ro");
        $(".programInput").find(".btn-prog-device").addClass("btn-prog-device-ro");
        $(".programInput").find(".btn-prog-service").addClass("btn-prog-service-ro");
        $(".programInput").find("select").replaceWith(function() {
          return '<span>' + this.selectedOptions[0].innerHTML + '</span>';
        });
        $(".programInput").find("input").replaceWith(function() {
          return '<span>' + this.value + '</span>';
        });
        $(".programInput").find(".glyphicon-trash").hide();
      },
      /**
      * Render the editor view
      */
      render: function() {

        var self = this;

        // render the editor with the program
        this.$el.html(this.tplEditor({
          program: this.model
        }));

        if (this.model) {
          // initialize the popover
          this.$el.find("#delete-popover").popover({
            html: true,
            content: "<button type='button' class='btn btn-danger delete-program-button'>" + $.i18n.t("form.delete-button") + "</button>",
            placement: "bottom"
          });

          // put the name of the place by default in the modal to edit
          if (typeof this.model !== 'undefined') {
            $("#edit-program-name-modal .program-name").val(this.model.get("name"));
          }

          // hide the error message
          $("#edit-program-name-modal .text-error").hide();

          this.Mediator.buildInputFromJSON();

          // fix the programs list size to be able to scroll through it
          this.resizeDiv($(self.$el.find(".editorWorkspace")[0]), true);

          $(".programInput").height("auto");
        }
        // translate the view
        this.$el.i18n();

        this.applyReadMode();

        return this;
      }

    });
    return ProgramReaderView;
  });
