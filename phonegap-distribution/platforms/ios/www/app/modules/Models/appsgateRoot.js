define([
  "app",
  "models/brick",
  "collections/devices",
  "collections/groups",
  "collections/habitats",
  "collections/places",
  "collections/programs",
  "collections/services",
  "collections/universes",
  "collections/users"
], function(App, Brick, Devices, Groups, Habitats, Places, Programs, Services, Universes, Users) {

  var AppsGateRoot = {};

  /**
   * Universe model class, representing a universe in AppsGate
   */
  AppsGateRoot = Brick.extend({

    /**
     * @constructor
     */
    initialize:function() {
      AppsGateRoot.__super__.initialize.apply(this, arguments);
      var self = this;
      console.log("initializing root");

      this.children = [];
      this.Devices = new Devices();
      this.Groups = new Groups();
      this.Habitats = new Habitats();
      this.Places = new Places();
      this.Programs = new Programs();
      this.Services = new Services();
      this.Universes = new Universes();
      this.Users = new Users();

      // listen to the event when the list of bricks is received
      dispatcher.on("listBricks", function(bricks) {
        _.each(bricks, function(brick, i, list) {
          self.addNewBrick(brick);
          if(i >= list.length-1){
            dispatcher.trigger("dataReady");
          }
        });
      });

      // listen to the event when the bricks are initialized
      dispatcher.on("dataReady", function() {
        self.initChildren();
        dispatcher.trigger("treeReady");
      });

      // send the request to fetch the places
      communicator.sendMessage({
        method : "getJSONSpaces",
        args: [],
        callId: "listBricks"
      });
    },

    /**
     * Initializes the brick as a brick corresponding to its type and adds to the current collection
     * @param brick The brick to initialize and append
     */
    addNewBrick:function(brick) {
      var self = this;
      switch (brick.type) {
        case "HABITAT_CURRENT": case "HABITAT_OTHER":
          self.Habitats.addHabitat(brick);
        break;
        case "UNIVERSE": case "PROGRAM_ROOT": case "SERVICE_ROOT": case "DEVICE_ROOT": case "SPATIAL_ROOT": case "USER_ROOT":
          self.Universes.addUniverse(brick);
        break;
        case "USER":
          self.Users.addUser(brick);
        break;
        case "GROUP": case "CATEGORY":
          self.Groups.addGroup(brick);
        break;
        case "PLACE":
          self.Places.addPlace(brick);
        break;
        case "DEVICE":
          self.Devices.addDevice(brick);
        break;
        case "SERVICE":
          self.Services.addService(brick);
        break;
        case "PROGRAM":
          self.Programs.addProgram(brick);
        break;
        default:
          console.log("unknown type", brick.type, brick);
        break;
      }
    },
		
		addKnownBrick:function(brick) {
      var self = this;
      switch (brick.get("type")) {
        case "HABITAT_CURRENT": case "HABITAT_OTHER":
          self.Habitats.add(brick);
        break;
        case "UNIVERSE": case "PROGRAM_ROOT": case "SERVICE_ROOT": case "DEVICE_ROOT": case "SPATIAL_ROOT": case "USER_ROOT":
          self.Universes.add(brick);
        break;
        case "USER":
          self.Users.add(brick);
        break;
        case "GROUP": case "CATEGORY":
          self.Groups.add(brick);
        break;
        case "PLACE":
          self.Places.add(brick);
        break;
        case "DEVICE":
          self.Devices.add(brick);
        break;
        case "SERVICE":
          self.Services.add(brick);
        break;
        case "PROGRAM":
          self.Programs.add(brick);
        break;
        default:
          console.log("unknown type", brick.type, brick);
        break;
      }
    },

    where:function(attributes) {
      var result = [];

      result = result.concat(this.Devices.where(attributes));
      result = result.concat(this.Groups.where(attributes));
      result = result.concat(this.Habitats.where(attributes));
      result = result.concat(this.Places.where(attributes));
      result = result.concat(this.Programs.where(attributes));
      result = result.concat(this.Services.where(attributes));
      result = result.concat(this.Universes.where(attributes));
      result = result.concat(this.Users.where(attributes));

      return result;

    }

  });
  return AppsGateRoot;
});
