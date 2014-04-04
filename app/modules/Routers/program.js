define([
    "app",
    "views/program/menu",
    "views/program/editor"
], function(App, ProgramMenuView, ProgramEditorView) {

    var ProgramRouter = {};
    // router
    ProgramRouter = Backbone.Router.extend({
        routes: {
            "programs": "list",
            "programs/:id": "details"
        },
        list: function() {
            // display the side menu
            appRouter.showMenuView(new ProgramMenuView());

            // set active the first element - displayed by default
            $($($(".aside-menu .list-group")[1]).find(".list-group-item")[0]).addClass("active");

            // display the first program
            appRouter.showDetailsView(new ProgramEditorView({model: programs.at(0)}));

            // update the url if there is at least one program
            if (programs.length > 0) {
                appRouter.navigate("#programs/" + programs.at(0).get("id"));
            }
        },
        details: function(id) {
            appRouter.showDetailsView(new ProgramEditorView({model: programs.get(id)}));
        }

    });
    return ProgramRouter;
});