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
            "click .btn-keyboard": "onClickKeyboard",
            "click .btn-prog": "onClickProg",
            "click #end-edit-button": "onClickEndEdit",
            "change .lamp-color-picker": "onChangeLampColorNode",
            "change .number-input": "onChangeNumberValue"
        },
        /**
         * @constructor
         */
        initialize: function() {
            /*if (typeof this.model !== "undefined") {
             this.userInputSource = this.model.get("name") + " " + $.i18n.t("language.written-by") + " Bob pour Alice ";
             }*/
            this.Mediator = new Mediator();
            this.Mediator.loadProgramJSON(this.model.get("body"));

        },
        onClickEndEdit: function(e) {
            this.model.set("body", this.Mediator.programJSON);
            this.model.set("modified", false);
            if (this.Mediator.isValid) {
                this.model.set("runningState", "DEPLOYED");
            } else {
                this.model.set("runningState", "INVALID");
            }
            this.model.save();
            appRouter.navigate("#programs/" + this.model.get("id"), {trigger: true});
            this.undelegateEvents();
        },
        onClickKeyboard: function(e) {
            button = e.target;
            while (button !== null && typeof button.classList === 'undefined' || !button.classList.contains('btn-keyboard')) {
                button = button.parentNode;
            }
            this.Mediator.buttonPressed(button);
        },
        onClickProg: function(e) {
            button = e.target;
            while (button !== null && typeof button.classList === 'undefined' || !button.classList.contains('btn-prog')) {
                button = button.parentNode;
            }
            this.Mediator.setCursorAndBuildKeyboard(button.id);
        },
        onChangeLampColorNode: function(e) {
            e.stopPropagation();
            var iid = $(e.currentTarget).attr("target-id");
            var value = e.currentTarget.selectedOptions[0].value;
            this.Mediator.setNodeAttribute(iid, "methodName", value);
          //console.log(e);  
        },
        onChangeNumberValue: function(e) {
            e.stopPropagation();
            var iid = $(e.currentTarget).attr("target-id");
            var value = e.currentTarget.value;
            this.Mediator.setNodeAttribute(iid, "value", value);
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

            if (this.model) {


                this.Mediator.buildInputFromJSON();

                //this.Mediator.buildActionKeys();

                // fix the programs list size to be able to scroll through it
                this.resizeDiv($(self.$el.find(".editorWorkspace")[0]), true);

            }
            // translate the view
            this.$el.i18n();

            return this;
        }

    });
    return ProgramEditorView;
});