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
            this.Mediator.programJSON = this.model.get("body");
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

            // change its running state
            program.set("runningState", "STARTED");

            // send modification to the backend
            program.save();

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

            // change its running state
            program.set("runningState", "STOPPED");

            // send modification to the backend
            program.save();

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
        /**
         * Render the editor view
         */
        render: function() {

            var self = this;

            // render the editor with the program
            this.$el.html(this.tplEditor({
                program: this.model
            }));
            
            if(this.model){
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

                // try to compile the program to show the potential errors
                /*if (typeof this.model !== "undefined") {
                    this.compileProgram();
                }-*/
                this.Mediator.buildInputFromJSON();

                // fix the programs list size to be able to scroll through it
                this.resizeDiv($(self.$el.find(".editorWorkspace")[0]), true);

                // disable start button if there is unsaved changes
                //$(".start-program-button").prop("disabled", this.model.get("modified"));
            }
            // translate the view
            this.$el.i18n();

            return this;
        }

    });
    return ProgramReaderView;
});