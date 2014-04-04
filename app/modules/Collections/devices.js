define([
    "app",
    "models/device/device",
    "models/device/temperaturesensor",
    "models/device/illuminationsensor",
    "models/device/switchsensor",
    "models/device/contactsensor",
    "models/device/keycardsensor",
    "models/device/ardlock",
    "models/device/plug",
    "models/device/phillipshue",
    "models/device/actuator",
    "models/device/coreclock"
], function(App, Device, TemperatureSensor, IlluminationSensor, SwitchSensor, ContactSensor, KeyCardSensor, ARDLock, Plug, PhillipsHue, Actuator, CoreClock) {

    var Devices = {};

    // collection
    Devices = Backbone.Collection.extend({
        model: Device,
        /**
         * Fetch the devices from the server
         *
         * @constructor
         */
        initialize: function() {
            var self = this;

            // listen to the event when the list of devices is received
            dispatcher.on("listDevices", function(devices) {
                _.each(devices, function(device) {
                    self.addDevice(device);
                });
                dispatcher.trigger("devicesReady");
            });

            // listen to the backend notifying when a device appears and add it
            dispatcher.on("newDevice", function(device) {
                self.addDevice(device);
            });

            dispatcher.on("removeDevice", function(deviceId) {
                var device = devices.findWhere({id: deviceId});
                devices.remove(device);

                console.log(device);

                // update the grammar to take the new program in consideration
                /*if (typeof window.grammar !== "undefined") {
                    delete window.grammar;
                }
                window.grammar = new Grammar();*/
            });

            // send the request to fetch the devices
            communicator.sendMessage({
                method: "getDevices",
                args: [],
                callId: "listDevices"
            });
        },
        /**
         * Check the type of device sent by the server, cast it and add it to the collection
         *
         * @param device
         */
        addDevice: function(brick) {
            var self = this;
            brick.type = parseInt(brick.type);
            switch (brick.type) {
                case 0:
                    self.add(new TemperatureSensor(brick));
                    break;
                case 1:
                    self.add(new IlluminationSensor(brick));
                    break;
                case 2:
                    self.add(new SwitchSensor(brick));
                    break;
                case 3:
                    self.add(new ContactSensor(brick));
                    break;
                case 4:
                    self.add(new KeyCardSensor(brick));
                    break;
                case 5:
                    self.add(new ARDLock(brick));
                    break;
                case 6:
                    self.add(new Plug(brick));
                    break;
                case 7:
                    self.add(new PhillipsHue(brick));
                    break;
                case 8:
                    self.add(new Actuator(brick));
                    break;
                case 21:
                    self.add(new CoreClock(brick));
                    break;
                default:
                    //console.log("unknown type", brick.type, brick);
                    break;
            }
            places.get(brick.placeId).get("devices").push(brick.id);
        },
        /**
         * @return Array of the devices of a given type
         */
        getDevicesByType: function() {
            return this.groupBy(function(device) {
                return device.get("type");
            });
        },
        /**
         * @return Array of the temperature sensors
         */
        getTemperatureSensors: function() {
            return devices.where({type: 0});
        },
        /**
         * @return Array of the illumination sensors
         */
        getIlluminationSensors: function() {
            return devices.where({type: 1});
        },
        /**
         * @return Array of the switches
         */
        getSwitches: function() {
            return devices.where({type: 2});
        },
        /**
         * @return Array of the contact sensors
         */
        getContactSensors: function() {
            return devices.where({type: 3});
        },
        /**
         * @return Array of the key-card readers
         */
        getKeyCardReaders: function() {
            return devices.where({type: 4});
        },
        /**
         * @returns Array of the ARD Locks
         */
        getARDLocks: function() {
            return devices.where({type: 5});
        },
        /**
         * @return Array of the plugs
         */
        getPlugs: function() {
            return devices.where({type: 6});
        },
        /**
         * @return Array of the lamps
         */
        getLamps: function() {
            return devices.where({type: 7});
        },
        /**
         * @return Array of the switch actuators
         */
        getActuators: function() {
            return devices.where({type: 8});
        },
        /**
         * @return Core clock of the home - unique device
         */
        getCoreClock: function() {
            return devices.findWhere({type: 21});
        },
        /**
         * @return Array of the unlocated devices
         */
        getUnlocatedDevices: function() {
            return this.filter(function(device) {
                return device.get("placeId") === "-1";
            });
        },
        /**
         * @return Dictionnary of the devices sorted by their type - key is the type id, value - array of devices corresponding the type
         */
        getUnlocatedDevicesByType: function() {
            return _.groupBy(this.getUnlocatedDevices(), function(device) {
                return device.get("type");
            });
        }
    });

    return Devices;

});
