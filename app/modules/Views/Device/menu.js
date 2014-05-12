define([
    "app",
    "text!templates/devices/menu/menu.html",
    "text!templates/devices/menu/deviceContainer.html",
    "text!templates/devices/menu/coreClockContainer.html"
], function(App, deviceMenuTemplate, deviceContainerMenuTemplate, coreClockContainerMenuTemplate) {

    var DeviceMenuView = {};
    /**
     * Render the side menu for the devices
     */
    DeviceMenuView = Backbone.View.extend({
        tpl: _.template(deviceMenuTemplate),
        tplDeviceContainer: _.template(deviceContainerMenuTemplate),
        tplCoreClockContainer: _.template(coreClockContainerMenuTemplate),
        /**
         * Bind events of the DOM elements from the view to their callback
         */
        events: {
            "click a.list-group-item": "updateSideMenu"
        },
        /**
         * Listen to the updates on devices and update if any
         * 
         * @constructor
         */
        initialize: function() {
            this.listenTo(devices, "add", this.render);
            this.listenTo(devices, "change", this.onChangedDevice);
            this.listenTo(devices, "remove", this.render);
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
         * Update the side menu to set the correct active element
         * 
         * @param e JS click event
         */
        updateSideMenu: function(e) {
            _.forEach($("a.list-group-item"), function(item) {
                $(item).removeClass("active");
            });

            if (typeof e !== "undefined") {
                $(e.currentTarget).addClass("active");
            } else {
                if (Backbone.history.fragment === "devices") {
                    $($(".navbar li")[0]).addClass("active");
                } else if (Backbone.history.fragment.split("/")[1] === "types") {
                    $("#side-" + Backbone.history.fragment.split("/")[2]).addClass("active");
                } else {
                    var deviceId = Backbone.history.fragment.split("/")[1];
                    $("#side-" + devices.get(deviceId).get("type")).addClass("active");
                }
            }
        },
        /**
         * Refreshes the time display without rerendering the whole screen
         */
        refreshClockDisplay: function() {

            //remove existing node
            $(this.$el.find(".list-group")[0]).children().remove();

            //refresh the clock
            $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
                device: devices.getCoreClock(),
                active: Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
            }));

        },
        /**
         * Render the side menu
         */
        render: function() {
            if (!appRouter.isModalShown) {
                var self = this;

                // initialize the content
                this.$el.html(this.tpl());

                // display the clock
                $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
                    device: devices.getCoreClock(),
                    active: Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
                }));

                // for each category of devices, add a menu item
                this.$el.append(this.tpl());
                var types = devices.getDevicesByType();
                _.forEach(_.keys(types), function(type) {
                    if (type !== "21" && type !== "36" && type !== "102" && type !== "103") {
                        $(self.$el.find(".list-group")[1]).append(self.tplDeviceContainer({
                            type: type,
                            devices: types[type],
                            places: places,
                            unlocatedDevices: devices.filter(function(d) {
                                return (d.get("placeId") === "-1" && d.get("type") === type);
                            }),
                            active: Backbone.history.fragment.split("devices/types/")[1] === type ? true : false
                        }));
                    }
                });

                // set active the current item menu
                this.updateSideMenu();

                // translate the view
                this.$el.i18n();

                // resize the menu
                this.resizeDiv($(self.$el.find(".list-group")[1]));

                return this;
            }
        }
    });
    return DeviceMenuView;
});