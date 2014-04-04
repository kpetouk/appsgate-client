define([
    "app",
    "text!templates/places/menu/menu.html",
    "text!templates/places/menu/placeContainer.html",
    "text!templates/devices/menu/coreClockContainer.html",
    "text!templates/places/menu/addButton.html"
], function(App, placeMenuTemplate, placeContainerMenuTemplate, coreClockContainerMenuTemplate, addPlaceButtonTemplate) {

    var PlaceMenuView = {};
    /**
     * Render the side menu for the places
     */
    PlaceMenuView = Backbone.View.extend({
        tpl: _.template(placeMenuTemplate),
        tplPlaceContainer: _.template(placeContainerMenuTemplate),
        tplCoreClockContainer: _.template(coreClockContainerMenuTemplate),
        tplAddPlaceButton: _.template(addPlaceButtonTemplate),
        /**
         * Bind events of the DOM elements from the view to their callback
         */
        events: {
            "click a.list-group-item": "updateSideMenu",
            "show.bs.modal #add-place-modal": "initializeModal",
            "hidden.bs.modal #add-place-modal": "toggleModalValue",
            "click #add-place-modal button.valid-button": "validEditName",
            "keyup #add-place-modal input": "validEditName"
        },
        /**
         * Listen to the places collection update and refresh if any
         * 
         * @constructor
         */
        initialize: function() {
            this.listenTo(places, "add", this.render);
            this.listenTo(places, "change", this.render);
            this.listenTo(places, "remove", this.render);
            this.listenTo(devices, "change", this.onChangedDevice);
        },
        /**
         * Method called when a device has changed
         * @param model Model that changed, Device in that cas
         * @param collection Collection that holds the changed model
         * @param options Options given with the change event
         */
        onChangedDevice: function(model, options) {
            // a device has changed
            // if it's the clock, we refresh the clock only
            if (typeof options !== "undefined" && options.clockRefresh) {
                this.refreshClockDisplay();
            }
            // otherwise we rerender the whole view
            else {
                this.render();
            }
        },
        /**
         * Refreshes the time display without rerendering the whole screen
         */
        refreshClockDisplay: function() {

            if (typeof devices.getCoreClock() !== "undefined") { // dirty hack to avoid a bug when reconnecting - TODO
                //remove existing node
                $(this.$el.find(".list-group")[0]).children().remove();

                //refresh the clock
                $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
                    device: devices.getCoreClock(),
                    active: Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
                }));
            }
        },
        /**
         * Update the side menu to set the correct active element
         * 
         * @param e JS click event
         */
        updateSideMenu: function(e) {
            _.forEach($("a.list-group-item"), function(item) {
                $(item).removeClass("active");
            });

            $(e.currentTarget).addClass("active");
        },
        /**
         * Clear the input text, hide the error message and disable the valid button by default
         */
        initializeModal: function() {
            $("#add-place-modal input").val("");
            $("#add-place-modal .text-danger").addClass("hide");
            $("#add-place-modal .valid-button").addClass("disabled");

            // the router that there is a modal
            appRouter.isModalShown = true;
        },
        /**
         * Tell the router there is no modal anymore
         */
        toggleModalValue: function() {
            appRouter.isModalShown = false;
        },
        /**
         * Check the current value of the input text and show an error message if needed
         * 
         * @return false if the typed name already exists, true otherwise
         */
        checkPlace: function() {
            // name is empty
            if ($("#add-place-modal input").val() === "") {
                $("#add-place-modal .text-danger")
                        .text($.i18n.t("modal-add-place.place-name-empty"))
                        .removeClass("hide");
                $("#add-place-modal .valid-button").addClass("disabled");

                return false;
            }

            // name already exists
            if (places.where({name: $("#add-place-modal input").val()}).length > 0) {
                $("#add-place-modal .text-danger")
                        .text($.i18n.t("modal-add-place.place-already-existing"))
                        .removeClass("hide");
                $("#add-place-modal .valid-button").addClass("disabled");

                return false;
            }

            // ok
            $("#add-place-modal .text-danger").addClass("hide");
            $("#add-place-modal .valid-button").removeClass("disabled");

            return true;
        },
        /**
         * Check if the name of the place does not already exist. If not, update the place
         * Hide the modal when done
         * 
         * @param e JS event
         */
        validEditName: function(e) {
            if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
                // create the place if the name is ok
                if (this.checkPlace()) {

                    // instantiate the place and add it to the collection after the modal has been hidden
                    $("#add-place-modal").on("hidden.bs.modal", function() {
                        // instantiate a model for the new place
                        var place = places.create({
                            name: $("#add-place-modal input").val(),
                            devices: []
                        });

                        // send the place to the backend
                        place.save();

                        // add it to the collection
                        //places.add(place);

                        // tell the router that there is no modal any more
                        appRouter.isModalShown = false;
                    });

                    // hide the modal
                    $("#add-place-modal").modal("hide");
                }
            } else if (e.type === "keyup") {
                this.checkPlace();
            }
        },
        /**
         * Render the side menu
         */
        render: function() {
            if (!appRouter.isModalShown) {
                var self = this;

                // initialize the content
                this.$el.html(this.tpl());

                // put the time on the top of the menu
                if (typeof devices.getCoreClock() !== "undefined") { // dirty hack to avoid a bug when reconnecting - TODO
                    $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
                        device: devices.getCoreClock(),
                        active: Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
                    }));
                }

                // "add place" button to the side menu
                this.$el.append(this.tplAddPlaceButton());

                // for each place, add a menu item
                this.$el.append(this.tpl());

                // put the unlocated devices into a separate group list
                //this.$el.append(this.tpl());
                $(this.$el.find(".list-group")[1]).append(this.tplPlaceContainer({
                    place: places.get("-1"),
                    active: Backbone.history.fragment.split("/")[1] === "-1" ? true : false
                }));

                places.forEach(function(place) {
                    if (place.get("id") !== "-1") {
                        $(self.$el.find(".list-group")[1]).append(self.tplPlaceContainer({
                            place: place,
                            active: Backbone.history.fragment.split("/")[1] === place.get("id") ? true : false
                        }));
                    }
                });

                // translate the menu
                this.$el.i18n();

                // resize the menu
                this.resizeDiv($(self.$el.find(".list-group")[1]));

                return this;
            }
        }
    });
    return PlaceMenuView;
});