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

              // initialize the module
              var Device = {};

              // define the grammar for each type of device
              /*window.deviceTypesGrammar = {
0       : {
eventAnchor             : "eventTemperature",
statusAnchor    : "statusTemperature",
listAnchor              : "{{listOfTemperatureSensors}}",
i18nData                : [
{
grammarAnchor   : "{{changeTemperature}}",
i18nVar                 : "language.change-temperature"
},
{
grammarAnchor   : "{{indicateTemperature}}",
i18nVar                 : "language.indicate-temperature"
}
],
rules                   : [
'eventTemperature = eventAnyTemperature / eventPreciseTemperature',
'eventAnyTemperature = temperatureName:T "<span class=' + "'event'" + '> {{changeTemperature}} </span>"\n\
{\n\
var nodeEvent = {};\n\
nodeEvent.type = "NodeEvent";\n\
nodeEvent.sourceType = "device";\n\
nodeEvent.sourceId = devices.findWhere({ name : $(temperatureName).text() }).get("id");\n\
nodeEvent.eventName = "value";\n\
nodeEvent.eventValue = "";\n\
\n\
return nodeEvent;\n\
}',
'eventPreciseTemperature = temperatureName:T "<span class=' + "'event'" + '> {{indicateTemperature}} </span>" temperature:number "<span class=' + "'event'" + '> degres Celsius </span>"\n\
{\n\
var nodeEvent = {};\n\
nodeEvent.type = "NodeEvent";\n\
nodeEvent.sourceType = "device";\n\
nodeEvent.sourceId = devices.findWhere({ name : $(temperatureName).text() }).get("id");\n\
nodeEvent.eventName = "value";\n\
nodeEvent.eventValue = temperature;\n\
\n\
return nodeEvent;\n\
}',
'statusTemperature = temperatureName:T "<span class=' + "'status'" + '> {{indicateTemperature}} </span>" operator:opComparison temperature:number "<span class=' + "'status'" + '> degres Celsius </span>"\n\
{\n\
var nodeRelationBool = {};\n\
nodeRelationBool.type = "NodeRelationBool";\n\
nodeRelationBool.operator = operator;\n\
\n\
nodeRelationBool.leftOperand = {};\n\
nodeRelationBool.leftOperand.targetType = "device";\n\
nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(temperatureName).text() }).get("id");\n\
nodeRelationBool.leftOperand.methodName = "getTemperature";\n\
nodeRelationBool.leftOperand.returnType = "number";\n\
nodeRelationBool.leftOperand.args = [];\n\
\n\
nodeRelationBool.rightOperand = {};\n\
nodeRelationBool.rightOperand.type = "number";\n\
nodeRelationBool.rightOperand.value = temperature;\n\
\n\
return nodeRelationBool;\n\
}',
"T = {{listOfTemperatureSensors}}"
]
},
1       : {
eventAnchor             : "eventIllumination",
statusAnchor    : "statusIllumination",
listAnchor              : "{{listOfIlluminationSensors}}",
i18nData                : [
{
grammarAnchor   : "{{changeIllumination}}",
i18nVar                 : "language.change-illumination"
},
{
grammarAnchor   : "{{indicateIllumination}}",
                i18nVar                 : "language.indicate-illumination"
}
],
  rules                   : [
  'eventIllumination = eventAnyIllumination / eventPreciseIllumination',
  'eventAnyIllumination = illuminationName:I "<span class=' + "'event'" + '> {{changeIllumination}} </span>"\n\
{\n\
  var nodeEvent = {};\n\
    nodeEvent.type = "NodeEvent";\n\
    nodeEvent.sourceType = "device";\n\
    nodeEvent.sourceId = devices.findWhere({ name : $(illuminationName).text() }).get("id");\n\
    nodeEvent.eventName = "value";\n\
    nodeEvent.eventValue = "";\n\
    \n\
    return nodeEvent;\n\
}',
  'eventPreciseIllumination = illuminationName:I "<span class=' + "'event'" + '> {{indicateIllumination}} </span>" illumination:number "<span class=' + "'event'" + '> Lux </span>"\n\
{\n\
  var nodeEvent = {};\n\
    nodeEvent.type = "NodeEvent";\n\
    nodeEvent.sourceType = "device";\n\
    nodeEvent.sourceId = devices.findWhere({ name : $(illuminationName).text() }).get("id");\n\
    nodeEvent.eventName = "value";\n\
    nodeEvent.eventValue = illumination;\n\
    \n\
    return nodeEvent;\n\
}',
  'statusIllumination = illuminationName:I "<span class=' + "'status'" + '> {{indicateIllumination}} </span>" operator:opComparison illumination:number "<span class=' + "'status'" + '> Lux </span>"\n\
{\n\
  var nodeRelationBool = {};\n\
    nodeRelationBool.type = "NodeRelationBool";\n\
    nodeRelationBool.operator = operator;\n\
    \n\
    nodeRelationBool.leftOperand = {};\n\
    nodeRelationBool.leftOperand.targetType = "device";\n\
    nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(illuminationName).text() }).get("id");\n\
    nodeRelationBool.leftOperand.methodName = "getIllumination";\n\
    nodeRelationBool.leftOperand.returnType = "number";\n\
    nodeRelationBool.leftOperand.args = [];\n\
    \n\
    nodeRelationBool.rightOperand = {};\n\
    nodeRelationBool.rightOperand.type = "number";\n\
    nodeRelationBool.rightOperand.value = illumination;\n\
    \n\
    return nodeRelationBool;\n\
}',
  "I = {{listOfIlluminationSensors}}"
  ]
  },
2       : {
eventAnchor             : "eventSwitch",
                          listAnchor              : "{{listOfSwitches}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{pushedSwitchEvent}}",
                  i18nVar                 : "language.pushed-switch-event"
                          },
                          {
grammarAnchor   : "{{releasedSwitchEvent}}",
                  i18nVar                 : "language.released-switch-event"
                          }
                          ],
                            rules                   : [
                              "eventSwitch = pushedSwitchEvent / releasedSwitchEvent",
                            'pushedSwitchEvent = "<span class=' + "'event'" + '> {{pushedSwitchEvent}} </span>" switchName:S\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(switchName).text() }).get("id");\n\
                                nodeEvent.eventName = "buttonStatus";\n\
                                nodeEvent.eventValue = "true";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'releasedSwitchEvent = "<span class=' + "'event'" + '> {{releasedSwitchEvent}} </span>" switchName:S\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(switchName).text() }).get("id");\n\
                                nodeEvent.eventName = "buttonStatus";\n\
                                nodeEvent.eventValue = "false";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            "S = {{listOfSwitches}}"
                              ]
          },
3       : {
eventAnchor             : "eventContact",
                          statusAnchor    : "statusContact",
                          listAnchor              : "{{listOfContactSensors}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{openedContactEvent}}",
                  i18nVar                 : "language.opened-contact-event"
                          },
                          {
grammarAnchor   : "{{closedContactEvent}}",
                  i18nVar                 : "language.closed-contact-event"
                          },
                          {
grammarAnchor   : "{{contactSensorKeyWord}}",
                  i18nVar                 : "language.contact-sensor-keyword"
                          },
                          {
grammarAnchor   : "{{contactDisassembledEvent}}",
                  i18nVar                 : "language.contact-disassembled-event"
                          },
                          {
grammarAnchor   : "{{contactAssembledEvent}}",
                  i18nVar                 : "language.contact-assembled-event"
                          },
                          {
grammarAnchor   : "{{isClosedContactStatus}}",
                  i18nVar                 : "language.is-closed-contact-status"
                          },
                          {
grammarAnchor   : "{{isAssembledContactStatus}}",
                  i18nVar                 : "language.is-assembled-contact-status"
                          },
                          {
grammarAnchor   : "{{isOpenedContactStatus}}",
                  i18nVar                 : "language.is-opened-contact-status"
                          },
                          {
grammarAnchor   : "{{isDisassembledContactStatus}}",
                  i18nVar                 : "language.is-disassembled-contact-status"
                          }
                          ],
                            rules                   : [
                              "eventContact = openedContactEvent / assembledContactEvent / closedContactEvent / disassembledContactEvent",
                            'openedContactEvent = "<span class=' + "'event'" + '> {{openedContactEvent}} </span>" contactName:C\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeEvent.eventName = "contact";\n\
                                nodeEvent.eventValue = "false";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'disassembledContactEvent = "<span class=' + "'event'" + '> {{contactSensorKeyWord}} </span>" contactName:C "<span class=' + "'event'" + '> {{contactDisassembledEvent}} </span>"\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeEvent.eventName = "contact";\n\
                                nodeEvent.eventValue = "false";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'closedContactEvent = "<span class=' + "'event'" + '> {{closedContactEvent}} </span>" contactName:C\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeEvent.eventName = "contact";\n\
                                nodeEvent.eventValue = "true";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'assembledContactEvent = "<span class=' + "'event'" + '> {{contactSensorKeyWord}} </span>" contactName:C "<span class=' + "'event'" + '> {{contactAssembledEvent}} </span>"\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeEvent.eventName = "contact";\n\
                                nodeEvent.eventValue = "true";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            "statusContact = closedContactStatus / assembledContactStatus / openedContactStatus / disassembledContactStatus",
                            'closedContactStatus = contactName:C "<span class=' + "'status'" + '> {{isClosedContactStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getContactStatus";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "true";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            'assembledContactStatus = "<span class=' + "'status'" + '> {{contactSensorKeyWord}} </span>" contactName:C "<span class=' + "'status'" + '> {{isAssembledContactStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getContactStatus";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "true";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            'openedContactStatus = contactName:C "<span class=' + "'status'" + '> {{isOpenedContactStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getContactStatus";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "false";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            'disassembledContactStatus = "<span class=' + "'status'" + '> {{contactSensorKeyWord}} </span>" contactName:C "<span class=' + "'status'" + '> {{isDisassembledContactStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(contactName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getContactStatus";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "false";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            "C = {{listOfContactSensors}}"
                              ]
          },
4       : {
eventAnchor             : "eventKeyCardReader",
                          statusAnchor    : "statusKeyCardReader",
                          listAnchor              : "{{listOfKeyCardReaders}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{insertedKeycardReaderEvent}}",
                  i18nVar                 : "language.inserted-keycard-reader-event"
                          },
                          {
grammarAnchor   : "{{removedKeycardReaderEvent}}",
                  i18nVar                 : "language.removed-keycard-reader-event"
                          },
                          {
grammarAnchor   : "{{cardInsertedKeycardReaderEvent}}",
                  i18nVar                 : "language.card-inserted-keycard-reader-status"
                          },
                          {
grammarAnchor   : "{{noCardInsertedKeycardReaderEvent}}",
                  i18nVar                 : "language.no-card-inserted-keycard-reader-status"
                          }
                          ],
                            rules                   : [
                              "eventKeyCardReader = insertedKCREvent / removedKCREvent",
                            'insertedKCREvent = "<span class=' + "'event'" + '> {{insertedKeycardReaderEvent}} </span>" KCRName:KCR\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(KCRName).text() }).get("id");\n\
                                nodeEvent.eventName = "inserted";\n\
                                nodeEvent.eventValue = "true";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'removedKCREvent = "<span class=' + "'event'" + '> {{removedKeycardReaderEvent}} </span>" KCRName:KCR\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(KCRName).text() }).get("id");\n\
                                nodeEvent.eventName = "inserted";\n\
                                nodeEvent.eventValue = "false";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            "statusKeyCardReader = cardInsertedKCRStatus / cardRemovedKCRStatus",
                            'cardInsertedKCRStatus = "<span class=' + "'status'" + '> {{cardInsertedKeycardReaderEvent}} </span>" KCRName:KCR\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(KCRName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getCardState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "true";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            'cardRemovedKCRStatus = "<span class=' + "'status'" + '> {{noCardInsertedKeycardReaderEvent}} </span>" KCRName:KCR\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(KCRName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getCardState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "false";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            "KCR = {{listOfKeyCardReaders}}"
                              ]
          },
6       : {
eventAnchor             : "eventPlug",
                          statusAnchor    : "statusPlug",
                          actionAnchor    : "actionPlug",
                          listAnchor              : "{{listOfPlugs}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{turnedOnPlugEvent}}",
                  i18nVar                 : "language.turned-on-plug-event"
                          },
                          {
grammarAnchor   : "{{turnedOffPlugEvent}}",
                  i18nVar                 : "language.turned-off-plug-event"
                          },
                          {
grammarAnchor   : "{{isTurnedOnPlugStatus}}",
                  i18nVar                 : "language.is-turned-on-plug-status"
                          },
                          {
grammarAnchor   : "{{isTurnedOffPlugStatus}}",
                  i18nVar                 : "language.is-turned-off-plug-status"
                          },
                          {
grammarAnchor   : "{{turnOnPlugAction}}",
                  i18nVar                 : "language.turn-on-plug-action"
                          },
                          {
grammarAnchor   : "{{turnOffPlugAction}}",
                  i18nVar                 : "language.turn-off-plug-action"
                          }
                          ],
                            rules                   : [
                              "eventPlug = turnedOnPlugEvent / turnedOffPlugEvent",
                            'turnedOnPlugEvent = "<span class=' + "'event'" + '> {{turnedOnPlugEvent}} </span>" plugName:PL\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(plugName).text() }).get("id");\n\
                                nodeEvent.eventName = "plugState";\n\
                                nodeEvent.eventValue = "true";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'turnedOffPlugEvent = "<span class=' + "'event'" + '> {{turnedOffPlugEvent}} </span>" plugName:PL\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(plugName).text() }).get("id");\n\
                                nodeEvent.eventName = "plugState";\n\
                                nodeEvent.eventValue = "false";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            "statusPlug = isOnPlugStatus / isOffPlugStatus",
                            'isOnPlugStatus = plugName:PL "<span class=' + "'status'" + '> {{isTurnedOnPlugStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(plugName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getRelayState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "true";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            'isOffPlugStatus = plugName:PL "<span class=' + "'status'" + '> {{isTurnedOffPlugStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(plugName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getRelayState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "false";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }\n\
                          ',
                            "actionPlug = onPlugAction / offPlugAction",
                            'onPlugAction = "<span class=' + "'action-name'" + '> {{turnOnPlugAction}} </span>" plugName:PL\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(plugName).text() }).get("id");\n\
                                nodeAction.methodName = "on";\n\
                                nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            'offPlugAction = "<span class=' + "'action-name'" + '> {{turnOffPlugAction}} </span>" plugName:PL\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(plugName).text() }).get("id");\n\
                                nodeAction.methodName = "off";\n\
                                nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            "PL = {{listOfPlugs}}"
                              ]
          },
7       : {
eventAnchor             : "eventLamp",
                          statusAnchor    : "statusLamp",
                          actionAnchor    : "actionLamp",
                          listAnchor              : "{{listOfLamps}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{turnedOnLampEvent}}",
                  i18nVar                 : "language.turned-on-lamp-event"
                          },
                          {
grammarAnchor   : "{{turnedOffLampEvent}}",
                  i18nVar                 : "language.turned-off-lamp-event"
                          },
                          {
grammarAnchor   : "{{isTurnedOnLampStatus}}",
                  i18nVar                 : "language.is-turned-on-lamp-status"
                          },
                          {
grammarAnchor   : "{{isTurnedOffLampStatus}}",
                  i18nVar                 : "language.is-turned-off-lamp-status"
                          },
                          {
grammarAnchor   : "{{turnOnLampAction}}",
                  i18nVar                 : "language.turn-on-lamp-action"
                          },
                          {
grammarAnchor   : "{{turnOffLampAction}}",
                  i18nVar                 : "language.turn-off-lamp-action"
                          },
                          {
grammarAnchor    : "{{changeColorLampAction}}",
                   i18nVar                  : "language.change-color-lamp-action"
                          },
                          {
grammarAnchor    : "{{blinkLampAction}}",
                   i18nVar                  : "language.blink-lamp-action"
                          },
                          {
grammarAnchor   : "{{complementChangeColorLampAction}}",
                  i18nVar                 : "language.complement-change-color-lamp-action"
                          },
                          {
grammarAnchor   : "{{whiteColor}}",
                  i18nVar                 : "language.white-color"
                          },
                          {
grammarAnchor   : "{{redColor}}",
                  i18nVar                 : "language.red-color"
                          },
                          {
grammarAnchor   : "{{blueColor}}",
                  i18nVar                 : "language.blue-color"
                          },
                          {
grammarAnchor   : "{{greenColor}}",
                  i18nVar                 : "language.green-color"
                          },
                          {
grammarAnchor   : "{{yellowColor}}",
                  i18nVar                 : "language.yellow-color"
                          },
                          {
grammarAnchor   : "{{orangeColor}}",
                  i18nVar                 : "language.orange-color"
                          },
                          {
grammarAnchor   : "{{purpleColor}}",
                  i18nVar                 : "language.purple-color"
                          },
                          {
grammarAnchor   : "{{pinkColor}}",
                  i18nVar                 : "language.pink-color"
                          }
                          ],
                            rules                   : [
                              "eventLamp      = turnedOnLampEvent / turnedOffLampEvent",
                            'turnedOnLampEvent = "<span class=' + "'event'" + '> {{turnedOnLampEvent}} </span>" lampName:L\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                nodeEvent.eventName = "value";\n\
                                nodeEvent.eventValue = "true";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'turnedOffLampEvent = "<span class=' + "'event'" + '> {{turnedOffLampEvent}} </span>" lampName:L\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                nodeEvent.eventName = "value";\n\
                                nodeEvent.eventValue = "false";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            "statusLamp     = isOnLampStatus / isOffLampStatus",
                            'isOnLampStatus = lampName:L "<span class=' + "'status'" + '> {{isTurnedOnLampStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getCurrentState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "true";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            'isOffLampStatus = lampName:L "<span class=' + "'status'" + '> {{isTurnedOffLampStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getCurrentState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "false";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            "actionLamp = onLampAction / offLampAction / changeColorLampAction / blinkLampAction",
                            'onLampAction = "<span class=' + "'action-name'" + '> {{turnOnLampAction}} </span>" lampName:L\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                nodeAction.methodName = "On";\n\
                                nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            'offLampAction = "<span class=' + "'action-name'" + '> {{turnOffLampAction}} </span>" lampName:L\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                nodeAction.methodName = "Off";\n\
                                nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            'blinkLampAction = "<span class=' + "'action-name'" + '> {{blinkLampAction}} </span>" lampName:L\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                nodeAction.methodName = "blink";\n\
                                nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            'changeColorLampAction = "<span class=' + "'action-name'" + '> {{changeColorLampAction}} </span>" lampName:L "<span class=' + "'action-name'" + '> {{complementChangeColorLampAction}} </span>" color:lampColor\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(lampName).text() }).get("id");\n\
                                switch ($(color).text()) {\n\
                                  case " {{redColor}} ":\n\
                                                        nodeAction.methodName = "setRed";\n\
                                                          break;\n\
                                  case " {{blueColor}} ":\n\
                                                         nodeAction.methodName = "setBlue";\n\
                                                           break;\n\
                                  case " {{greenColor}} ":\n\
                                                          nodeAction.methodName = "setGreen";\n\
                                                            break;\n\
                                  case " {{yellowColor}} ":\n\
                                                           nodeAction.methodName = "setYellow";\n\
                                                             break;\n\
                                  case " {{orangeColor}} ":\n\
                                                           nodeAction.methodName = "setOrange";\n\
                                                             break;\n\
                                  case " {{purpleColor}} ":\n\
                                                           nodeAction.methodName = "setPurple";\n\
                                                             break;\n\
                                  case " {{pinkColor}} ":\n\
                                                         nodeAction.methodName = "setPink";\n\
                                                           break;\n\
                                  case " {{whiteColor}} ":\n\
                                                          nodeAction.methodName = "setWhite";\n\
                                                            break;\n\
                                  default:\n\
                                }\n\
                              nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            'lampColor = "<span class=' + "'value'" + '> {{whiteColor}} </span>" / "<span class=' + "'value'" + '> {{redColor}} </span>" / "<span class=' + "'value'" + '> {{blueColor}} </span>" / "<span class=' + "'value'" + '> {{greenColor}} </span>" / "<span class=' + "'value'" + '> {{yellowColor}} </span>" / "<span class=' + "'value'" + '> {{orangeColor}} </span>" / "<span class=' + "'value'" + '> {{purpleColor}} </span>" / "<span class=' + "'value'" + '> {{pinkColor}} </span>"',
                            "L = {{listOfLamps}}"
                              ]
          },
8       : {
eventAnchor             : "eventActuator",
                          statusAnchor    : "statusActuator",
                          actionAnchor    : "actionActuator",
                          listAnchor              : "{{listOfActuators}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{turnedOnActuatorEvent}}",
                  i18nVar                 : "language.turned-on-actuator-event"
                          },
                          {
grammarAnchor   : "{{turnedOffActuatorEvent}}",
                  i18nVar                 : "language.turned-off-actuator-event"
                          },
                          {
grammarAnchor   : "{{isTurnedOnActuatorStatus}}",
                  i18nVar                 : "language.is-turned-on-actuator-status"
                          },
                          {
grammarAnchor   : "{{isTurnedOffActuatorStatus}}",
                  i18nVar                 : "language.is-turned-off-actuator-status"
                          },
                          {
grammarAnchor   : "{{turnOnActuatorAction}}",
                  i18nVar                 : "language.turn-on-actuator-action"
                          },
                          {
grammarAnchor   : "{{turnOffActuatorAction}}",
                  i18nVar                 : "language.turn-off-actuator-action"
                          }
                          ],
                            rules                   : [
                              "eventActuator = turnedOnActuatorEvent / turnedOffActuatorEvent",
                            'turnedOnActuatorEvent = "<span class=' + "'event'" + '> {{turnedOnActuatorEvent}} </span>" actuatorName:AL\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(actuatorName).text() }).get("id");\n\
                                nodeEvent.eventName = "actuatorState";\n\
                                nodeEvent.eventValue = "true";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            'turnedOffActuatorEvent = "<span class=' + "'event'" + '> {{turnedOffActuatorEvent}} </span>" actuatorName:AL\n\
                            {\n\
                              var nodeEvent = {};\n\
                                nodeEvent.type = "NodeEvent";\n\
                                nodeEvent.sourceType = "device";\n\
                                nodeEvent.sourceId = devices.findWhere({ name : $(actuatorName).text() }).get("id");\n\
                                nodeEvent.eventName = "actuatorState";\n\
                                nodeEvent.eventValue = "false";\n\
                                \n\
                                return nodeEvent;\n\
                            }',
                            "statusActuator = isOnActuatorStatus / isOffActuatorStatus",
                            'isOnActuatorStatus = actuatorName:AL "<span class=' + "'status'" + '> {{isTurnedOnActuatorStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(actuatorName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getRelayState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "true";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }',
                            'isOffActuatorStatus = actuatorName:AL "<span class=' + "'status'" + '> {{isTurnedOffActuatorStatus}} </span>"\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : $(actuatorName).text() }).get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getRelayState";\n\
                                nodeRelationBool.leftOperand.returnType = "boolean";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "boolean";\n\
                                nodeRelationBool.rightOperand.value = "false";\n\
                                \n\
                                return nodeRelationBool;\n\
                            }\n\
                          ',
                            "actionActuator = onActuatorAction / offActuatorAction",
                            'onActuatorAction = "<span class=' + "'action-name'" + '> {{turnOnActuatorAction}} </span>" actuatorName:AL\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(actuatorName).text() }).get("id");\n\
                                nodeAction.methodName = "on";\n\
                                nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            'offActuatorAction = "<span class=' + "'action-name'" + '> {{turnOffActuatorAction}} </span>" actuatorName:AL\n\
                            {\n\
                              var nodeAction = {};\n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.findWhere({ name : $(actuatorName).text() }).get("id");\n\
                                nodeAction.methodName = "off";\n\
                                nodeAction.args = [];\n\
                                \n\
                                return nodeAction;\n\
                            }',
                            "AL = {{listOfActuators}}"
                              ]
          },
21      : {
eventAnchor             : "eventCoreClock",
                          statusAnchor    : "statusCoreClock",
                          listAnchor              : "{{listOfCoreClock}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{clockEvent}}",
                  i18nVar                 : "language.clock-event"
                          },
                          {
grammarAnchor   : "{{clockStatus}}",
                  i18nVar                 : "language.clock-status"
                          }
                          ],
                            rules                   : [
                              'eventCoreClock = "<span class=' + "'event'" + '> {{clockEvent}} </span>" time:time\n\
                              {\n\
                                var nodeEvent = {};\n\
                                  \n\
                                  nodeEvent.type = "NodeEvent";\n\
                                  nodeEvent.sourceType = "device";\n\
                                  nodeEvent.sourceId = devices.getCoreClock().get("id");\n\
                                  nodeEvent.eventName = "ClockAlarm";\n\
                                  nodeEvent.eventValue = time;\n\
                                  \n\
                                  return nodeEvent;\n\
                              }',
                            'statusCoreClock = "<span class=' + "'status'" + '> {{clockStatus}} </span>" time:time\n\
                            {\n\
                              var nodeRelationBool = {};\n\
                                nodeRelationBool.type = "NodeRelationBool";\n\
                                nodeRelationBool.operator = "==";\n\
                                \n\
                                nodeRelationBool.leftOperand = {};\n\
                                nodeRelationBool.leftOperand.targetType = "device";\n\
                                nodeRelationBool.leftOperand.targetId = devices.getCoreClock().get("id");\n\
                                nodeRelationBool.leftOperand.methodName = "getCurrentTimeInMillis";\n\
                                nodeRelationBool.leftOperand.returnType = "number";\n\
                                nodeRelationBool.leftOperand.args = [];\n\
                                \n\
                                nodeRelationBool.rightOperand = {};\n\
                                nodeRelationBool.rightOperand.type = "number";\n\
                                nodeRelationBool.rightOperand.value = time;\n\
                                \n\
                                return nodeRelationBool;\n\
                            }'
                          ]
          },
31              : {
actionAnchor    : "actionMediaPlayer",
                  listAnchor              : "{{listOfMediaPlayers}}",
                  i18nData                : [
                  {
grammarAnchor   : "{{playMediaPlayerAction}}",
                  i18nVar                 : "language.play-media-player-action"
                  },
                  {
grammarAnchor   : "{{pauseMediaPlayerAction}}",
                  i18nVar                 : "language.pause-media-player-action"
                  },
                  {
grammarAnchor   : "{{stopMediaPlayerAction}}",
                  i18nVar                 : "language.stop-media-player-action"
                  },
                  {
grammarAnchor   : "{{setVolumeMediaPlayerAction}}",
                  i18nVar                 : "language.set-volume-media-player-action"
                  },
                  {
grammarAnchor   : "{{complementMediaPlayerAction}}",
                  i18nVar                 : "language.complement-media-player-action"
                  },
                  {
grammarAnchor   : "{{alarmMusic}}",
                  i18nVar                 : "language.alarm-music"
                  },
                  {
grammarAnchor   : "{{music}}",
                  i18nVar                 : "language.music"
                  },
                  {
grammarAnchor   : "{{ringBellMailArrived}}",
                  i18nVar                 : "language.ring-bell-mail-arrived"
                  },
                  {
grammarAnchor   : "{{radio}}",
                  i18nVar                 : "language.radio"
                  },
                  {
grammarAnchor   : "{{movie}}",
                  i18nVar                 : "language.movie"
                  },
                  {
grammarAnchor    : "{{imgTable}}",
                   i18nVar                  : "language.img-table"
                  },
                  {
grammarAnchor    : "{{selectedMusic}}",
                   i18nVar                  : "language.selectedMusic"
                  }
                  ],
                    rules                   : [
                      'actionMediaPlayer = playMediaPlayerAction / pauseMediaPlayerAction / stopMediaPlayerAction / setVolumeMediaPlayerAction',
                    'playMediaPlayerAction = "<span class=' + "'action-name'" + '> {{playMediaPlayerAction}} </span>" media:music "<span class=' + "'action-name'" + '> {{complementMediaPlayerAction}} </span>" mediaPlayerName:M\n\
                    {\n\
                      var nodeAction = {};\n\
                        nodeAction.type = "NodeAction";\n\
                        nodeAction.targetType = "device";\n\
                        nodeAction.targetId = devices.findWhere({ name : $(mediaPlayerName).text() }).get("id");\n\
                        nodeAction.methodName = "play";\n\
                        nodeAction.args = [{ type : "String", value : media }];\n\
                        \n\
                        return nodeAction;\n\
                    }',
                    'pauseMediaPlayerAction = "<span class=' + "'action-name'" + '> {{pauseMediaPlayerAction}} </span>" mediaPlayerName:M\n\
                    {\n\
                      var nodeAction = {};\n\
                        nodeAction.type = "NodeAction";\n\
                        nodeAction.targetType = "device";\n\
                        nodeAction.targetId = devices.findWhere({ name : $(mediaPlayerName).text() }).get("id");\n\
                        nodeAction.methodName = "pause";\n\
                        nodeAction.args = [];\n\
                        \n\
                        return nodeAction;\n\
                    }',
                    'stopMediaPlayerAction = "<span class=' + "'action-name'" + '> {{stopMediaPlayerAction}} </span>" mediaPlayerName:M\n\
                    {\n\
                      var nodeAction = {};\n\
                        nodeAction.type = "NodeAction";\n\
                        nodeAction.targetType = "device";\n\
                        nodeAction.targetId = devices.findWhere({ name : $(mediaPlayerName).text() }).get("id");\n\
                        nodeAction.methodName = "stop";\n\
                        nodeAction.args = [];\n\
                        \n\
                        return nodeAction;\n\
                    }',
                    'setVolumeMediaPlayerAction = "<span class=' + "'action-name'" + '> {{setVolumeMediaPlayerAction}} </span>" mediaPlayerName:M "<span class=' + "'action-name'" + '> {{complementMediaPlayerAction}} </span>" volume:number "<span class=' + "'action-name'" + '> % </span>"\n\
                    {\n\
                      var nodeAction = {};\n\
                        nodeAction.type = "NodeAction";\n\
                        nodeAction.targetType = "device";\n\
                        nodeAction.targetId = devices.findWhere({ name : $(mediaPlayerName).text() }).get("id");\n\
                        nodeAction.methodName = "setVolume";\n\
                        nodeAction.args = [{ type : "int", value : volume }];\n\
                        \n\
                        return nodeAction;\n\
                    }',
                    'M = {{listOfMediaPlayers}}'                    ]
                  },
102             : {
eventAnchor             : "eventCoreMail",
                          actionAnchor    : "actionMail",
                          listAnchor              : "{{listOfMailboxes}}",
                          i18nData                : [
                          {
grammarAnchor   : "{{receivedMailEvent}}",
                  i18nVar                 : "language.received-mail-event"
                          },
                          {
grammarAnchor   : "{{sendMailAction}}",
                  i18nVar                 : "language.send-mail-action"
                          },
                          {
grammarAnchor   : "{{wellArrivedSubject}}",
                  i18nVar                 : "language.well-arrived-subject"
                          }
                          ],
                            rules                   : [
                              'eventCoreMail = "<span class=' + "'event'" + '> {{receivedMailEvent}} </span>"\n\
                              {\n\
                                var nodeEvent = {};\n\
                                  \n\
                                  nodeEvent.type = "NodeEvent";\n\
                                  nodeEvent.sourceType = "device";\n\
                                  nodeEvent.sourceId = devices.getCoreMail().get("id");\n\
                                  nodeEvent.eventName = "newMail";\n\
                                  nodeEvent.eventValue = "smarthome.inria@gmail.com";\n\
                                  \n\
                                  return nodeEvent;\n\
                              }',
                            'actionMail = "<span class=' + "'action-name'" + '> {{sendMailAction}} </span>" emailAddress:emailAddress\n\
                            {\n\
                              var nodeAction = {};\n\
                                \n\
                                nodeAction.type = "NodeAction";\n\
                                nodeAction.targetType = "device";\n\
                                nodeAction.targetId = devices.getCoreMail().get("id");\n\
                                nodeAction.methodName = "sendMailSimple";\n\
                                nodeAction.args = [\n\
                                { type : "String", value : emailAddress },\n\
                              { type : "String", value : "{{wellArrivedSubject}}" },\n\
                              { type : "String", value : "" }\n\
                              ];\n\
                                \n\
                                return nodeAction;\n\
                            }'
                          ]
                  }
};*/

/**
 * Router to handle the routes for the devices
 *
 * @class Device.Router
 */
              Device.Router = Backbone.Router.extend({
                // define the routes for the devices
                routes: {
                  "devices": "list",
                  "devices/types/:id": "deviceByType",
                  "devices/:id": "details"
                },

                /**
                 * @method list Show the list of devices
                 */
                list: function() {
                  // display the side menu
                  appRouter.showMenuView(new Device.Views.Menu());

                  // set active the first element - displayed by default
                  $($($(".aside-menu .list-group")[1]).find(".list-group-item")[0]).addClass("active");

                  // display the first category of devices
                  var typeId = $($($(".aside-menu .list-group")[1]).find(".list-group-item")[0]).attr("id").split("side-")[1];
                  appRouter.showView(new Device.Views.DevicesByType({ id: typeId }));

                  // update the url
                  appRouter.navigate("#devices/types/" + typeId);
                },

                /**
                 * Display all the devices of a given type
                 * 
                 * @param typeId id of the device category to show
                 */
                deviceByType:function(typeId) {
                  appRouter.showView(new Device.Views.DevicesByType({ id: typeId }));
                },

                /**
                 * Show the details of a device
                 *
                 * @method details
                 * @param id Id of the device to show
                 */
                details: function(id) {
                  appRouter.showView(new Device.Views.Details({ model: devices.get(id) }));
                }
              });

              // instantiate the router
              var router = new Device.Router();

              /**
               * Abstract class regrouping common characteristics shared by all the devices
               *
               * @class Device.Model
               */
              Device.Model = Backbone.Model.extend({

                /**
                 * @constructor 
                 */
                initialize: function() {
                  var self = this;

                  // when a name is updated, update the grammar
                  this.on("change:name", function() {
                    delete window.grammar;
                    window.grammar = new Grammar();
                  });

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
