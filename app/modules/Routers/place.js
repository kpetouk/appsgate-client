define([
    "app",
    "views/place/menu",
    "views/place/details"
], function(App, PlaceMenuView, PlaceDetailsView) {

    var PlaceRouter = {};
    // router
    PlaceRouter = Backbone.Router.extend({
        routes: {
            "places": "list",
            "places/:id": "details"
        },
        // list all the places
        list: function() {
            // display the side menu
            appRouter.showMenuView(new PlaceMenuView());

            // set active the first element - displayed by default
            $($($(".aside-menu .list-group")[1]).find(".list-group-item")[0]).addClass("active");

            // display the first place
            appRouter.showDetailsView(new PlaceDetailsView({model: places.at(0)}));

            // update the url
            appRouter.navigate("#places/" + places.at(0).get("id"));
        },
        // show the details of a places (i.e. list of devices in this place)
        details: function(id) {
            appRouter.showDetailsView(new PlaceDetailsView({model: places.get(id)}));
        }
    });
    return PlaceRouter;
});