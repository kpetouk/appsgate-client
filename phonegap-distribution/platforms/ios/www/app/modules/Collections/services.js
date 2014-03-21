define([
  "app",
  "models/service/service",
  "models/service/mediaplayer",
  "models/service/mediabrowser",
  "models/service/mail"
], function(App, Service, MediaPlayer, MediaBrowser, Mail) {

  var Services = {};

  // collection
  Services = Backbone.Collection.extend({
    model: Service,

    /**
     * Fetch the devices from the server
     *
     * @constructor
     */
    initialize: function() {
      var self = this;

      // listen to the backend notifying when a device appears and add it
      dispatcher.on("newDevice", function(device) {
        self.addService(device);
      });

      dispatcher.on("removeDevice", function(deviceId) {
        var device = self.findWhere({ id : deviceId });
        self.remove(device);

        console.log(device);
      });

    },

    /**
     * Check the type of device sent by the server, cast it and add it to the collection
     *
     * @param device
     */
    addService:function(brick) {
      var self = this;
      var serviceType;
      for(var i in brick.properties) {
        if(brick.properties[i].key === "serviceType") {
          serviceType = brick.properties[i].value;
        }
      }
      switch (parseInt(serviceType)) {
        case 31:
          self.add(new MediaPlayer(brick));
        break;
        case 36:
          self.add(new MediaBrowser(brick));
        break;
        case 102:
          self.add(new Mail(brick));
        break;
        default:
          console.log("unknown type", serviceType, brick);
        break;
      }
    },

    /**
     * @return Array of the devices of a given type
     */
    getServicesByType:function() {
      return this.groupBy(function(service) {
        return service.get("type");
      });
    },

    /**
     * @return Core mail of the home - unique device
     */
    getCoreMail:function() {
      return devices.findWhere({ type : 102 });
    },

    /**
     * @return Array of UPnP media players
     */
    getMediaPlayers:function() {
      return devices.where({ type : 31 });
    },

    /**
     * @return Array of UPnP media browsers
     */
    getMediaBrowsers:function() {
      return devices.where({ type : 36 });
    },

  });

  return Services;

});
