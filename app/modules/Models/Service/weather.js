define([
  "app",
  "models/service/service",
  "text!templates/program/nodes/weatherStateCodeNode.html"
], function(App, Service, ActionTemplate) {

  var Weather = {};

  /**
   * Implementation of the Yahoo Weather service
   * 
   * @class Service.Weather
   */
  Weather = Service.extend({
    /**
     * @constructor
     */
    initialize: function() {
      Weather.__super__.initialize.apply(this, arguments);
    },
    
    /**
     * Weather Events (TODO) should only be to notify of a weather change ( ???)
     */
    
        /**
     * return the list of available states
     */
    getStates: function() {
      return ["isWeatherCodeForecast"];
    },
    /**
     * return the keyboard code for a given state
    */
    getKeyboardForState: function(state){
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      var v = this.getJSONState("mandatory");

      switch(state) {
        case "isWeatherCodeForecast":
          $(btn).append("<span data-i18n='keyboard.is-weather-code-state'><span>");
          
          v.methodName = "isWeatherCodeForecast";
          v.returnType = "boolean";          
                              
          v.args = [ {"type":"String", "value": "Grenoble"},
                    {"type":"int", "value": "0"},
                    {"type":"int", "value": "0"}];          
                    
          v.phrase = "keyboard.is-weather-code-state";
          $(btn).attr("json", JSON.stringify(v));
          break;
        default:
          console.error("unexpected state found for Weather: " + state);
          btn = null;
          break;
      }
      return btn;
    },    


    /**
     * return the list of available properties
     */
    getProperties: function() {
      return ["getWeatherCodeForecast", "getMinTemperatureForecast", "getMaxTemperatureForecast", "getAvgTemperatureForecast"];
    },
    /**
     * return the keyboard code for a given property
     */
    getKeyboardForProperty: function(property) {
      var btn = jQuery.parseHTML("<button class='btn btn-default btn-keyboard specific-node' ></button>");
      var v = this.getJSONProperty("mandatory");
      switch(property) {
        case "getWeatherCodeForecast":
          $(btn).append("<span data-i18n='keyboard.weather-code'><span>");
          
		  v.methodName = property;
          v.args = [ {"type":"String", "value": "Grenoble"},
                    {"type":"int", "value": "0"}];          
          v.returnType = "number";
          v.phrase = "keyboard.weather-code";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "getMinTemperatureForecast":
          $(btn).append("<span data-i18n='keyboard.weather-code'><span>");
          
		  v.methodName = property;
          v.args = [ {"type":"String", "value": "Grenoble"},
                    {"type":"int", "value": "0"}];          
          v.returnType = "number";
          v.phrase = "keyboard.weather-code";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "getMaxTemperatureForecast":
          $(btn).append("<span data-i18n='keyboard.weather-code'><span>");
          
		  v.methodName = property;
          v.args = [ {"type":"String", "value": "Grenoble"},
                    {"type":"int", "value": "0"}];          
          v.returnType = "number";
          v.phrase = "keyboard.weather-code";
          $(btn).attr("json", JSON.stringify(v));
          break;
        case "getAvgTemperatureForecast":
          $(btn).append("<span data-i18n='keyboard.weather-code'><span>");
          
		  v.methodName = property;
          v.args = [ {"type":"String", "value": "Grenoble"},
                    {"type":"int", "value": "0"}];          
          v.returnType = "number";
          v.phrase = "keyboard.weather-code";
          $(btn).attr("json", JSON.stringify(v));
          break;
          
        default:
          console.error("unexpected service state found for Weather : " + property);
          btn = null;
          break;
      }
      return btn;
    },
	    /**
     * @returns the action template specific for lamps
     */
    getTemplateAction: function() {
      return _.template(ActionTemplate);  
    },

  });
  return Weather;
});
