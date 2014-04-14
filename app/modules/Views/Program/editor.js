define([
    "app",
    "modules/mediator",
    "text!templates/program/editor/editor.html"
], function(App, Mediator, programEditorTemplate) {

    var ProgramEditorView = {};
    /**
     * Render the editor view
     */
    ProgramEditorView = Backbone.View.extend({
        tplEditor: _.template(programEditorTemplate),
        events: {
            "click button.btn-keyboard": "onClickKeyboard",
            "click button.btn-prog": "onClickProg",
            "click .programInput > span": "onClickSourceElement",
            "click #end-edit-button": "onClickEndEdit"
        },
        /**
         * @constructor
         */
        initialize: function() {
            /*if (typeof this.model !== "undefined") {
                this.userInputSource = this.model.get("name") + " " + $.i18n.t("language.written-by") + " Bob pour Alice ";
            }*/
            this.Mediator = new Mediator();
            //this.Mediator.programJSON = this.model.get("body");
            
        },
        onClickEndEdit:function(e){
            this.model.set("body", this.Mediator.programJSON);
            this.model.set("modified", false);
            this.model.save();
            appRouter.navigate("#programs/" + this.model.get("id"), {trigger: true});
        },
        onClickKeyboard:function(e){
            button = e.target;
                        while (button !== null && typeof button.classList === 'undefined' || !button.classList.contains('btn-keyboard')) {
                button = button.parentNode;
            }

            this.Mediator.buttonPressed(button);
        },
        onClickProg:function(e){
                        button = e.target;
                        while (button !== null && typeof button.classList === 'undefined' || !button.classList.contains('btn-prog')) {
                button = button.parentNode;
            }

            this.Mediator.setCurrentPos(button.id);
        },
        /**
         * Render the editor view
         */
        render: function() {

            var self = this;

            // render the editor with the program
            this.$el.append(this.tplEditor({
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
                
                //this.Mediator.buildInputFromJSON();
                this.Mediator.checkProgramAndBuildKeyboard();

                // fix the programs list size to be able to scroll through it
                this.resizeDiv($(self.$el.find(".editorWorkspace")[0]));

            }
            // translate the view
            this.$el.i18n();

            return this;
        }

    });
    return ProgramEditorView;
});