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
            "mouseup .btn-keyboard": "onClickKeyboard",
            "mouseup .btn-prog": "onClickProg",
            "click #end-edit-button": "onClickEndEdit",
            "change .lamp-color-picker": "onChangeLampColorNode",
            "change .number-input": "onChangeNumberValue",
            "change .hour-picker, .minute-picker": "onChangeClockValue"
        },
        /**
         * @constructor
         */
        initialize: function() {
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
            
            // clearing selection 
            this.resetSelection();
        },
        onChangeNumberValue: function(e) {
            e.stopPropagation();
            var iid = $(e.currentTarget).attr("target-id");
            var value = e.currentTarget.value;
            this.Mediator.setNodeAttribute(iid, "value", value);        
            
            // clearing selection 
            this.resetSelection();
        },
        onChangeClockValue: function(e) {
            e.stopPropagation();
            
            var iid = $(e.currentTarget).attr("target-id");
            
            var debugH = $("#clock-hour-"+iid);
            var debugM = $("#clock-minute-"+iid);
            var hourValue = $("#clock-hour-"+iid)[0].selectedOptions[0].value;
            var minuteValue = $("#clock-minute-"+iid)[0].selectedOptions[0].value;
            
            this.Mediator.setNodeAttribute(iid, "eventValue", devices.getCoreClock().getClockAlarm(hourValue,minuteValue));
            
            // clearing selection 
            this.resetSelection();
        },
        resetSelection:function() {
            $(".expected-elements").html("");
            this.Mediator.setCurrentPos(-1);
            this.Mediator.buildInputFromJSON();
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