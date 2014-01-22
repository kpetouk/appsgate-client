define([
  "app"
], function(App) {

              // initialize the module
              var Device = {};

              /**
               * Abstract class regrouping common characteristics shared by all the devices
               *
               * @class Device.Model
               */
              AppsGate.Device.Model = Backbone.Model.extend({

                /**
                 * @constructor 
                 */
                initialize: function() {
                  var self = this;

                  // each device listens to the event whose id corresponds to its own id. This ensures to
                  // receive only relevant events
                  dispatcher.on(this.get("id"), function(updatedVariableJSON) {
                    self.set(updatedVariableJSON.varName, updatedVariableJSON.value);
                  });
                },

                /**
                 * Send the name of the device to the server
                 */
                sendName:function() {
                  // build the message
                  var messageJSON = {
                    method  : "setUserObjectName",
                    args    : [
                      { type : "String", value : this.get("id") },
                      { type : "String", value : "" },
                      { type : "String", value : this.get("name") }
                    ]
                  };

                  // send the message
                  communicator.sendMessage(messageJSON);
                },

                /**
                 * Send a message to the server to perform a remote call
                 * 
                 * @param method Remote method name to call
                 * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
                 */
                remoteCall:function(method, args, callId) {
                  // build the message
                  var messageJSON = {
                    targetType      : "1",
                    objectId        : this.get("id"),
                    method          : method,
                    args            : args
                  };

                  if (typeof callId !== "undefined") {
                    messageJSON.callId = callId;
                  }

                  // send the message
                  communicator.sendMessage(messageJSON);
                },

                /**
                 * Override its synchronization method to send a notification on the network
                 */
                sync:function(method, model) {
                  if (model.changedAttributes()) {
                    switch (method) {
                      case "update":
                        _.keys(model.changedAttributes()).forEach(function(attribute) {
                        if (attribute === "name") {
                          model.sendName();
                        } else if (attribute === "plugState") {
                          model.sendPlugState();
                        } else if (attribute === "value" && (model.get("type") === "7" || model.get("type") === 7)) {
                          model.sendValue();
                        } else if (attribute === "value" && (model.get("type") === "8" || model.get("type") === 8)) {
                          model.sendValue();
                        } else if (attribute === "color" && (model.get("type") === "7" || model.get("type") === 7)) {
                          model.sendColor();
                        } else if (attribute === "saturation" && (model.get("type") === "7" || model.get("type") === 7)) {
                          model.sendSaturation();
                        } else if (attribute === "brightness" && (model.get("type") === "7" || model.get("type") === 7)) {
                          model.sendBrightness();
                        } else if ((attribute === "hour" || attribute === "minute") && (model.get("type") === "21" || model.get("type") === 21)) {
                          model.sendTimeInMillis();
                        } else if (attribute === "flowRate" && (model.get("type") === "21" || model.get("type") === 21)) {
                          model.sendTimeFlowRate();
                        }
                      });
                      break;
                      default:
                        break;
                    }
                  }
                }
              });

/**
 * Implementation of temperature sensor
 * Specific attribute is: 
 *      value, containing the last temperature sent by the backend, in degree Celsius
 *
 * @class Device.TemperatureSensor
 */
              Device.TemperatureSensor = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.TemperatureSensor.__super__.initialize.apply(this, arguments);
                }

              });

/**
 * Implementation of switch sensor
 * Specific attributes are:
 *      switchNumber. Values are depend of the type of the switch
 *      buttonStatus, 0 when Off, 1 when On
 *
 * @class Device.SwitchSensor
 */
              Device.SwitchSensor = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.SwitchSensor.__super__.initialize.apply(this, arguments);
                }

              });

/**
 * Implementation of an actuator
 * @class Device.Actuator
 */
              Device.Actuator = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.Actuator.__super__.initialize.apply(this, arguments);
                },

                /**
                 * Send a message to the backend to update the attribute value
                 */
                sendValue: function() {
                  if (this.get("value") === "true") {
                    this.remoteCall("on", []);
                  } else {
                    this.remoteCall("off", []);
                  }
                }

              });

/**
 * Implementation of an illumination sensor
 * @class Device.IlluminationSensor
 */
              Device.IlluminationSensor = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.IlluminationSensor.__super__.initialize.apply(this, arguments);
                }

              });

/**
 * @class Device.KeyCardSensor
 */
              Device.KeyCardSensor = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.KeyCardSensor.__super__.initialize.apply(this, arguments);
                }
              });

/**
 * @class Device.ContactSensor
 */
              Device.ContactSensor = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.ContactSensor.__super__.initialize.apply(this, arguments);
                }
              });

/**
 * @class Device.Plug
 */
              Device.Plug = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize:function() {
                  Device.Plug.__super__.initialize.apply(this, arguments);
                },

                /**
                 * Send a message to the backend to update the attribute plugState
                 */
                sendPlugState:function() {
                  if (this.get("plugState") === "true") {
                    this.remoteCall("on", []);
                  } else {
                    this.remoteCall("off", []);
                  }
                }
              });

/**
 * Implementation of the Phillips Hue lamp
 * 
 * @class Device.PhillipsHue
 */
              Device.PhillipsHue = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.PhillipsHue.__super__.initialize.apply(this, arguments);
                },

                /**
                 * Send a message to the backend to update the attribute value
                 */
                sendValue:function() {
                  if (this.get("value") === "true") {
                    this.remoteCall("On", []);
                  } else {
                    this.remoteCall("Off", []);
                  }
                },

                /**
                 * Send a message to the backend to update the attribute color
                 */
                sendColor:function() {
                  this.remoteCall("setColor", [{ type : "long", value : this.get("color") }], this.id);
                },

                /**
                 * Send a message to the backend to update the attribute saturation
                 */
                sendSaturation:function() {
                  this.remoteCall("setSaturation", [{ type : "int", value : this.get("saturation") }], this.id);
                },

                /**
                 * Send a message to the backend to update the attribute brightness
                 */
                sendBrightness:function() {
                  this.remoteCall("setBrightness", [{ type : "long", value : this.get("brightness") }], this.id);
                }
              });

/**
 * Implementation of the Core Clock
 *
 * @class Device.CoreClock
 */
              Device.CoreClock = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize:function() {
                  var self = this;

                  Device.CoreClock.__super__.initialize.apply(this, arguments);

                  // when the flow rate changes, update the interval that controls the local time
                  this.on("change:flowRate", function() {
                    //clearInterval(this.intervalLocalClockValue);
                    var moi = this;
                    var time = (new Date()).getTime();
                    clearTimeout( moi.timeout );
                    var fctCB = function() {
                      self.updateClockValue();
                      var time = ( (new Date()).getTime() - self.anchorSysTime ) * self.get("flowRate"); // Temps écoulé en terme de l'horloge par rapport à son ancre AnchorTimeSys
                      var dt = ( Math.floor((time+60000)/60000)*60000 - time) / self.get("flowRate");
                      moi.timeout = setTimeout( fctCB, dt + 5);
                    };
                    this.timeout = setTimeout( fctCB, ( Math.floor((time+60000)/60000)*60000 - time + 5 ) / self.get("flowRate") );
                  });

                  // when the ClockSet changes, resynchornize with the server
                  this.on("change:ClockSet", function() {
                    self.synchronizeCoreClock();
                  });

                  // synchronize the core clock with the server every 10 minutes
                  dispatcher.on("systemCurrentTime", function(timeInMillis) {
                    self.set("moment", moment(parseInt(timeInMillis)));
                    self.anchorSysTime = (new Date()).getTime();
                    self.anchorTime = parseInt(timeInMillis);
                    self.updateClockDisplay();
                  });

                  dispatcher.on("systemCurrentFlowRate", function(flowRate){
                    self.set("flowRate", flowRate);
                  });

                  self.synchronizeCoreClock();
                  self.synchronizeFlowRate();

                  // bind the method to this model to avoid this keyword pointing to the window object for the callback on setInterval
                  this.synchronizeCoreClock = _.bind(this.synchronizeCoreClock, this);
                  this.intervalClockValue = setInterval(this.synchronizeCoreClock, 600000);

                  // update the local time every minute
                  this.updateClockValue = _.bind(this.updateClockValue, this);
                },

                /**
                 * Callback to update the clock value - increase the local time of one minute
                 */
                updateClockValue:function() {
                  if(this.anchorSysTime){
                    var delta_ms = ((new Date()).getTime() - this.anchorSysTime) * parseInt(this.get("flowRate"));
                    var ms = this.anchorTime + delta_ms;
                    this.set("moment", moment(ms), {clockRefresh:true});
                    this.updateClockDisplay();
                  }
                },

                /**
                 * Updates clock display values from internal moment
                 */
                updateClockDisplay:function() {
                  this.set("year", this.get("moment").year().toString(), {silent: true});
                  this.set("month", this.get("moment").month().toString(), {silent: true});
                  this.set("day", this.get("moment").day().toString(), {silent: true});
                  this.set("hour", this.get("moment").hour().toString(), {silent: true});
                  if (this.get("hour").length === 1) {
                    this.set("hour", "0" + this.get("hour"), {silent: true});
                  }
                  this.set("minute", this.get("moment").minute().toString(), {clockRefresh: true});
                  if (this.get("minute").length === 1) {
                    this.set("minute", "0" + this.get("minute"), {clockRefresh: true});
                  }
                  this.set("second", this.get("moment").second().toString(), {clockRefresh: true});
                  if (this.get("second").length === 1) {
                    this.set("second", "0" + this.get("second"), {clockRefresh: true});
                  }
                },

                /**
                 * Send a request synchronization with the core clock of the system
                 */
synchronizeCoreClock:function() {
                       this.remoteCall("getCurrentTimeInMillis", [], "systemCurrentTime");
                     },

synchronizeFlowRate:function() {
                      this.remoteCall("getTimeFlowRate", [], "systemCurrentFlowRate");
                    },

                    /**
                     * Remove the automatic synchronization with the server
                     */
                unsynchronize:function() {
                  clearInterval(this.intervalClockValue);
                  clearInterval(this.intervalLocalClockValue);
                },

                /**
                 * Send a message to the backend the core clock time
                 */
                sendTimeInMillis:function() {
                  this.remoteCall("setCurrentTimeInMillis", [{ type : "long", value : this.get("moment").valueOf() }]);
                },

                /**
                 * Send a message to the backend the core clock flow rate
                 */
                sendTimeFlowRate:function() {
                  this.remoteCall("setTimeFlowRate", [{ type : "double", value : this.get("flowRate") }]);
                }
              });

/**
 * Implementation of the core mail
 *
 * @class Device.Mail
 */
              Device.Mail = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize: function() {
                  Device.Mail.__super__.initialize.apply(this, arguments);
                },
              });

/**
 * Implementation of the UPnP media player
 *
 * @class Device.MediaPlayer
 */
              Device.MediaPlayer = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize:function() {
                  Device.MediaPlayer.__super__.initialize.apply(this, arguments);

                  // setting default friendly name if none exists
                  if(this.get("name") === ""){
                    this.set("name", this.get("friendlyName"));
                    this.save();
                  }

                  // listening for volume value
                  dispatcher.on(this.get("id") + ":volume", function(volume) {
                    _.defer(function(){
                      $( ".volume-slider" ).slider({
                        value: volume,
                      });
                    });
                  });
                },

                /**
                 * Send a message to the backend to play the current media
                 */
                sendPlay:function() {
                  var selectedMedia = $("#selectedMedia");
                  var url = selectedMedia.attr("url");
                  if(typeof url !== 'undefined') {
                    console.log("sending play with " + url);
                    this.remoteCall("play", [{"type":"String", "value":url}], "mediaplayer");
                  }
                },

                /**
                 * Send a message to the backend to play the current media
                 */
                sendResume:function() {
                  this.remoteCall("play", [], "mediaplayer");
                },

                /**
                 * Send a message to the backend to pause the current media
                 */
                sendPause:function() {
                  this.remoteCall("pause", [], "mediaplayer");
                },

                /**
                 * Send a message to the backend to stop the media player
                 */
                sendStop:function() {
                  this.remoteCall("stop", [], "mediaplayer");
                },

                /**
                 * Send a message to the backend to set the volume to a given level
                 */
                sendVolume:function(volume) {
                  this.remoteCall("setVolume", [{"type":"int" , "value":volume}], "mediaplayer"); // TODO store the actual volume somewhere and allow to change it
                },

                // Displays a tree of items the player can read
                onBrowseMedia:function(selectedMedia) {
                  var browsers = devices.getMediaBrowsers();
                  var currentDevice;

                  // make sure the tree is empty
                  $(".browser-container").jstree('destroy');

                  var xml_data;
                  for(var i = 0; i<browsers.length; i++){
                    var name = browsers[i].get("friendlyName") !== "" ? browsers[i].get("friendlyName") : browsers[i].get("id");
                    xml_data += "<item id='" + browsers[i].get("id") + "' rel='root'>" + "<content><name>" + name + "</name></content></item>";
                  }


                  var mediabrowser = $(".browser-container").jstree({
                    "xml_data" : {
                      data : "<root>" + xml_data + "</root>"
                    },
                    "themes" : {
                      "theme" : "apple",
                    },
                    "unique" : {
                      "error_callback" : function (n, p, f) {
                        console.log("unique conflict");
                      }
                    },
                    "types" : {
                      "types" : {
                        "media" : {
                          "valid_children" : "none",
                          "icon" : {
                            "image" : "styles/img/drive.png"
                          }
                        },
                      },
                    },
                    "plugins" : [ "xml_data", "themes", "types", "crrm", "ui", "unique"]
                  }).delegate("a", "click", function (event, data) {
                    event.preventDefault();
                    var target = "" + event.currentTarget.parentNode.id;
                    if(typeof currentDevice ==='undefined' || event.currentTarget.parentNode.getAttribute("rel") === "root") {
                      currentDevice = devices.get(target);
                      target = "0";
                    }
                    if(event.currentTarget.parentNode.getAttribute("rel") !== "media"){
                      $("#media-browser-modal .media-button").addClass("disabled");
                      currentDevice.remoteCall("browse", [{"type":"String", "value":target},{"type":"String", "value":"BrowseDirectChildren"},{"type":"String", "value":"*"},{"type":"long" , "value":"0"},{"type":"long" , "value":"0"},{"type":"String", "value":""}], "mediaBrowser");
                    }
                    else {
                      $("#media-browser-modal .media-button").removeClass("disabled");
                      selectedMedia.text(event.currentTarget.parentNode.attributes.title.textContent);
                      selectedMedia.attr("title",event.currentTarget.parentNode.attributes.title.textContent);
                      selectedMedia.attr("url",event.currentTarget.parentNode.attributes.res.textContent);
                    }

                  });


                  dispatcher.on("mediaBrowser", function(result) {
                    var D = null;
                    var P = new DOMParser();
                    if(result !== null && result.indexOf("<empty/>") == -1) {
                      D = P.parseFromString(result , "text/xml");
                      var parentNode;
                      // attaching detected containers to the tree
                      var L_containers = D.querySelectorAll('container');
                      for(var i=0; i<L_containers.length; i++) {
                        var cont = L_containers.item(i);
                        // making sure to not create duplicates
                        if(!document.getElementById( cont.getAttribute('id') )) {
                          parentNode = document.getElementById( cont.getAttribute('parentID') );
                          $(".browser-container").jstree ( "create", parentNode, "inside", { "data" : { "title" :cont.querySelector('title').textContent}, "attr" : { "id" : cont.getAttribute('id'),
                                                          "title" :cont.querySelector('title').textContent, "parent_id" : cont.getAttribute('parentID'), "rel" : 'container' }}, false, true );
                        }
                      }
                      // attaching media items to the tree
                      var L_items = D.querySelectorAll('item');
                      for(i=0; i<L_items.length; i++) {
                        var item = L_items.item(i);
                        // making sure to not create duplicates
                        if(!document.getElementById( "" + item.getAttribute('parentID') + item.getAttribute('id') )) {
                          parentNode = document.getElementById( item.getAttribute('parentID') );
                          $(".browser-container").jstree ( "create", parentNode, "inside", { "data"      : { "title" :item.querySelector('title').textContent} , "attr"      : { "id" : "" + item.getAttribute('parentID') + item.getAttribute('id'),
                                                          "title"     : item.querySelector('title').textContent, "parent_id" : item.getAttribute('parentID'), "rel" : 'media', "res" : item.querySelector('res').textContent }}, false, true );
                        }
                      }
                    }
                  });
                },
              });

/**
 * Implementation of the UPnP media browser
 *
 * @class Device.MediaBrowser
 */
              Device.MediaBrowser = Device.Model.extend({
                /**
                 * @constructor
                 */
                initialize:function() {
                  Device.MediaBrowser.__super__.initialize.apply(this,arguments);
                },


              });
              return Device;
              });
