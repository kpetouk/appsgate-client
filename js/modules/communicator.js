define([
	"underscore"
], function(_) {

	/**
	 * @constructor
	 */
	function Communicator(serverAddr) {
		if (!(this instanceof Communicator)) {
			throw new TypeError("Communicator constructor cannot be called " +
					"as a function");
		}

		// open a websocket
		this.webSocket = new WebSocket(serverAddr);

		// socket opened event, broadcast an event to the application
		this.webSocket.onopen = function() {
			dispatcher.trigger("WebSocketOpen");
		};

		// message received on the socket
		this.webSocket.onmessage = this.handleMessage;
	}

	/**
	 * Communication layer between the front-end and the backend
	 * @class Communicator
	 */
	Communicator.prototype = {
		constructor: Communicator,

		/**
		 * @method handleMessage
		 */
		handleMessage:function(message) {
			// rebuild the message for the application
			var jsonMessage = JSON.parse(message.data);
			var commandName = _.keys(jsonMessage)[0];

			// trigger a global event
			dispatcher.trigger(commandName, jsonMessage[commandName]);
		},

		/**
		 * @method sendMessage
		 * Send a message to the backend. Global format of the protocol is:
		 * { "commandName": { "key": value } }
		 *
		 * @param commandName Command name to send with the message
		 * @param{string} messageData Data to send, typically an object
		 */
		sendMessage:function(commandName, messageData) {
			// build message for the server
			jsonMessage = {};
			jsonMessage[commandName] = messageData;

			// send it
			this.webSocket.send(JSON.stringify(jsonMessage));
		}
	};

	return Communicator;

});
