define([
  "jquery",
  "jqueryui",
  "underscore",
  "backbone",
  "grammar",
  "raphael",
  "moment",
  "jstree",
  "text!templates/devices/menu/menu.html",
  "text!templates/devices/menu/deviceContainer.html",
  "text!templates/devices/menu/coreClockContainer.html",
  "text!templates/devices/list/deviceListByCategory.html",
  "text!templates/devices/details/deviceContainer.html",
  "text!templates/devices/details/contact.html",
  "text!templates/devices/details/illumination.html",
  "text!templates/devices/details/keyCard.html",
  "text!templates/devices/details/switch.html",
  "text!templates/devices/details/actuator.html",
  "text!templates/devices/details/temperature.html",
  "text!templates/devices/details/plug.html",
  "text!templates/devices/details/phillipsHue.html",
  "text!templates/devices/details/coreClock.html",
  "text!templates/devices/details/mediaplayer.html",
  "colorWheel"
], function($, jqueryui, _, Backbone, Grammar, Raphael, Moment, JsTree,
            deviceMenuTemplate, deviceContainerMenuTemplate, coreClockContainerMenuTemplate,
            deviceListByCategoryTemplate, deviceDetailsTemplate, contactDetailTemplate, illuminationDetailTemplate,
            keyCardDetailTemplate, switchDetailTemplate, actuatorDetailTemplate, temperatureDetailTemplate, plugDetailTemplate, phillipsHueDetailTemplate,
            coreClockDetailTemplate, mediaPlayerTemplate) {


/**
 * Resizes the div to the maximum displayable size on the screen
 */     
function resizeDiv(jqNode){
  if(typeof jqNode !== "undefined"){
    jqNode[0].classList.add("div-scrollable");
    setTimeout(function(){
        var divSize = window.innerHeight-(jqNode.offset().top + jqNode.outerHeight(false) + 20 - jqNode.innerHeight());

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
 * Namespace for the views
 */
Device.Views = {};

/**
 * Render the side menu for the devices
 */
Device.Views.Menu = Backbone.View.extend({
tpl                                             : _.template(deviceMenuTemplate),
tplDeviceContainer              : _.template(deviceContainerMenuTemplate),
tplCoreClockContainer   : _.template(coreClockContainerMenuTemplate),

/**
 * Bind events of the DOM elements from the view to their callback
 */
events: {
"click a.list-group-item"       : "updateSideMenu"
},

/**
 * Listen to the updates on devices and update if any
 * 
 * @constructor
 */
initialize:function() {
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
                 * Update the side menu to set the correct active element
                 * 
                 * @param e JS click event
                 */
updateSideMenu:function(e) {
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
refreshClockDisplay:function() {

                      //remove existing node
                      $(this.$el.find(".list-group")[0]).children().remove();

                      //refresh the clock
                      $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
device  : devices.getCoreClock(),
active  : Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
}));

},

  /**
   * Render the side menu
   */
render:function() {
         if (!appRouter.isModalShown) {
           var self = this;

           // initialize the content
           this.$el.html(this.tpl());

           // display the clock
           $(this.$el.find(".list-group")[0]).append(this.tplCoreClockContainer({
device  : devices.getCoreClock(),
active  : Backbone.history.fragment === "devices/" + devices.getCoreClock().get("id") ? true : false
}));

// for each category of devices, add a menu item
this.$el.append(this.tpl());
var types = devices.getDevicesByType();
_.forEach(_.keys(types), function(type) {
    if (type !== "21" && type !== "36" && type !== "102") {
    $(self.$el.find(".list-group")[1]).append(self.tplDeviceContainer({
type            : type,
devices         : types[type],
places          : places,
unlocatedDevices: devices.filter(function(d) { return (d.get("placeId") === "-1" && d.get("type") === type); }),
active          : Backbone.history.fragment.split("devices/types/")[1] === type ? true : false
}));
    }
    });

// set active the current item menu
this.updateSideMenu();

// translate the view
this.$el.i18n();

// resize the menu
resizeDiv($(self.$el.find(".list-group")[1]));

return this;
}
}
});

// detailled view of a device
Device.Views.Details = Backbone.View.extend({
template: _.template(deviceDetailsTemplate),
tplContact: _.template(contactDetailTemplate),
tplIllumination: _.template(illuminationDetailTemplate),
tplKeyCard: _.template(keyCardDetailTemplate),
tplSwitch: _.template(switchDetailTemplate),
tplActuator: _.template(actuatorDetailTemplate),
tplTemperature: _.template(temperatureDetailTemplate),
tplPlug: _.template(plugDetailTemplate),
tplPhillipsHue: _.template(phillipsHueDetailTemplate),
tplCoreClock: _.template(coreClockDetailTemplate),
tplMediaPlayer: _.template(mediaPlayerTemplate),

// map the events and their callback
events: {
"click button.back-button"                                              : "onBackButton",
"click button.toggle-lamp-button"                           : "onToggleLampButton",
"click button.blink-lamp-button"                            : "onBlinkLampButton",
"click button.toggle-plug-button"                               : "onTogglePlugButton",
"click button.toggle-actuator-button"                   : "onToggleActuatorButton",
"click button.btn-media-play"                                   : "onPlayMedia",
"click button.btn-media-resume"                                 : "onResumeMedia",
"click button.btn-media-pause"                                  : "onPauseMedia",
"click button.btn-media-stop"                                   : "onStopMedia",
"click button.btn-media-volume"                                 : "onSetVolumeMedia",
"click button.btn-media-browse"                                 : "onBrowseMedia",
"show.bs.modal #edit-device-modal"                              : "initializeModal",
"hidden.bs.modal #edit-device-modal"                            : "toggleModalValue",
"click #edit-device-modal button.valid-button"  : "validEditDevice",
"keyup #edit-device-modal input"                                : "validEditDevice",
"change #edit-device-modal select"                              : "checkDevice"
},

  /**
   * Listen to the device update and refresh if any
   * 
   * @constructor
   */
initialize:function() {
             this.listenTo(this.model, "change", this.render);
           },

           /**
            * Return to the previous view
            */
onBackButton:function() {
               window.history.back();
             },

             /**
              * Callback to toggle a lamp - used when the displayed device is a lamp (!)
              */
onToggleLampButton:function() {
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
           onBlinkLampButton:function(e) {
             e.preventDefault();
             var lamp = devices.get($(e.currentTarget).attr("id"));
             // send the message to the backend
             lamp.remoteCall("blink", []);

             return false;
           },

           /**
            * Callback to toggle a plug - used when the displayed device is a plug (!)
            */
onTogglePlugButton:function() {
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
           onToggleActuatorButton:function() {
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
onPlayMedia:function() {
              this.model.sendPlay();
            },

            /**
             * Called when resume button is pressed and the displayed device is a media player
             */
onResumeMedia:function() {
                this.model.sendResume();
              },

              /**
               * Called when pause button is pressed and the displayed device is a media player
               */
                onPauseMedia:function() {
                  this.model.sendPause();
                },

                /**
                 * Called when stop button is pressed and the displayed device is a media player
                 */
                onStopMedia:function() {
                  this.model.sendStop();
                },

                /**
                 * Called when volume is chosen and the displayed device is a media player
                 */
                onSetVolumeMedia:function() {
                  this.model.setVolume();
                },

                /**
                 * Called when browse button is pressed, displays a tree of available media
                 */
                onBrowseMedia:function(e) {

                  this.model.onBrowseMedia($("#selectedMedia"));
                },

                /**
                 * Clear the input text, hide the error message and disable the valid button by default
                 */
                initializeModal:function() {
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
                toggleModalValue:function() {
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
                checkDevice:function() {
                  // name already exists
                  if (devices.where({ name : $("#edit-device-modal input").val() }).length > 0) {
                    if (devices.where({ name : $("#edit-device-modal input").val() })[0].get("id") !== this.model.get("id")) {
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
                  }  else if (e.type === "keyup") {
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

                  lamp.set({color: Math.floor(hsl.h * 65535), "saturation": Math.floor(hsl.s * 255),"brightness": Math.floor(hsl.l * 255)});

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
                        sensorImg: "styles/img/sensors/temperature.jpg",
                        sensorType: $.i18n.t("devices.temperature.name.singular"),
                        places: places,
                        deviceDetails: this.tplTemperature
                      }));
                      break;

                      case 1: // illumination sensor
                        this.$el.html(this.template({
                        device: this.model,
                        sensorImg: "styles/img/sensors/illumination.jpg",
                        sensorType: $.i18n.t("devices.illumination.name.singular"),
                        places: places,
                        deviceDetails: this.tplIllumination
                      }));
                      break;

                      case 2: // switch sensor
                        this.$el.html(this.template({
                        device: this.model,
                        sensorImg: "styles/img/sensors/doubleSwitch.jpg",
                        sensorType: $.i18n.t("devices.switch.name.singular"),
                        places: places,
                        deviceDetails: this.tplSwitch
                      }));
                      break;

                      case 3: // contact sensor
                        this.$el.html(this.template({
                        device: this.model,
                        sensorImg: "styles/img/sensors/contact.jpg",
                        sensorType: $.i18n.t("devices.contact.name.singular"),
                        places: places,
                        deviceDetails: this.tplContact
                      }));
                      break;

                      case 4: // key card sensor
                        this.$el.html(this.template({
                        device: this.model,
                        sensorImg: "styles/img/sensors/keycard.jpg",
                        sensorType: $.i18n.t("devices.keycard-reader.name.singular"),
                        places: places,
                        deviceDetails: this.tplKeyCard
                      }));
                      break;

                      case 6: // plug
                        this.$el.html(this.template({
                        device: this.model,
                        sensorImg: "styles/img/sensors/plug.jpg",
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
                        sensorImg: "styles/img/sensors/doubleSwitch.jpg",
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
                      case 31: // media player
                        this.$el.html(this.template({
                        device: this.model,
                        sensorType: $.i18n.t("devices.mediaplayer.name.singular"),
                        places: places,
                        deviceDetails: this.tplMediaPlayer
                      }));

                      // initialize the volume slider
                      _.defer(function(){
                        $( ".volume-slider" ).slider({
                          range: "min",
                          min: 0,
                          max: 100,
                          value: 100,
                          stop: function( event, ui ) {
                            self.model.sendVolume($( ".volume-slider" ).slider( "value" ));
                          }
                        });
                      });

                      // requesting current volume level
                      this.model.remoteCall("getVolume", [], this.model.get("id") + ":volume");

                      // resize the panel
                      if(this.model.get("type") != 21){
                        resizeDiv($(this.$el.find(".list-group")[0]));
                      }
                    }

                    // translate the view
                    this.$el.i18n();

                    return this;
                  }
                },

                /**
                 * Render the color wheel for the Philips Hue
                 */
                renderColorWheel:function(enabled, color) {
                  // create the color picker
                  var wheelRadius = $(".body-content").outerWidth() / 10 + 80;

                  // instantiate the color wheel
                  window.colorWheel = Raphael.colorwheel($(".color-picker")[0], wheelRadius*2).color(color);

                  // bind the events
                  if(typeof enabled !== undefined && enabled === "true"){
                    // color change enabled
                    window.colorWheel.ondrag(null, this.onChangeColor);
                  }
                  else{
                    // color change disabled
                    window.colorWheel.onchange(
                      function(){
                        window.colorWheel.color(color);
                      });
                  }
                }
                       });

                       /**
                        * Render the list of devices of a given type
                        */
                       Device.Views.DevicesByType = Backbone.View.extend({
                         tpl: _.template(deviceListByCategoryTemplate),

                         events: {
                           "click button.toggle-plug-button"       : "onTogglePlugButton",
                           "click button.blink-lamp-button"    : "onBlinkLampButton",
                           "click button.toggle-lamp-button"   : "onToggleLampButton",
                           "click button.toggle-actuator-button"   : "onToggleActuatorButton"
                         },

                         /**
                          * Listen to the updates on the devices of the category and refresh if any
                          * 
                          * @constructor
                          */
                         initialize:function() {
                           var self = this;

                           devices.getDevicesByType()[this.id].forEach(function(device) {
                             self.listenTo(device, "change", self.render);
                             self.listenTo(device, "remove", self.render);
                           });
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
                   * Callback to toggle an actuator
                   * 
                   * @param e JS mouse event
                   */
  onToggleActuatorButton:function(e) {
    e.preventDefault();

    var actuator = devices.get($(e.currentTarget).attr("id"));
    // value can be string or boolean
    // string
    if (typeof actuator.get("value") === "string") {
      if (actuator.get("value") === "true") {
        actuator.set("value", "false");
      } else {
        actuator.set("value", "true");
      }
      // boolean
    } else {
      if (actuator.get("value")) {
        actuator.set("value", "false");
      } else {
        actuator.set("value", "true");
      }
    }

    // send the message to the backend
    actuator.save();

    return false;
  },

  /**
   * Render the list
   */
render:function() {
         if (!appRouter.isModalShown) {
           this.$el.html(this.tpl({
type                    : this.id,
places                  : places
}));

// translate the view
this.$el.i18n();

// resize the list
resizeDiv($(".contents-list"));

return this;
}
}
});
});
