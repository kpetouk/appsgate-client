define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var LoginView = require("views/login/loginview");
    var HomeView = require("views/homeview");
    
    var PlacesRouter = require("routers/place");
    var DevicesRouter = require("routers/device");
    var ServicesRouter = require("routers/service");
    var ProgramsRouter = require("routers/program");
    
    var mainTemplate = require("text!templates/home/main.html");
    var navbarTemplate = require("text!templates/home/navbar.html");
    var circleMenuTemplate = require("text!templates/home/circlemenu.html");

    // define the application router
    var Router = Backbone.Router.extend({
        
        placesRouter: new PlacesRouter(),
        devicesRouter: new DevicesRouter(),
        servicesRouter: new ServicesRouter(),
        programsRouter: new ProgramsRouter(),
        
        maintemplate : _.template(mainTemplate),
        navbartemplate : _.template(navbarTemplate),
        circlemenutemplate : _.template(circleMenuTemplate),
        
        routes: {
            "": "login",
            "login": "login",
            "reset": "home",
            "home": "home",
            "places": "habitat",
            "devices": "devices",
            "services": "services",
            "programs": "programs",
        },
        // default route of the application
        login: function() {
            this.showView(new LoginView());
        },
        home: function() {
            this.showView(new HomeView());
        },
        habitat: function() {
            this.placesRouter.list();
        },
        devices: function() {
            this.devicesRouter.list();
        },
        services: function() {
            this.servicesRouter.list();
        },
        programs: function() {
            this.programsRouter.list();
        },
        // update the side menu w/ new content
        showMenuView: function(menuView) {
            // remove and unbind the current view for the menu
            if (this.currentMenuView) {
                this.currentMenuView.close();
            }

            $("#main").html(this.navbartemplate());
            $("#main").append(this.maintemplate());
            $("#main").append(this.circlemenutemplate());
                
            this.currentMenuView = menuView;
            this.currentMenuView.render();
            $(".aside-menu").html(this.currentMenuView.$el);

            // update the navbar - the navbar only needs to be updated when the users changed the views (places, devices or programs) so that the side menu
            // has to be updated
            // remove active class
            /*_.forEach($(".navbar-nav > li"), function(navItem) {
                $(navItem).removeClass("active");
            });
            // add active class to the correct menu item
            if (Backbone.history.fragment.indexOf("places") !== -1) {
                $($(".navbar-nav > li")[0]).addClass("active");
            } else if (Backbone.history.fragment.indexOf("devices") !== -1) {
                $($(".navbar-nav > li")[1]).addClass("active");
            } else if (Backbone.history.fragment.indexOf("programs") !== -1) {
                $($(".navbar-nav > li")[2]).addClass("active");
            }*/
            
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


        },
        showDetailsView: function(view) {
           // remove and unbind the current view
            if (this.currentView) {
                this.currentView.close();
            }

            // update the content
            this.currentView = view;
            $(".body-content").html(this.currentView.$el);
            this.currentView.render(); 
        },
        showView: function(view) {
            // remove and unbind the current view
            if (this.currentView) {
                this.currentView.close();
            }

            // update the content
            this.currentView = view;
            this.currentView.render();
        }
    });

    module.exports = Router;

});