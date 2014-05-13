define([
    "app",
    "views/program/menu",
    "views/program/reader",
    "views/program/editor"
], function(App, ProgramMenuView, ProgramReaderView, ProgramEditorView) {

    var ProgramRouter = {};
    // router
    ProgramRouter = Backbone.Router.extend({
        routes: {
            "programs": "list",
            "programs/:id": "reader",
            "programs/editor/:id": "editor",
        },
        list: function() {
            // display the side menu
            appRouter.showMenuView(new ProgramMenuView());

            // set active the first element - displayed by default
            $($($(".aside-menu .list-group")[1]).find(".list-group-item")[0]).addClass("active");

            // display the first program
            appRouter.showDetailsView(new ProgramReaderView({model: programs.at(0)}));

            // update the url if there is at least one program
            if (programs.length > 0) {
                appRouter.navigate("#programs/" + programs.at(0).get("id"));
            }

            $(".breadcrumb").html("<li><a href='#home'><span data-i18n='navbar.home'/></a></li>");
            $(".breadcrumb").append("<li class='active'><span data-i18n='navbar.programs'/></li>");
            appRouter.translateNavbar();
        },
        reader: function(id) {
            // display the side menu
            appRouter.showMenuView(new ProgramMenuView());

            // display the requested program
            appRouter.showDetailsView(new ProgramReaderView({model: programs.get(id)}));

            // update the url
            appRouter.navigate("#programs/" + id);

            appRouter.currentMenuView.updateSideMenu();

            $(".breadcrumb").html("<li><a href='#home'><span data-i18n='navbar.home'/></a></li>");
            $(".breadcrumb").append("<li class='active'><span data-i18n='navbar.programs'/></li>");
            appRouter.translateNavbar();
        },
        editor: function(id) {
            // remove and unbind the current view for the menu
            if (appRouter.currentMenuView) {
                appRouter.currentMenuView.close();
            }
            if (appRouter.currentView) {
                appRouter.currentView.close();
            }

            $("#main").html(appRouter.navbartemplate());

            appRouter.currentMenuView = new ProgramEditorView({el:$("#main"),model: programs.get(id)});
            appRouter.currentMenuView.render();

            $("#main").append(appRouter.circlemenutemplate());

            // initialize the circle menu
            $(".controlmenu").circleMenu({
                trigger: "click",
                item_diameter: 50,
                circle_radius: 150,
                direction: 'top-right'
            });

            $(".navmenu").circleMenu({
                trigger: "click",
                item_diameter: 50,
                circle_radius: 150,
                direction: 'top'
            });

            appRouter.navigate("#programs/editor/" + id);

            $(".breadcrumb").html("<li><a href='#home'><span data-i18n='navbar.home'/></a></li>");
            $(".breadcrumb").append("<li><a href='#programs'><span data-i18n='navbar.programs'/></a></li>");
            $(".breadcrumb").append("<li class='active'><span>" + programs.get(id).get("name") + "</span></li>");
            appRouter.translateNavbar();
        }

    });
    return ProgramRouter;
});
