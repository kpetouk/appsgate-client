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

            // listen to the event when the list of devices is received
            dispatcher.on("listDevices", function(devices) {
                _.each(devices, function(service) {
                    if (service) {
                        self.addService(service);
                    }
                });
                dispatcher.trigger("servicesReady");
            });
            // listen to the backend notifying when a device appears and add it
            dispatcher.on("newService", function(service) {
                self.addService(service);
            });

            dispatcher.on("removeService", function(serviceId) {
                var service = self.findWhere({id: serviceId});
                self.remove(service);

                console.log(service);
            });

        },
        /**
         * Check the type of device sent by the server, cast it and add it to the collection
         *
         * @param device
         */
        addService: function(brick) {
            var self = this;
            brick.type = parseInt(brick.type);
            switch (brick.type) {
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
                    console.log("unknown type", brick.type, brick);
                    break;
            }
            places.get(brick.placeId).get("devices").push(brick.id);
        },
        /**
         * @return Array of the devices of a given type
         */
        getServicesByType: function() {
            return this.groupBy(function(service) {
                return service.get("type");
            });
        },
        /**
         * @return Core mail of the home - unique device
         */
        getCoreMail: function() {
            return services.findWhere({type: 102});
        },
        /**
         * @return Array of UPnP media players
         */
        getMediaPlayers: function() {
            return services.where({type: 31});
        },
        /**
         * @return Array of UPnP media browsers
         */
        getMediaBrowsers: function() {
            return services.where({type: 36});
        },
    });

    return Services;

});
