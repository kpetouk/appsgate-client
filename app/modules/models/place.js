define([
    "app",
    "models/brick",
], function(App, Brick) {

    var Place = {};

    /**
     * Place model class representing a place in AppsGate
     */
    Place = Brick.extend({
        /**
         * @constructor
         */
        initialize: function() {
            var self = this;

            // when a name is updated, update the grammar
            /*this.on("change:name", function() {
                if (typeof window.grammar !== "undefined") {
                    delete window.grammar;
                }
                window.grammar = new Grammar();
            });*/

            // remove potential duplicated entries and trigger a refresh of the list of places event
            this.on("change:devices", function() {
                self.set({devices: _.uniq(self.get("devices"))});
            });
        },
        /**
         * Compute the average value of given sensors
         * 
         * @param sensors Array of sensors
         * @return Average value of the sensors if any, undefined otherwise
         */
        getAverageValue: function(sensors) {
            // return null if there is no temperature sensors in the room
            if (sensors.length === 0) {
                return undefined;
            }

            // compute the average value of the sensors
            var average = 0;
            sensors.forEach(function(s) {
                if (typeof s.get("value") !== "undefined") {
                    average += parseInt(s.get("value"));
                } else {
                    average += parseInt(s.get("consumption"));
                }
            });

            return average / sensors.length;
        },
        /**
         * Compute the average temperature of the place from the temperature sensors in the place
         * 
         * @return Average temperature of the place if any temperature sensor, undefined otherwise
         */
        getAverageTemperature: function() {
            return this.getAverageValue(this.getTemperatureSensors());
        },
        /**
         * Compute the average illumination of the place from the illumination sensors in the place
         * 
         * @return Average illumination of the place if any illumination sensor, undefined otherwise
         */
        getAverageIllumination: function() {
            return this.getAverageValue(this.getIlluminationSensors());
        },
        /**
         * Compute the average consumption of the place from the plugs in the place
         * 
         * @return Average consumption of the place if any consumption sensor, undefined otherwise
         */
        getAverageConsumption: function() {
            return this.getAverageValue(this.getPlugs());
        },
        /**
         * Return all the devices of the place that matches a given type
         * 
         * @param type Type of the devices to retrieve
         * @return Array of devices w/ good type
         */
        getTypeSensors: function(type) {
            type = parseInt(type);

            // in case of wrong type, return an empty array
            if (isNaN(type)) {
                return [];
            }

            // get all the devices that match the type
            var sensorsId = this.get("devices").filter(function(id) {
                return (devices.get(id) !== undefined && devices.get(id).get("type") === type);
            });

            // get all the devices that match the type and the place
            sensors = devices.filter(function(device) {
                return (sensorsId.indexOf(device.get("id").toString()) !== -1);
            });

            return sensors;
        },
        /**
         * Return all the services of the place that matches a given type
         * 
         * @param type Type of the services to retrieve
         * @return Array of services w/ good type
         */
        getTypeServices: function(type) {
            type = parseInt(type);

            // in case of wrong type, return an empty array
            if (isNaN(type)) {
                return [];
            }

            // get all the services that match the type
            var sensorsId = this.get("devices").filter(function(id) {
                return (services.get(id) !== undefined && services.get(id).get("type") === type);                
            });

            // get all the services that match the type and the place
            var result = services.filter(function(service) {
                return (sensorsId.indexOf(service.get("id").toString()) !== -1);
            });

            return result;
        },
        /**
         * @return Array of temperature sensors in the place
         */
        getTemperatureSensors: function() {
            return this.getTypeSensors(0);
        },
        /**
         * @return Array of illumination sensors in the place
         */
        getIlluminationSensors: function() {
            return this.getTypeSensors(1);
        },
        /**
         * @return Array of switches in the place
         */
        getSwitches: function() {
            return this.getTypeSensors(2);
        },
        /**
         * @return Array of contact sensors in the place
         */
        getContactSensors: function() {
            return this.getTypeSensors(3);
        },
        /**
         * @return Array of key-card readers in the place
         */
        getKeyCardReaders: function() {
            return this.getTypeSensors(4);
        },
        /**
         * @return Array of ARD in the place
         */
        getARDLock: function() {
            return this.getTypeSensors(5);
        },
        /**
         * @returns Array of plugs in the place
         */
        getPlugs: function() {
            return this.getTypeSensors(6);
        },
        /**
         * @return Array of Philips Hue lamps in the place
         */
        getPhilipsHueLamps: function() {
            return this.getTypeSensors(7);
        },
        getMediaPlayers: function() {
            return this.getTypeSensors(31);
        },
        /**
         * Send a message to the server to perform a remote call
         * 
         * @param method Remote method name to call
         * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
         */
        remoteCall: function(method, args) {
            communicator.sendMessage({
                method: method,
                args: args
            });
        },
        /**
         * Override its synchronization method to send a notification on the network
         */
        sync: function(method, model) {
            switch (method) {
                case "create":
                    // create an id to the place
                    var id;
                    do {
                        id = "place-" + Math.round(Math.random() * 10000).toString();
                    } while (places.where({id: id}).length > 0);
                    model.set("id", id);

                    this.remoteCall("newPlace", [{type: "JSONObject", value: model.toJSON()}]);
                    
                    model.destroy();
                    break;
                case "delete":
                    this.remoteCall("removePlace", [{type: "String", value: model.get("id")}]);
                    break;
                case "update":
                    this.remoteCall("updatePlace", [{type: "JSONObject", value: model.toJSON()}]);
                    break;
                default:
                    break;
            }
        },
        /**
         * Converts the model to its JSON representation.
         */
        toJSON: function() {
            return {
                id: this.get("id").toString(),
                name: this.get("name"),
                devices: this.get("devices")
            };
        }
    });

    return Place;
});
