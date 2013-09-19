define([
	"jquery",
	"underscore",
	"backbone",
	"raphael",
	"text!templates/devices/menu/deviceContainer.html",
	"text!templates/devices/list/deviceListByCategory.html",
	"text!templates/devices/details/deviceContainer.html",
	"text!templates/devices/details/contact.html",
	"text!templates/devices/details/illumination.html",
	"text!templates/devices/details/keyCard.html",
	"text!templates/devices/details/switch.html",
	"text!templates/devices/details/temperature.html",
	"text!templates/devices/details/plug.html",
	"text!templates/devices/details/phillipsHue.html",
	"colorWheel"
], function($, _, Backbone, Raphael, deviceContainerMenuTemplate, 
		deviceListByCategoryTemplate,
		deviceDetailsTemplate,
		contactDetailTemplate, illuminationDetailTemplate,
		keyCardDetailTemplate, switchDetailTemplate, temperatureDetailTemplate,
		plugDetailTemplate, phillipsHueDetailTemplate) {
	
	// initialize the module
	var Device = {};

	// global variables concerning the devices
	window.deviceTypesName = {
		0 : {
			singular	: "Capteur de temp&eacute;rature",
			plural		: "Capteurs de temp&eacute;rature"
		},
		1 : {
			singular	: "Capteur de luminosit&eacute;",
			plural		: "Capteurs de luminosit&eacute;"
		},
		2 : {
			singular	: "Interrupteur",
			plural		: "Interrupteurs"
		},
		3 : {
			singular	: "Capteur de contact",
			plural		: "Capteurs de contact"
		},
		4 : {
			singular	: "Lecteur de carte",
			plural		: "Lecteurs de carte"
		},
		5 : {
			singular	: "Capteur de mouvement",
			plural		: "Capteurs de mouvement"
		},
		6 : {
			singular	: "Prise gigogne",
			plural		: "Prises gigogne"
		},
		7 : {
			singular	: "Lampe Philips Hue",
			plural		: "Lampes Philips Hue"
		}
	};
	
	// define the grammar for each type of device
	window.deviceTypesGrammar = {
		0	: {
			eventAnchor		: "eventTemperature",
			statusAnchor	: "statusTemperature",
			listAnchor		: "{{listOfTemperatureSensors}}",
			rules			: [
				"eventTemperature = temperatureName:T sep 'indique' sep temperature:number sep 'degres'\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : temperatureName }).get('id');\n\
					nodeEvent.eventName = 'value';\n\
					nodeEvent.eventValue = temperature;\n\
					\n\
					return nodeEvent;\n\
				}",
				"statusTemperature = temperatureName:T sep 'indique' sep temperature:number sep 'degres'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : temperatureName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getTemperature';\n\
					nodeRelationBool.leftOperand.returnType = 'number';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'number';\n\
					nodeRelationBool.rightOperand.value = temperature;\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"T = {{listOfTemperatureSensors}}"
			]
		},
		1	: {
			eventAnchor		: "eventIllumination",
			statusAnchor	: "statusIllumination",
			listAnchor		: "{{listOfIlluminationSensors}}",
			rules			: [
				"eventIllumination = illuminationName:I sep 'indique' sep illumination:number sep 'Lux'\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : illuminationName }).get('id');\n\
					nodeEvent.eventName = 'value';\n\
					nodeEvent.eventValue = illumination;\n\
					\n\
					return nodeEvent;\n\
				}",
				"statusIllumination = illuminationName:I sep 'indique' sep illumination:number sep 'Lux'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : illuminationName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getIllumination';\n\
					nodeRelationBool.leftOperand.returnType = 'number';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'number';\n\
					nodeRelationBool.rightOperand.value = illumination;\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"I = {{listOfIlluminationSensors}}"
			]
		},
		2	: {
			eventAnchor		: "eventSwitch",
			listAnchor		: "{{listOfSwitches}}",
			rules			: [
				"eventSwitch = pushedSwitchEvent / releasedSwitchEvent",
				"pushedSwitchEvent = 'on appuie sur' sep switchName:S\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : switchName }).get('id');\n\
					nodeEvent.eventName = 'buttonStatus';\n\
					nodeEvent.eventValue = 'true';\n\
					\n\
					return nodeEvent;\n\
				}",
				"releasedSwitchEvent = 'on relache' sep switchName:S\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : switchName }).get('id');\n\
					nodeEvent.eventName = 'buttonStatus';\n\
					nodeEvent.eventValue = 'false';\n\
					\n\
					return nodeEvent;\n\
				}",
				"S = {{listOfSwitches}}"
			]
		},
		3	: {
			eventAnchor		: "eventContact",
			statusAnchor	: "statusContact",
			listAnchor		: "{{listOfContactSensors}}",
			rules			: [
				"eventContact = openedContactEvent / assembledContactEvent / closedContactEvent / disassembledContactEvent",
				"openedContactEvent = 'on ouvre' sep contactName:C\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = {};\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeEvent.eventName = 'contact';\n\
					nodeEvent.eventValue = 'false';\n\
					\n\
					return nodeEvent;\n\
				}",
				"disassembledContactEvent = 'le capteur de contact de' sep contactName:C sep 'se desassemble'\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeEvent.eventName = 'contact';\n\
					nodeEvent.eventValue = 'false';\n\
					\n\
					return nodeEvent;\n\
				}",
				"closedContactEvent = 'on ferme' sep contactName:C\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeEvent.eventName = 'contact';\n\
					nodeEvent.eventValue = 'true';\n\
					\n\
					return nodeEvent;\n\
				}",
				"assembledContactEvent = 'le capteur de contact de' sep contactName:C sep 's assemble'\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeEvent.eventName = 'contact';\n\
					nodeEvent.eventValue = 'true';\n\
					\n\
					return nodeEvent;\n\
				}",
				"statusContact = closedContactStatus / assembledContactStatus / openedContactStatus / disassembledContactStatus",
				"closedContactStatus = contactName:C sep 'est ferme'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getContactStatus';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'true';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"assembledContactStatus = 'le capteur de contact de' sep contactName:C sep 'est assemble'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getContactStatus';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'true';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"openedContactStatus = contactName:C sep 'est ouvert'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getContactStatus';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'false';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"disassembledContactStatus = 'le capteur de contact de' sep contactName:C sep 'est desassemble'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : contactName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getContactStatus';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'false';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"C = {{listOfContactSensors}}"
			]
		},
		4	: {
			eventAnchor		: "eventKeyCardReader",
			statusAnchor	: "statusKeyCardReader",
			listAnchor		: "{{listOfKeyCardReaders}}",
			rules			: [
				"eventKeyCardReader = insertedKCREvent / removedKCREvent",
				"insertedKCREvent = 'on insere une carte dans' sep KCRName:KCR\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : KCRName }).get('id');\n\
					nodeEvent.eventName = 'inserted';\n\
					nodeEvent.eventValue = 'true';\n\
					\n\
					return nodeEvent;\n\
				}",
				"removedKCREvent = 'on retire une carte de' sep KCRName:KCR\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : KCRName }).get('id');\n\
					nodeEvent.eventName = 'inserted';\n\
					nodeEvent.eventValue = 'false';\n\
					\n\
					return nodeEvent;\n\
				}",
				"statusKeyCardReader = cardInsertedKCRStatus / cardRemovedKCRStatus",
				"cardInsertedKCRStatus = 'une carte est inseree dans' sep KCRName:KCR\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : KCRName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getCardState';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'true';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"cardRemovedKCRStatus = 'aucune carte n est inseree dans' sep KCRName:KCR\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : KCRName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getCardState';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'false';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"KCR = {{listOfKeyCardReaders}}"
			]
		},
		6	: {
			eventAnchor		: "eventPlug",
			statusAnchor	: "statusPlug",
			actionAnchor	: "actionPlug",
			listAnchor		: "{{listOfPlugs}}",
			rules			: [
				"eventPlug = turnedOnPlugEvent / turnedOffPlugEvent",
				"turnedOnPlugEvent = 'on allume' sep plugName:PL\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : plugName }).get('id');\n\
					nodeEvent.eventName = 'plugState';\n\
					nodeEvent.eventValue = 'true';\n\
					\n\
					return nodeEvent;\n\
				}",
				"turnedOffPlugEvent = 'on eteint' sep plugName:PL\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : plugName }).get('id');\n\
					nodeEvent.eventName = 'plugState';\n\
					nodeEvent.eventValue = 'false';\n\
					\n\
					return nodeEvent;\n\
				}",
				"statusPlug = isOnPlugStatus / isOffPlugStatus",
				"isOnPlugStatus = plugName:PL sep 'est allume'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : plugName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getRelayState';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'true';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"isOffPlugStatus = plugName:PL sep 'est eteint'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : plugName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getRelayState';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'false';\n\
					\n\
					return nodeRelationBool;\n\
				}\n\
				",
				"actionPlug = onPlugAction / offPlugAction",
				"onPlugAction = 'allumer' sep plugName:PL\n\
				{\n\
					var nodeAction = {};\n\
					nodeAction.type = 'NodeAction';\n\
					nodeAction.deviceId = devices.findWhere({ name : plugName }).get('id');\n\
					nodeAction.methodName = 'on';\n\
					nodeAction.args = [];\n\
					\n\
					return nodeAction;\n\
				}",
				"offPlugAction = 'eteindre' sep plugName:PL\n\
				{\n\
					var nodeAction = {};\n\
					nodeAction.type = 'NodeAction';\n\
					nodeAction.deviceId = devices.findWhere({ name : plugName }).get('id');\n\
					nodeAction.methodName = 'off';\n\
					nodeAction.args = [];\n\
					\n\
					return nodeAction;\n\
				}",
				"PL = {{listOfPlugs}}"
			]
		},
		7	: {
			eventAnchor		: "eventLamp",
			statusAnchor	: "statusLamp",
			actionAnchor	: "actionLamp",
			listAnchor		: "{{listOfLamps}}",
			rules			: [
				"eventLamp	= turnedOnLampEvent / turnedOffLampEvent",
				"turnedOnLampEvent = 'on allume' sep lampName:L\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : lampName }).get('id');\n\
					nodeEvent.eventName = 'value';\n\
					nodeEvent.eventValue = 'true';\n\
					\n\
					return nodeEvent;\n\
				}",
				"turnedOffLampEvent = 'on eteint' sep lampName:L\n\
				{\n\
					var nodeEvent = {};\n\
					nodeEvent.type = 'NodeEvent';\n\
					nodeEvent.sourceType = 'device';\n\
					nodeEvent.sourceId = devices.findWhere({ name : lampName }).get('id');\n\
					nodeEvent.eventName = 'value';\n\
					nodeEvent.eventValue = 'false';\n\
					\n\
					return nodeEvent;\n\
				}",
				"statusLamp	= isOnLampStatus / isOffLampStatus",
				"isOnLampStatus = lampName:L sep 'est allumee'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : lampName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getCurrentState';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'true';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"isOffLampStatus = lampName:L sep 'est eteinte'\n\
				{\n\
					var nodeRelationBool = {};\n\
					nodeRelationBool.type = 'NodeRelationBool';\n\
					nodeRelationBool.operator = '==';\n\
					\n\
					nodeRelationBool.leftOperand = {};\n\
					nodeRelationBool.leftOperand.targetType = 'device';\n\
					nodeRelationBool.leftOperand.targetId = devices.findWhere({ name : lampName }).get('id');\n\
					nodeRelationBool.leftOperand.methodName = 'getCurrentState';\n\
					nodeRelationBool.leftOperand.returnType = 'boolean';\n\
					nodeRelationBool.leftOperand.args = [];\n\
					\n\
					nodeRelationBool.rightOperand = {};\n\
					nodeRelationBool.rightOperand.type = 'boolean';\n\
					nodeRelationBool.rightOperand.value = 'false';\n\
					\n\
					return nodeRelationBool;\n\
				}",
				"actionLamp = onLampAction / offLampAction / changeColorLampAction",
				"onLampAction = 'allumer' sep lampName:L\n\
				{\n\
					var nodeAction = {};\n\
					nodeAction.type = 'NodeAction';\n\
					nodeAction.targetType = 'device';\n\
					nodeAction.targetId = devices.findWhere({ name : lampName }).get('id');\n\
					nodeAction.methodName = 'On';\n\
					nodeAction.args = [];\n\
					\n\
					return nodeAction;\n\
				}",
				"offLampAction = 'eteindre' sep lampName:L\n\
				{\n\
					var nodeAction = {};\n\
					nodeAction.type = 'NodeAction';\n\
					nodeAction.targetType = 'device';\n\
					nodeAction.targetId = devices.findWhere({ name : lampName }).get('id');\n\
					nodeAction.methodName = 'Off';\n\
					nodeAction.args = [];\n\
					\n\
					return nodeAction;\n\
				}",
				"changeColorLampAction = 'changer la couleur de' sep lampName:L sep 'en' sep color:lampColor\n\
				{\n\
					var nodeAction = {};\n\
					nodeAction.type = 'NodeAction';\n\
					nodeAction.targetType = 'device';\n\
					nodeAction.targetId = devices.findWhere({ name : lampName }).get('id');\n\
					switch (color) {\n\
						case 'rouge':\n\
							nodeAction.methodName = 'setRed';\n\
							break;\n\
						case 'bleu':\n\
							nodeAction.methodName = 'setBlue';\n\
							break;\n\
						case 'vert':\n\
							nodeAction.methodName = 'setGreen';\n\
							break;\n\
						case 'jaune':\n\
							nodeAction.methodName = 'setYellow';\n\
							break;\n\
						case 'orange':\n\
							nodeAction.methodName = 'setOrange';\n\
							break;\n\
						case 'violet':\n\
							nodeAction.methodName = 'setPurple';\n\
							break;\n\
						case 'rose':\n\
							nodeAction.methodName = 'setPink';\n\
							break;\n\
						default:\n\
							nodeAction.methodName = 'setDefault';\n\
							break;\n\
					}\n\
					nodeAction.args = [];\n\
					\n\
					return nodeAction;\n\
				}",
				"lampColor = 'rouge' / 'bleu' / 'vert' / 'jaune' / 'orange' / 'violet' / 'rose'",
				"L = {{listOfLamps}}"
			]
		}
	};

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
			$($(".aside-menu .list-group-item")[0]).addClass("active");
			
			// display the first category of devices
			appRouter.showView(new Device.Views.DevicesByType({ id: $($(".aside-menu .list-group-item")[0]).attr("id").split("side-")[1] }));
			
			// update the url
			appRouter.navigate("#devices/types/1");
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
				method	: "setUserObjectName",
				args	: [
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
		remoteCall:function(method, args) {
			// build the message
			var messageJSON = {
				targetType	: "1",
				objectId	: this.get("id"),
				method		: method,
				args		: args
			};
			
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
							} else if (attribute === "color" && (model.get("type") === "7" || model.get("type") === 7)) {
								model.sendColor();
							} else if (attribute === "saturation" && (model.get("type") === "7" || model.get("type") === 7)) {
								model.sendSaturation();
							} else if (attribute === "brightness" && (model.get("type") === "7" || model.get("type") === 7)) {
								model.sendBrightness();
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
	 * 	value, containing the last temperature sent by the backend, in degree Celsius
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
	 * 	switchNumber. Values are depend of the type of the switch
	 * 	buttonStatus, 0 when Off, 1 when On
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
			this.remoteCall("setColor", [{ type : "long", value : this.get("color") }]);
		},
		
		/**
		 * Send a message to the backend to update the attribute saturation
		 */
		sendSaturation:function() {
			this.remoteCall("setSaturation", [{ type : "int", value : this.get("saturation") }]);
		},
		
		/**
		 * Send a message to the backend to update the attribute brightness
		 */
		sendBrightness:function() {
			this.remoteCall("setBrightness", [{ type : "long", value : this.get("brightness") }]);
		}
	});

	// collection
	Device.Collection = Backbone.Collection.extend({
		model: Device.Model,

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
		addDevice:function(device) {		
			device.type = parseInt(device.type);
			
			switch (device.type) {
				case 0:
					this.add(new Device.TemperatureSensor(device));
					break;
				case 1:
					this.add(new Device.IlluminationSensor(device));
					break;
				case 2:
					this.add(new Device.SwitchSensor(device));
					break;
				case 3:
					this.add(new Device.ContactSensor(device));
					break;
				case 4:
					this.add(new Device.KeyCardSensor(device));
					break;
				case 6:
					this.add(new Device.Plug(device));
					break;
				case 7:
					this.add(new Device.PhillipsHue(device));
					break;
				default:
					console.log("unknown type", device);
					break;
			}
			
			locations.get(device.placeId).get("devices").push(device.id);
		},
		
		/**
		 * @return Array of the devices of a given type
		 */
		getDevicesByType:function() {
			return this.groupBy(function(device) {
				return device.get("type");
			});
		},
		
		/**
		 * @return Array of the temperature sensors
		 */
		getTemperatureSensors:function() {
			return devices.where({ type : 0 });
		},
		
		/**
		 * @return Array of the illumination sensors
		 */
		getIlluminationSensors:function() {
			return devices.where({ type : 1 });
		},
		
		/**
		 * @return Array of the switches
		 */
		getSwitches:function() {
			return devices.where({ type : 2 });
		},
		
		/**
		 * @return Array of the contact sensors
		 */
		getContactSensors:function() {
			return devices.where({ type : 3 });
		},
		
		/**
		 * @return Array of the key-card readers
		 */
		getKeyCardReaders:function() {
			return devices.where({ type : 4 });
		},
		
		/**
		 * @return Array of the plugs
		 */
		getPlugs:function() {
			return devices.where({ type : 6 });
		},
		
		/**
		 * @return Array of the lamps
		 */
		getLamps:function() {
			return devices.where({ type : 7 });
		},
		
		/**
		 * @return Array of the unlocated devices
		 */
		getUnlocatedDevices:function() {
			return this.filter(function(device) {
				return device.get("placeId") === "-1";
			});
		},
		
		/**
		 * @return Dictionnary of the devices sorted by their type - key is the type id, value - array of devices corresponding the type
		 */
		getUnlocatedDevicesByType:function() {
			return _.groupBy(this.getUnlocatedDevices(), function(device) {
				return device.get("type");
			});
		}
	});

	/**
	 * Namespace for the views
	 */
	Device.Views = {};
	
	/**
	 * Render the side menu for the devices
	 */
	Device.Views.Menu = Backbone.View.extend({
		tagName		: "div",
		className	: "list-group",
		tplDeviceContainer:	_.template(deviceContainerMenuTemplate),
		
		/**
		 * Bind events of the DOM elements from the view to their callback
		 */
		events: {
			"click a.list-group-item"	: "updateSideMenu"
		},
		
		/**
		 * Listen to the updates on devices and update if any
		 * 
		 * @constructor
		 */
		initialize:function() {
			this.listenTo(devices, "add", this.render);
			this.listenTo(devices, "change", this.render);
			this.listenTo(devices, "remove", this.render);
		},
		
		/**
		 * Update the side menu to set the correct active element
		 * 
		 * @param e JS click event
		 */
		updateSideMenu:function(e) {
			_.forEach($("a.list-group-item"), function(item) {
				$(item).removeClass("active");
			});
			
			if (typeof e !== "undefined") {
				$(e.currentTarget).addClass("active");
			} else {
				if (Backbone.history.fragment === "devices") {
					$($(".navbar li")[0]).addClass("active");
				} else if (Backbone.history.fragment.split("/")[1] === "types") {
					$("#side-" + Backbone.history.fragment.split("/")[2]).addClass("active");
				} else {
					var deviceId = Backbone.history.fragment.split("/")[1];
					$("#side-" + devices.get(deviceId).get("type")).addClass("active");
				}
			}
		},
		
		/**
		 * Render the side menu
		 */
		 render:function() {
			 var self = this;
			 
			 // initialize the content
			 this.$el.html("");
			 
			 // for each category of devices, add a menu item
			 var types = devices.getDevicesByType();
			 _.forEach(_.keys(types), function(type) {
				self.$el.append(self.tplDeviceContainer({
					type	: type,
					typeName	: deviceTypesName[type].plural,
					devices		: types[type],
					places		: locations,
					unlocatedDevices: devices.filter(function(d) { return (d.get("placeId") === "-1" && d.get("type") === type) }),
					active		: Backbone.history.fragment.split("devices/types/")[1] === type ? true : false
				}));
			 });
			 
			 // set active the current item menu
			 this.updateSideMenu();
			 
			 return this;
		 }
	});

	// detailled view of a device
	Device.Views.Details = Backbone.View.extend({
		template: _.template(deviceDetailsTemplate),
		tplContact: _.template(contactDetailTemplate),
		tplIllumination: _.template(illuminationDetailTemplate),
		tplKeyCard: _.template(keyCardDetailTemplate),
		tplSwitch: _.template(switchDetailTemplate),
		tplTemperature: _.template(temperatureDetailTemplate),
		tplPlug: _.template(plugDetailTemplate),
		tplPhillipsHue: _.template(phillipsHueDetailTemplate),
		
		// map the events and their callback
		events: {
			"click button.back-button"						: "onBackButton",
			"click button.toggle-lamp-button"				: "onToggleLampButton",
			"click button.toggle-plug-button"				: "onTogglePlugButton",
			"show.bs.modal #edit-device-modal"				: "initializeModal",
			"click #edit-device-modal button.valid-button"	: "validEditDevice",
			"keyup #edit-device-modal input"				: "validEditDevice",
			"change #edit-device-modal select"				: "checkDevice"
		},

		/**
		 * Listen to the device update and refresh if any
		 * 
		 * @constructor
		 */
		initialize:function() {
			this.listenTo(this.model, "change", this.render);
		},
		
		/**
		 * Return to the previous view
		 */
		onBackButton:function() {
			window.history.back();
		},
		
		/**
		 * Callback to toggle a lamp - used when the displayed device is a lamp (!)
		 */
		onToggleLampButton:function() {
			// value can be string or boolean
			// string
			if (typeof this.model.get("value") === "string") {
				if (this.model.get("value") === "true") {
					this.model.set("value", "false");
					this.$el.find(".toggle-lamp-button").text("Allumer");
				} else {
					this.model.set("value", "true");
					this.$el.find(".toggle-lamp-button").text("Eteindre");
				}
			// boolean
			} else {
				if (this.model.get("value")) {
					this.model.set("value", "false");
					this.$el.find(".toggle-lamp-button").text("Allumer");
				} else {
					this.model.set("value", "true");
					this.$el.find(".toggle-lamp-button").text("Eteindre");
				}
			}
			
			// send the message to the backend
			this.model.save();
		},
		
		/**
		 * Callback to toggle a plug - used when the displayed device is a plug (!)
		 */
		onTogglePlugButton:function() {
			// value can be string or boolean
			// string
			if (typeof this.model.get("plugState") === "string") {
				if (this.model.get("plugState") === "true") {
					this.model.set("plugState", "false");
					this.$el.find(".toggle-plug-button").text("Allumer");
				} else {
					this.model.set("plugState", "true");
					this.$el.find(".toggle-plug-button").text("Eteindre");
				}
			// boolean
			} else {
				if (this.model.get("plugState")) {
					this.model.set("plugState", "false");
					this.$el.find(".toggle-plug-button").text("Allumer");
				} else {
					this.model.set("plugState", "true");
					this.$el.find(".toggle-plug-button").text("Eteindre");
				}
			}
			
			// send the message to the backend
			this.model.save();
		},
				
		/**
		 * Clear the input text, hide the error message and disable the valid button by default
		 */
		initializeModal:function() {
			$("#edit-device-modal input").val(this.model.get("name").replace(/&eacute;/g, "é").replace(/&egrave;/g, "è"));
			$("#edit-device-modal .text-danger").addClass("hide");
			$("#edit-device-modal .valid-button").addClass("disabled");
		},
		
		/**
		 * Check the current value given by the user - show an error message if needed
		 * 
		 * @return false if the information are not correct, true otherwise
		 */
		checkDevice:function() {
			// name already exists
			if (devices.where({ name : $("#edit-device-modal input").val() }).length > 0) {
				if (devices.where({ name : $("#edit-device-modal input").val() })[0].get("id") !== this.model.get("id")) {
					$("#edit-device-modal .text-danger").removeClass("hide");
					$("#edit-device-modal .text-danger").text("Nom déjà existant");
					$("#edit-device-modal .valid-button").addClass("disabled");
					
					return false;
				} else {
					$("#edit-device-modal .text-danger").addClass("hide");
					$("#edit-device-modal .valid-button").removeClass("disabled");
					
					return true;
				}
			}
			
			// ok
			$("#edit-device-modal .text-danger").addClass("hide");
			$("#edit-device-modal .valid-button").removeClass("disabled");
			
			return true;
		},
				
		/**
		 * Save the edits of the device
		 */
		validEditDevice: function(e) {
			var self = this;
			
			if (e.type === "keyup" && e.keyCode === 13 || e.type === "click") {
				e.preventDefault();
				
				// update if information are ok
				if (this.checkDevice()) {
					var destPlaceId = $("#edit-device-modal select option:selected").val();
					
					this.$el.find("#edit-device-modal").on("hidden.bs.modal", function() {
						// set the new name to the device
						self.model.set("name", $("#edit-device-modal input").val());
						
						// send the updates to the server
						self.model.save();
						
						// move the device
						locations.moveDevice(self.model.get("placeId"), destPlaceId, self.model.get("id"), true);
						
						return false;
					});
					
					// hide the modal
					$("#edit-device-modal").modal("hide");
				}
			}  else if (e.type === "keyup") {
				this.checkDevice();
			}
		},
		
		/**
		 * Set the new color to the lamp
		 * 
		 * @param e JS mouse event
		 */
		onChangeColor: function(e) {
			var lamp = devices.get(Backbone.history.fragment.split("/")[1]);
			var rgb = Raphael.getRGB(colorWheel.color());
			var hsl = Raphael.rgb2hsl(rgb);
			
			// hue
			lamp.set("color", Math.floor(hsl.h * 65535));
			lamp.save();
			
			// saturation
			lamp.set("saturation", Math.floor(hsl.s * 255));
			lamp.save();
			
			// brightness
			lamp.set("brightness", Math.floor(hsl.l * 255));
			lamp.save();
		},

		/**
		 * Render the detailled view of a device
		 */
		render: function() {
			switch (this.model.get("type")) {
				case 0: // temperature sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/temperature.jpg",
						sensorType: deviceTypesName[0].singular,
						locations: locations,
						deviceDetails: this.tplTemperature
					}));
					break;

				case 1: // illumination sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/illumination.jpg",
						sensorType: deviceTypesName[1].singular,
						locations: locations,
						deviceDetails: this.tplIllumination
					}));
					break;

				case 2: // switch sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/doubleSwitch.jpg",
						sensorType: deviceTypesName[2].singular,
						locations: locations,
						deviceDetails: this.tplSwitch
					}));
					break;

				case 3: // contact sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/contact.jpg",
						sensorType: deviceTypesName[3].singular,
						locations: locations,
						deviceDetails: this.tplContact
					}));
					break;

				case 4: // key card sensor
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/keycard.jpg",
						sensorType: deviceTypesName[4].singular,
						locations: locations,
						deviceDetails: this.tplKeyCard
					}));
					break;
				
				case 6: // plug
					this.$el.html(this.template({
						device: this.model,
						sensorImg: "styles/img/sensors/plug.jpg",
						sensorType: deviceTypesName[6].singular,
						locations: locations,
						deviceDetails: this.tplPlug
					}));
					break;

				case 7: // phillips hue
					this.$el.html(this.template({
						device: this.model,
						sensorType: deviceTypesName[7].singular,
						locations: locations,
						deviceDetails: this.tplPhillipsHue
					}));
					
					// if the color wheel is not already displayed
					if (typeof window.colorWheel === "undefined") {
						this.renderColorWheel();
					}
					
					// update the size of the color picker container
					this.$el.find(".color-picker").height(colorWheel.size2 * 2);

					break;
			}

			return this;
		},
		
		/**
		 * Render the color wheel for the Philips Hue
		 */
		renderColorWheel:function() {
			// create the color picker
			// compute its size
			var wheelRadius = Math.min(
				$(".body-content").width(),
				$(document).height() - this.$el.find(".color-picker").position().top
			);
			wheelRadius -= wheelRadius / 10 + 80;

			// instantiate the color wheel
			window.colorWheel = Raphael.colorwheel(
				$(".body-content").position().left + ($(".body-content").width() - wheelRadius) / 2,
				this.$el.find(".color-picker").position().top + 80,
				wheelRadius,
				"#F00"
			);

			// bind the events
			// mobile -> touch
			if (navigator.userAgent.toLowerCase().match(/(ipad|ipod|iphone|android)/)) {
				// window.colorWheel.onchange = this.onChangeColor;
				window.colorWheel.ring.node.ontouchend = this.onChangeColor;
				window.colorWheel.square.node.ontouchend = this.onChangeColor;
			} else { // desktop -> drag w/ the mouse
				window.colorWheel.ring.node.onmouseup = this.onChangeColor;
				window.colorWheel.square.node.onmouseup = this.onChangeColor;
			}
		}
	});
	
	/**
	 * Render the list of devices of a given type
	 */
	Device.Views.DevicesByType = Backbone.View.extend({
		tpl: _.template(deviceListByCategoryTemplate),
		
		events: {
			"click button.toggle-plug-button"	: "onTogglePlugButton",
			"click button.toggle-lamp-button"	: "onToggleLampButton"
		},
		
		/**
		 * Listen to the updates on the devices of the category and refresh if any
		 * 
		 * @constructor
		 */
		initialize:function() {
			var self = this;

			devices.getDevicesByType()[this.id].forEach(function(device) {
				self.listenTo(device, "change", self.render);
				self.listenTo(device, "remove", self.render);
			});
		},
		
		/**
		 * Callback to toggle a plug
		 * 
		 * @param e JS mouse event
		 */
		onTogglePlugButton:function(e) {
			e.preventDefault();
			
			var plug = devices.get($(e.currentTarget).attr("id"));
			
			// value can be string or boolean
			// string
			if (typeof plug.get("plugState") === "string") {
				if (plug.get("plugState") === "true") {
					plug.set("plugState", "false");
				} else {
					plug.set("plugState", "true");
				}
			// boolean
			} else {
				if (plug.get("plugState")) {
					plug.set("plugState", "false");
				} else {
					plug.set("plugState", "true");
				}
			}
			
			// send the message to the backend
			plug.save();
			
			return false;
		},
				
		/**
		 * Callback to toggle a lamp
		 * 
		 * @param e JS mouse event
		 */
		onToggleLampButton:function(e) {
			e.preventDefault();
			
			var lamp = devices.get($(e.currentTarget).attr("id"));
			// value can be string or boolean
			// string
			if (typeof lamp.get("value") === "string") {
				if (lamp.get("value") === "true") {
					lamp.set("value", "false");
				} else {
					lamp.set("value", "true");
				}
			// boolean
			} else {
				if (lamp.get("value")) {
					lamp.set("value", "false");
				} else {
					lamp.set("value", "true");
				}
			}
			
			// send the message to the backend
			lamp.save();
			
			return false;
		},
		
		/**
		 * Render the list
		 */
		render:function() {
			this.$el.html(this.tpl({
				typeId			: this.id,
				deviceTypeName	: devices.getDevicesByType()[this.id].length === 1 ? deviceTypesName[this.id].singular : deviceTypesName[this.id].plural,
				places			: locations
			}));
			
			return this;
		}
	});

	return Device;
});
