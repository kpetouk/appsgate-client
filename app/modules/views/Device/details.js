define([
    "app",
    "raphael",
    "text!templates/devices/details/deviceContainer.html",
    "text!templates/devices/details/contact.html",
    "text!templates/devices/details/illumination.html",
    "text!templates/devices/details/keyCard.html",
    "text!templates/devices/details/ARD.html",
    "text!templates/devices/details/switch.html",
    "text!templates/devices/details/actuator.html",
    "text!templates/devices/details/temperature.html",
    "text!templates/devices/details/plug.html",
    "text!templates/devices/details/phillipsHue.html",
    "text!templates/devices/details/coreClock.html",
    "colorwheel"

], function(App, Raphael, deviceDetailsTemplate, contactDetailTemplate, illuminationDetailTemplate, keyCardDetailTemplate,
        ARDDetailTemplate, switchDetailTemplate, actuatorDetailTemplate, temperatureDetailTemplate,
        plugDetailTemplate, phillipsHueDetailTemplate, coreClockDetailTemplate) {

    var DeviceDetailsView = {};
    // detailled view of a device
    DeviceDetailsView = Backbone.View.extend({
        template: _.template(deviceDetailsTemplate),
        tplContact: _.template(contactDetailTemplate),
        tplIllumination: _.template(illuminationDetailTemplate),
        tplKeyCard: _.template(keyCardDetailTemplate),
        tplARD: _.template(ARDDetailTemplate),
        tplSwitch: _.template(switchDetailTemplate),
        tplActuator: _.template(actuatorDetailTemplate),
        tplTemperature: _.template(temperatureDetailTemplate),
        tplPlug: _.template(plugDetailTemplate),
        tplPhillipsHue: _.template(phillipsHueDetailTemplate),
        tplCoreClock: _.template(coreClockDetailTemplate),
        // map the events and their callback
        events: {
            "click button.back-button": "onBackButton",
            "click button.toggle-lamp-button": "onToggleLampButton",
            "click button.blink-lamp-button": "onBlinkLampButton",
            "click button.toggle-plug-button": "onTogglePlugButton",
            "click button.toggle-actuator-button": "onToggleActuatorButton",
            "click button.btn-media-play": "onPlayMedia",
            "click button.btn-media-resume": "onResumeMedia",
            "click button.btn-media-pause": "onPauseMedia",
            "click button.btn-media-stop": "onStopMedia",
            "click button.btn-media-volume": "onSetVolumeMedia",
            "click button.btn-media-browse": "onBrowseMedia",
            "show.bs.modal #edit-device-modal": "initializeModal",
            "hidden.bs.modal #edit-device-modal": "toggleModalValue",
            "click #edit-device-modal button.valid-button": "validEditDevice",
            "keyup #edit-device-modal input": "validEditDevice",
            "change #edit-device-modal select": "checkDevice"
        },
        /**
         * Listen to the device update and refresh if any
         * 
         * @constructor
         */
        initialize: function() {
            this.listenTo(this.model, "change", this.render);
        },
        /**
         * Return to the previous view
         */
        onBackButton: function() {
            window.history.back();
        },
        /**
         * Callback to toggle a lamp - used when the displayed device is a lamp (!)
         */
        onToggleLampButton: function() {
            // value can be string or boolean
            // string
            if (typeof this.model.get("value") === "string") {
                if (this.model.get("value") === "true") {
                    this.model.set("value", "false");
                    this.$el.find(".toggle-lamp-button").text("Allumer");
                } else {
                    this.model.set("value", "true");
                    this.$el.find(".toggle-lamp-button").text("Eteindre");
                }
                // boolean
            } else {
                if (this.model.get("value")) {
                    this.model.set("value", "false");
                    this.$el.find(".toggle-lamp-button").text("Allumer");
                } else {
                    this.model.set("value", "true");
                    this.$el.find(".toggle-lamp-button").text("Eteindre");
                }
            }

            // send the message to the backend
            this.model.save();
        },
        /**
         * Callback to blink a lamp
         *
         * @param e JS mouse event
         */
        onBlinkLampButton: function(e) {
            e.preventDefault();
            var lamp = devices.get($(e.currentTarget).attr("id"));
            // send the message to the backend
            lamp.remoteControl("blink", []);

            return false;
        },
        /**
         * Callback to toggle a plug - used when the displayed device is a plug (!)
         */
        onTogglePlugButton: function() {
            // value can be string or boolean
            // string
            if (typeof this.model.get("plugState") === "string") {
                if (this.model.get("plugState") === "true") {
                    this.model.set("plugState", "false");
                    this.$el.find(".toggle-plug-button").text("Allumer");
                } else {
                    this.model.set("plugState", "true");
                    this.$el.find(".toggle-plug-button").text("Eteindre");
                }
                // boolean
            } else {
                if (this.model.get("plugState")) {
                    this.model.set("plugState", "false");
                    this.$el.find(".toggle-plug-button").text("Allumer");
                } else {
                    this.model.set("plugState", "true");
                    this.$el.find(".toggle-plug-button").text("Eteindre");
                }
            }

            // send the message to the backend
            this.model.save();
        },
        /**
         * Callback to toggle a plug - used when the displayed device is a plug (!)
         */
        onToggleActuatorButton: function() {
            // value can be string or boolean
            // string
            if (typeof this.model.get("value") === "string") {
                if (this.model.get("value") === "true") {
                    this.model.set("value", "false");
                    this.$el.find(".toggle-actuator-button").text("Allumer");
                } else {
                    this.model.set("value", "true");
                    this.$el.find(".toggle-actuator-button").text("Eteindre");
                }
                // boolean
            } else {
                if (this.model.get("value")) {
                    this.model.set("value", "false");
                    this.$el.find(".toggle-actuator-button").text("Allumer");
                } else {
                    this.model.set("value", "true");
                    this.$el.find(".toggle-actuator-button").text("Eteindre");
                }
            }

            // send the message to the backend
            this.model.save();
        },
        /**
         * Called when resume button is pressed and the displayed device is a media player
         */
        onPlayMedia: function() {
            this.model.sendPlay();
        },
        /**
         * Called when resume button is pressed and the displayed device is a media player
         */
        onResumeMedia: function() {
            this.model.sendResume();
        },
        /**
         * Called when pause button is pressed and the displayed device is a media player
         */
        onPauseMedia: function() {
            this.model.sendPause();
        },
        /**
         * Called when stop button is pressed and the displayed device is a media player
         */
        onStopMedia: function() {
            this.model.sendStop();
        },
        /**
         * Called when volume is chosen and the displayed device is a media player
         */
        onSetVolumeMedia: function() {
            this.model.setVolume();
        },
        /**
         * Called when browse button is pressed, displays a tree of available media
         */
        onBrowseMedia: function(e) {

            this.model.onBrowseMedia($("#selectedMedia"));
        },
        /**
         * Clear the input text, hide the error message and disable the valid button by default
         */
        initializeModal: function() {
            $("#edit-device-modal input#device-name").val(this.model.get("name").replace(/&eacute;/g, "é").replace(/&egrave;/g, "è"));
            $("#edit-device-modal .text-danger").addClass("hide");
            $("#edit-device-modal .valid-button").addClass("disabled");

            // initialize the field to edit the core clock if needed
            if (this.model.get("type") === "21" || this.model.get("type") === 21) {
                $("#edit-device-modal select#hour").val(this.model.get("moment").hour());
                $("#edit-device-modal select#minute").val(this.model.get("moment").minute());
                $("#edit-device-modal input#time-flow-rate").val(this.model.get("flowRate"));
            }

            // tell the router that there is a modal
            appRouter.isModalShown = true;
        },
        /**
         * Tell the router there is no modal anymore
         */
        toggleModalValue: function() {
            _.defer(function() {
                appRouter.isModalShown = false;
                appRouter.currentView.render();
            });
        },
        /**
         * Check the current value given by the user - show an error message if needed
         * 
         * @return false if the information are not correct, true otherwise
         */
        checkDevice: function() {
            // name already exists
            if (devices.where({name: $("#edit-device-modal input").val()}).length > 0) {
                if (devices.where({name: $("#edit-device-modal input").val()})[0].get("id") !== this.model.get("id")) {
                    $("#edit-device-modal .text-danger").removeClass("hide");
                    $("#edit-device-modal .text-danger").text("Nom déjà existant");
                    $("#edit-device-modal .valid-button").addClass("disabled");

                    return false;
                } else {
                    $("#edit-device-modal .text-danger").addClass("hide");
                    $("#edit-device-modal .valid-button").removeClass("disabled");

                    return true;
                }
            }

            // ok
            $("#edit-device-modal .text-danger").addClass("hide");
            $("#edit-device-modal .valid-button").removeClass("disabled");

            return true;
        },
        /**
         * Save the edits of the device
         */
        validEditDevice: function(e) {
            var self = this;

            if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
                e.preventDefault();

                // update if information are ok
                if (this.checkDevice()) {
                    var destPlaceId;

                    if (this.model.get("type") !== "21" && this.model.get("type") !== 21) {
                        destPlaceId = $("#edit-device-modal select option:selected").val();
                    }


                    this.$el.find("#edit-device-modal").on("hidden.bs.modal", function() {
                        // set the new name to the device
                        self.model.set("name", $("#edit-device-modal input#device-name").val());

                        // send the updates to the server
                        self.model.save();

                        // move the device if this is not the core clock
                        if (self.model.get("type") !== "21" && self.model.get("type") !== 21) {
                            places.moveDevice(self.model.get("placeId"), destPlaceId, self.model.get("id"), true);
                        } else { // update the time and the flow rate set by the user
                            // update the moment attribute
                            self.model.get("moment").set("hour", parseInt($("#edit-device-modal select#hour").val()));
                            self.model.get("moment").set("minute", parseInt($("#edit-device-modal select#minute").val()));
                            // retrieve the value of the flow rate set by the user
                            var timeFlowRate = $("#edit-device-modal input#time-flow-rate").val();

                            // update the attributes hour and minute
                            self.model.set("hour", self.model.get("moment").hour());
                            self.model.set("minute", self.model.get("moment").minute());

                            // send the update to the server
                            self.model.save();

                            // update the attribute time flow rate
                            self.model.set("flowRate", timeFlowRate);

                            //send the update to the server
                            self.model.save();
                        }

                        // tell the router that there is no modal any more
                        appRouter.isModalShown = false;

                        // rerender the view
                        self.render();

                        return false;
                    });

                    // hide the modal
                    $("#edit-device-modal").modal("hide");
                }
            } else if (e.type === "keyup") {
                this.checkDevice();
            }
        },
        /**
         * Set the new color to the lamp
         * 
         * @param e JS mouse event
         */
        onChangeColor: function(e) {
            var lamp = devices.get(Backbone.history.fragment.split("/")[1]);
            var rgb = Raphael.getRGB(colorWheel.color());
            var hsl = Raphael.rgb2hsl(rgb);

            lamp.set({color: Math.floor(hsl.h * 65535), "saturation": Math.floor(hsl.s * 255), "brightness": Math.floor(hsl.l * 255)});

            var result = lamp.save();

        },
        /**
         * Render the detailled view of a device
         */
        render: function() {
            var self = this;

            if (!appRouter.isModalShown) {
                switch (this.model.get("type")) {
                    case 0: // temperature sensor
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/temperature.jpg",
                            sensorType: $.i18n.t("devices.temperature.name.singular"),
                            places: places,
                            deviceDetails: this.tplTemperature
                        }));
                        break;

                    case 1: // illumination sensor
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/illumination.jpg",
                            sensorType: $.i18n.t("devices.illumination.name.singular"),
                            places: places,
                            deviceDetails: this.tplIllumination
                        }));
                        break;

                    case 2: // switch sensor
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/doubleSwitch.jpg",
                            sensorType: $.i18n.t("devices.switch.name.singular"),
                            places: places,
                            deviceDetails: this.tplSwitch
                        }));
                        break;

                    case 3: // contact sensor
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/contact.jpg",
                            sensorType: $.i18n.t("devices.contact.name.singular"),
                            places: places,
                            deviceDetails: this.tplContact
                        }));
                        break;

                    case 4: // key card sensor
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/keycard.jpg",
                            sensorType: $.i18n.t("devices.keycard-reader.name.singular"),
                            places: places,
                            deviceDetails: this.tplKeyCard
                        }));
                        break;
                    case 5: // ARD lock
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/keycard.jpg",
                            sensorType: $.i18n.t("devices.ard.name.singular"),
                            places: places,
                            deviceDetails: this.tplARD
                        }));
                        break;

                    case 6: // plug
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/plug.jpg",
                            sensorType: $.i18n.t("devices.plug.name.singular"),
                            places: places,
                            deviceDetails: this.tplPlug
                        }));
                        break;

                    case 7: // phillips hue
                        var lamp = this.model;

                        this.$el.html(this.template({
                            device: lamp,
                            sensorType: $.i18n.t("devices.lamp.name.singular"),
                            places: places,
                            deviceDetails: this.tplPhillipsHue
                        }));

                        // get the current color						
                        var color = Raphael.hsl((lamp.get("color") / 65535), (lamp.get("saturation") / 255), (lamp.get("brightness") / 255));

                        // get the current state
                        var enabled = lamp.get("value");

                        // if the lamp is on, we allow the user to pick a color				
                        this.renderColorWheel(enabled, color);

                        // update the size of the color picker container
                        this.$el.find(".color-picker").height(colorWheel.size2 * 2);

                        break;
                    case 8: // switch actuator
                        this.$el.html(this.template({
                            device: this.model,
                            sensorImg: "app/img/sensors/doubleSwitch.jpg",
                            sensorType: $.i18n.t("devices.actuator.name.singular"),
                            places: places,
                            deviceDetails: this.tplActuator
                        }));
                        break;
                    case 21: // core clock
                        var hours = [];
                        for (var i = 0; i < 24; i++) {
                            hours.push(i);
                        }

                        var minutes = [];
                        for (i = 0; i < 60; i++) {
                            minutes.push(i);
                        }
                        this.$el.html(this.template({
                            device: this.model,
                            sensorType: $.i18n.t("devices.clock.name.singular"),
                            places: places,
                            hours: hours,
                            minutes: minutes,
                            deviceDetails: this.tplCoreClock
                        }));
                        break;
                        /*case 31: // media player
                         this.$el.html(this.template({
                         device: this.model,
                         sensorType: $.i18n.t("devices.mediaplayer.name.singular"),
                         places: places,
                         deviceDetails: this.tplMediaPlayer
                         }));
                         
                         // initialize the volume slider
                         _.defer(function() {
                         $(".volume-slider").slider({
                         range: "min",
                         min: 0,
                         max: 100,
                         value: 100,
                         stop: function(event, ui) {
                         self.model.sendVolume($(".volume-slider").slider("value"));
                         }
                         });
                         });
                         
                         // requesting current volume level
                         this.model.remoteCall("getVolume", [], this.model.get("id") + ":volume");
                         */

                }
                // resize the panel
                if (this.model.get("type") != 21) {
                    this.resizeDiv($(this.$el.find(".list-group")[0]));
                }
                // translate the view
                this.$el.i18n();

                return this;
            }
        },
        /**
         * Render the color wheel for the Philips Hue
         */
        renderColorWheel: function(enabled, color) {
            // create the color picker
            var wheelRadius = $(".body-content").outerWidth() / 10 + 80;

            // instantiate the color wheel
            window.colorWheel = Raphael.colorwheel($(".color-picker")[0], wheelRadius * 2).color(color);

            // bind the events
            if (typeof enabled !== undefined && enabled === "true") {
                // color change enabled
                window.colorWheel.ondrag(null, this.onChangeColor);
            }
            else {
                // color change disabled
                window.colorWheel.onchange(function() {
                    window.colorWheel.color(color);
                });
            }
        }
    });
    return DeviceDetailsView
});