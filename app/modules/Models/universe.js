define([
  "app",
  "models/brick"
], function(App, Brick) {

	var Universe = {};

  /**
	 * Universe model class, representing a universe in AppsGate
	 */
  Universe = Brick.extend({

    // default values
    defaults: {
        name : "",
        places : [],
        devices: [],
        programs: []
    },

    /**
     * @constructor
     */
    initialize:function() {
      var self = this;
    },

    /**
     * Send a message to the server to perform a remote call
     * 
     * @param method Remote method name to call
     * @param args Array containing the argument taken by the method. Each entry of the array has to be { type : "", value "" }
     */
    remoteCall:function(method, args) {
      communicator.sendMessage({
        method  : method,
        args    : args
      });
    },

    /**
     * Override its synchronization method to send a notification on the network
     */
    sync:function(method, model) {
      switch (method) {
        case "create":
          // create an id to the place
          var id;
        do {
          id = "place-" + Math.round(Math.random() * 10000).toString();
        } while (places.where({ id : id }).length > 0);
        model.set("id", id);

        this.remoteCall("newPlace", [{ type : "JSONObject", value : model.toJSON() }]);
        break;
        case "delete":
          this.remoteCall("removePlace", [{ type : "String", value : model.get("id") }]);
        break;
        case "update":
          this.remoteCall("updatePlace", [{ type : "JSONObject", value : model.toJSON() }]);
        break;
        default:
          break;
      }
    },

    /**
     * Converts the model to its JSON representation.
     */
    toJSON:function() {
      return {
        id : this.get("id").toString(),
        name : this.get("name"),
        devices : this.get("devices")
      };
    }
  });
	return Universe;
});
