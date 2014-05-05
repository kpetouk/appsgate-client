define([
  "app",
  "models/service/service"
], function(App, Service) {

  var Mail = {};

  /**
   * Abstract class regrouping common characteristics shared by all the devices
   *
   * @class Device.Model
   */
  Mail = Service.extend({
    /**
     * @constructor
     */
    initialize: function() {
      Mail.__super__.initialize.apply(this, arguments);
    },
    /**
     * return the list of available actions
     */
    getActions: function() {
      return ["sendMail"];
    },
    /**
     * return the keyboard code for a given action
    */
    getKeyboardForAction: function(act){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      var v = this.getJSONAction("mandatory");
      switch(act) {
        case "sendMail":
          $(btn).append("<span data-i18n='languagesend-mail-action'></span>");
          v.methodName = "sendMailSimple";
          v.args = [ {"type":"string", "value": "jcourtoi@inria.fr"},
                    {"type":"string", "value": "TestSub"},
                    {"type":"string", "value": "TestBody"}];
          v.phrase = "languagesend-mail-action";
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected action found for Mail: " + act);
          btn = null;
          break;
      }
      return btn;
    },
    
  });
  return Mail;
});
