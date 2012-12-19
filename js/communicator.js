define([
], function() {
	// web socket to communicate with the backend
	var _ws; // = new WebSocket("ws://localhost:1337");
	// _ws.onopen = dispatcher.trigger("WebSocketOpen");
	// _ws.onerror = function() { console.log("websocket error..."); };
	// _ws.onclose = function() { consle.log("websocket closed..."); };

	/**
	 * initialize the communication layer by mapping the events on the websocket
	 * with callbacks
	 */
	var _initialize = function() {
		_ws = new WebSocket("ws://localhost:1337");
		_ws.onopen = function() { dispatcher.trigger("WebSocketOpen"); };
		_ws.onmessage = _handleMessage;
	};

	var _handleMessage = function(message) {
		// dispatcher.trigger("rooms", JSON.parse(message.data));
		console.log(message.data);
	};

	var _sendMessage = function(commandName, messageData) {
		console.log(_ws);
		// build the message
		// var jsonMessage = {};
		// jsonMessage[commandName] = messageData;
		// while (_ws.readyState === WebSocket.CONNECTING) {}
		_ws.send(commandName);

		console.log("message sent:", commandName);
	};

	return {
		initialize: _initialize,
		sendMessage: _sendMessage
	};
});
