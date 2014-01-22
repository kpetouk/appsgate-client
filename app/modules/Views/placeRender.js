define([
        "jquery",
        "underscore",
        "backbone",
        "grammar",
        "text!templates/places/menu/menu.html",
        "text!templates/places/menu/placeContainer.html",
        "text!templates/devices/menu/coreClockContainer.html",
        "text!templates/places/menu/addButton.html",
        "text!templates/places/details/details.html",
        "i18next"
], function($, _, Backbone, Grammar, placeMenuTemplate, placeContainerMenuTemplate, coreClockContainerMenuTemplate, addPlaceButtonTemplate, placeDetailsTemplate) {
       
        /**
         * Namespace for the views
         */
        Place.Views = {};
		
		/**
         * Resizes the div to the maximum displayable size on the screen
         */     
        function resizeDiv(jqNode){
                if(typeof jqNode !== "undefined"){
                        jqNode[0].classList.add("div-scrollable");
                        setTimeout(function(){
                                var divSize = window.innerHeight-(jqNode.offset().top + jqNode.outerHeight(true) - jqNode.innerHeight());

                                // if there isn't enough space to display the whole div, we adjust its size to the screen
                                if(divSize<jqNode.outerHeight(true)){   
                                        jqNode.height(divSize);
                                }

                                // if there is an active element, make it visible
                                var activeItem = jqNode.children(".list-group-item.active")[0];
                                if(typeof activeItem !== "undefined"){
                                        jqNode.scrollTop((activeItem.offsetTop)-($(".list-group-item")[1].offsetTop));
                                }
                                // otherwise display the top of the list
                                else{
                                        jqNode.scrollTop(0);
                                }
                        }, 0);
                }
        }

        /**
         * Render the side menu for the places
         */
        Place.Views.Menu = Backbone.View.extend({
                tpl                                             : _.template(placeMenuTemplate),
                tplPlaceContainer               : _.template(placeContainerMenuTemplate),
                tplCoreClockContainer   : _.template(coreClockContainerMenuTemplate),
                tplAddPlaceButton               : _.template(addPlaceButtonTemplate),
                
                /**
                 * Bind events of the DOM elements from the view to their callback
                 */
                events: {
                        "click a.list-group-item"                                               : "updateSideMenu",
                        "show.bs.modal #add-place-modal"                                : "initializeModal",
                        "hidden.bs.modal #add-place-modal"                              : "toggleModalValue",
                        "click #add-place-modal button.valid-button"    : "validEditName",
                        "keyup #add-place-modal input"                                  : "validEditName"
                },
                
                /**
                 * Listen to the places collection update and refresh if any
                 * 
                 * @constructor
                 */
                initialize:function() {
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
                onChangedDevice:function(model, options) {
                        // a device has changed
                        // if it's the clock, we refresh the clock only
                        if(typeof options !== "undefined" && options.clockRefresh){
                                this.refreshClockDisplay();
                        }
                        // otherwise we rerender the whole view
                        else{
                                this.render();
                        }
                },

                /**
                 * Refreshes the time display without rerendering the whole screen
                 */
                refreshClockDisplay:function() {

                        if (typeof devices.getCoreClock() !== "undefined") { // dirty hack to avoid a bug when reconnecting - TODO
                                //remove existing node
                                $(this.$el.find(".list-group")[0]).children().remove();

                                //refresh the clock
                                $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
                                        device  : devices.getCoreClock(),
                                        active  : Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
                                }));
                        }
                },


                /**
                 * Update the side menu to set the correct active element
                 * 
                 * @param e JS click event
                 */
                updateSideMenu:function(e) {
                        _.forEach($("a.list-group-item"), function(item) {
                                $(item).removeClass("active");
                        });
                        
                        $(e.currentTarget).addClass("active");
                },
                
                /**
                 * Clear the input text, hide the error message and disable the valid button by default
                 */
                initializeModal:function() {
                        $("#add-place-modal input").val("");
                        $("#add-place-modal .text-danger").addClass("hide");
                        $("#add-place-modal .valid-button").addClass("disabled");
                        
                        // the router that there is a modal
                        appRouter.isModalShown = true;
                },
                
                /**
                 * Tell the router there is no modal anymore
                 */
                toggleModalValue:function() {
                        appRouter.isModalShown = false;
                },
                
                /**
                 * Check the current value of the input text and show an error message if needed
                 * 
                 * @return false if the typed name already exists, true otherwise
                 */
                checkPlace:function() {
                        // name is empty
                        if ($("#add-place-modal input").val() === "") {
                                $("#add-place-modal .text-danger")
                                                .text($.i18n.t("modal-add-place.place-name-empty"))
                                                .removeClass("hide");
                                $("#add-place-modal .valid-button").addClass("disabled");
                                
                                return false;
                        }
                        
                        // name already exists
                        if (places.where({ name : $("#add-place-modal input").val() }).length > 0) {
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
                validEditName:function(e) {
                        if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
                                // create the place if the name is ok
                                if (this.checkPlace()) {
                                        
                                        // instantiate the place and add it to the collection after the modal has been hidden
                                        $("#add-place-modal").on("hidden.bs.modal", function() {
                                                // instantiate a model for the new place
                                                var place = new Place.Model({
                                                        name    : $("#add-place-modal input").val(),
                                                        devices : []
                                                });

                                                // send the place to the backend
                                                place.save();

                                                // add it to the collection
                                                places.add(place);
                                                
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
                render:function() {
                        if (!appRouter.isModalShown) {
                                var self = this;

                                // initialize the content
                                this.$el.html(this.tpl());

                                // put the time on the top of the menu
                                if (typeof devices.getCoreClock() !== "undefined") { // dirty hack to avoid a bug when reconnecting - TODO
                                        $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
                                                device  : devices.getCoreClock(),
                                                active  : Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
                                        }));
                                }

                                // "add place" button to the side menu
                                this.$el.append(this.tplAddPlaceButton());

                                // for each place, add a menu item
                                this.$el.append(this.tpl());
                                
                                // put the unlocated devices into a separate group list
                                //this.$el.append(this.tpl());
                                $(this.$el.find(".list-group")[1]).append(this.tplPlaceContainer({
                                        place   : places.get("-1"),
                                        active  : Backbone.history.fragment.split("/")[1] === "-1" ? true : false
                                }));

                                places.forEach(function(place) {
                                        if (place.get("id") !== "-1") {
                                                $(self.$el.find(".list-group")[1]).append(self.tplPlaceContainer({
                                                        place : place,
                                                        active  : Backbone.history.fragment.split("/")[1] === place.get("id") ? true : false
                                                }));
                                        }
                                });

                                // translate the menu
                                this.$el.i18n();

                                // resize the menu
                                resizeDiv($(self.$el.find(".list-group")[1]));

                                return this;
                        }
                }
        });

        /**
         * Detailled view of a place
         */
        Place.Views.Details = Backbone.View.extend({
                tpl: _.template(placeDetailsTemplate),

                /**
                 * Bind events of the DOM elements from the view to their callback
                 */
                events: {
                        "show.bs.modal #edit-name-place-modal"                          : "initializeModal",
                        "click #edit-name-place-modal button.valid-button"      : "validEditName",
                        "keyup #edit-name-place-modal input"                            : "validEditName",
                        "click button.delete-place-button"                                      : "deletePlace",
                        "click button.toggle-plug-button"                                       : "onTogglePlugButton",
            "click button.blink-lamp-button"                    : "onBlinkLampButton",
                        "click button.toggle-lamp-button"                                       : "onToggleLampButton"
                },
                
                /**
                 * Listen to the model update and refresh if any
                 * 
                 * @constructor
                 */
                initialize:function() {
                        var self = this;
                        
                        // listen to update on its model...
                        this.listenTo(this.model, "change", this.render);
                        
                        // ... and on all its devices
                        this.model.get("devices").forEach(function(deviceId) {
                                var device = devices.get(deviceId);
                                
                                // if the device has been found in the collection
                                if (typeof device !== "undefined") {
                                        self.listenTo(devices.get(deviceId), "change", self.onChangedDevice);
                                }
                        });
                },
                
                /**
                 * Method called when a device has changed
                 * @param model Model that changed, Device in that cas
                 * @param collection Collection that holds the changed model
                 * @param options Options given with the change event   
                 */
                onChangedDevice:function(model, options) {
                        // a device has changed
                        // if it's the clock, we refresh the clock only
                        if(typeof options === "undefined" || (typeof options !== "undefined") && !options.clockRefresh){
                                this.render();
                        }
                },

                /**
                 * Clear the input text, hide the error message and disable the valid button by default
                 */
                initializeModal:function() {
                        $("#edit-name-place-modal input").val(this.model.get("name"));
                        $("#edit-name-place-modal .text-danger").addClass("hide");
                        $("#edit-name-place-modal .valid-button").addClass("disabled");
                },

                /**
                 * Check the current value of the input text and show a message error if needed
                 * 
                 * @return false if the typed name already exists, true otherwise
                 */
                checkPlace:function() {
                        // name is empty
                        if ($("#edit-name-place-modal input").val() === "") {
                                $("#edit-name-place-modal .text-danger").removeClass("hide");
                                $("#edit-name-place-modal .text-danger").text($.i18n.t("modal-edit-place.place-name-empty"));
                                $("#edit-name-place-modal .valid-button").addClass("disabled");
                                
                                return false;
                        }
                        
                        // name already existing
                        if (places.where({ name : $("#edit-name-place-modal input").val() }).length > 0) {
                                $("#edit-name-place-modal .text-danger").removeClass("hide");
                                $("#edit-name-place-modal .text-danger").text($.i18n.t("modal-edit-place.place-already-existing"));
                                $("#edit-name-place-modal .valid-button").addClass("disabled");
                                
                                return false;
                        }
                        
                        //ok
                        $("#edit-name-place-modal .text-danger").addClass("hide");
                        $("#edit-name-place-modal .valid-button").removeClass("disabled");
                        
                        return true;
                },
                                
                /**
                 * Check if the name of the place does not already exist. If not, update the place
                 * Hide the modal when done
                 */
                validEditName:function(e) {
                        var self = this;
                        
                        if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
                                e.preventDefault();
                                
                                // update the name if it is ok
                                if (this.checkPlace()) {
                                        this.$el.find("#edit-name-place-modal").on("hidden.bs.modal", function() {
                                                // set the new name to the place
                                                self.model.set("name", $("#edit-name-place-modal input").val());
                                                
                                                // send the update to the backend
                                                self.model.save();
                                                
                                                return false;
                                        });
                                        
                                        // hide the modal
                                        $("#edit-name-place-modal").modal("hide");
                                }
                        } else if (e.type === "keyup") {
                                this.checkPlace();
                        }
                },
                
                /**
                 * Callback when the user has clicked on the button to remove a place. Remove the place
                 */
                deletePlace:function() {
                        // delete the place
                        this.model.destroy();
                        
                        // navigate to the list of places
                        appRouter.navigate("#places", { trigger : true });
                },
                
                /**
                 * Callback to toggle a plug
                 * 
                 * @param e JS mouse event
                 */
                onTogglePlugButton:function(e) {
                        e.preventDefault();
                        
                        var plug = devices.get($(e.currentTarget).attr("id"));
                        // value can be string or boolean
                        // string
                        if (typeof plug.get("plugState") === "string") {
                                if (plug.get("plugState") === "true") {
                                        plug.set("plugState", "false");
                                } else {
                                        plug.set("plugState", "true");
                                }
                        // boolean
                        } else {
                                if (plug.get("plugState")) {
                                        plug.set("plugState", "false");
                                } else {
                                        plug.set("plugState", "true");
                                }
                        }
                        
                        // send the message to the backend
                        plug.save();
                        
                        return false;
                },
                
                /**
                 * Callback to toggle a lamp
                 * 
                 * @param e JS mouse event
                 */
                onToggleLampButton:function(e) {
                        e.preventDefault();
                        
                        var lamp = devices.get($(e.currentTarget).attr("id"));
                        // value can be string or boolean
                        // string
                        if (typeof lamp.get("value") === "string") {
                                if (lamp.get("value") === "true") {
                                        lamp.set("value", "false");
                                } else {
                                        lamp.set("value", "true");
                                }
                        // boolean
                        } else {
                                if (lamp.get("value")) {
                                        lamp.set("value", "false");
                                } else {
                                        lamp.set("value", "true");
                                }
                        }
                        
                        // send the message to the backend
                        lamp.save();
                        
                        return false;
                },
                                               /**
                                                * Callback to blink a lamp
                                                *
                                                * @param e JS mouse event
                                                */
                                               onBlinkLampButton:function(e) {
                                               e.preventDefault();
                                               
                                               var lamp = devices.get($(e.currentTarget).attr("id"));
                                               // send the message to the backend
                                               lamp.remoteCall("blink", []);
                                               
                                               return false;
                                               },

                /**
                 * Render the view
                 */
                render:function() {
                        if (!appRouter.isModalShown) {
                                // render the view itself
                                this.$el.html(this.tpl({
                                        place : this.model,
                                }));

                                // put the name of the place by default in the modal to edit
                                $("#edit-name-place-modal .place-name").val(this.model.get("name"));

                                // hide the error message
                                $("#edit-name-place-modal .text-error").hide();

                                // initialize the popover
                                this.$el.find("#delete-popover").popover({
                                        html            : true,
                                        content         : "<button type='button' class='btn btn-danger delete-place-button'>" + $.i18n.t("form.delete-button") + "</button>",
                                        placement       : "bottom"
                                });
                                
                                // translate the view
                                this.$el.i18n();

                                // resize the devices list in the selected place
                                resizeDiv($(".contents-list"));

                                return this;
                        }
                }
        });
});
