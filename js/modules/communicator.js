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

		if (!WebSocket) {
			navigator.notification.alert("WebSocket is not supported...");
		}

		// open a websocket
		this.webSocket = new WebSocket(serverAddr);

		// socket opened event, broadcast an event to the application
		this.webSocket.onopen = function() {
			dispatcher.trigger("WebSocketOpen");
		};

		this.webSocket.onclose = function() {
			console.log("socket is closed");
		}

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

			if (jsonMessage.objectId !== undefined) {
				var id = jsonMessage.objectId;
				delete jsonMessage.objectId;
				dispatcher.trigger(id, jsonMessage);
			} else {
				var commandName = _.keys(jsonMessage)[0];
				dispatcher.trigger(commandName, jsonMessage[commandName]);
			}

			console.log("received:", message.data);
		},

		/**
		 * @method sendMessage
		 * Send a message to the backend. Global format of the protocol is:
		 * { "commandName": { "key": value } }
		 *
		 * @param commandName Command name to send with the message
		 * @param{string} messageData Data to send, typically an object
		 * @param targetType Parameter used by the server to route the message. 0: AbstractObject, 1: ApAM component
		 */
		sendMessage:function(message) {
			console.log("sending:", JSON.stringify(message));

			// send it
			this.webSocket.send(JSON.stringify(message));
		},

		close:function() {
			this.webSocket.close();
		}
	};

	return Communicator;

});
