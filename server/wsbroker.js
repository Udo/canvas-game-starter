const http = require('http');
const { WebSocketServer } = require('ws');

const DEFAULT_CLIENT_MESSAGE_LIMIT = 64 * 1024;
const DEFAULT_BACKEND_RESPONSE_LIMIT = 1024 * 1024;
const DEFAULT_COMMAND_REQUEST_LIMIT = 1024 * 1024;
const DEFAULT_BACKEND_TIMEOUT_MS = 10000;

const byteLength = (value) => {
	if (Buffer.isBuffer(value)) return value.length;
	if (typeof value === 'string') return Buffer.byteLength(value);
	return Buffer.byteLength(String(value));
};

const limitFor = (broker, key, fallback) => {
	const value = broker?.config?.limits?.[key] ?? broker?.config?.[key];
	return Number.isFinite(value) && value > 0 ? value : fallback;
};

const jsonParseError = (error, raw) => ({
	json_error: error.message,
	bytes: byteLength(raw),
});

/**
 * Safely parse JSON string/buffer, returning an object with error info if parsing fails.
 * The error intentionally reports only payload size, not the full payload body.
 * @param {*} raw - The raw data to parse
 * @returns {Object} Parsed object or error info
 */
const safeParseJSON = (raw) => {
	if (Buffer.isBuffer(raw))
		raw = raw.toString('utf8');
	if (typeof raw !== 'string')
		return raw;
	try {
		return JSON.parse(raw);
	} catch (error) {
		return jsonParseError(error, raw);
	}
};

const oversizedMessage = (limit, actual) => ({
	type: 'error',
	error: 'message_too_large',
	limit,
	bytes: actual,
});

/**
 * Extract cookies from the upgrade request attached to a connection.
 * @param {Object} connection - WebSocket connection with .request set at connect time
 * @returns {Object} Parsed cookies (lowercased names)
 */
const getCookies = (connection) => {
	const cookies = {};
	const cookieHeader = connection.request?.headers?.cookie;

	if (cookieHeader) {
		for (const item of cookieHeader.split(';')) {
			const separator = item.indexOf('=');
			if (separator > 0) {
				const name = item.slice(0, separator).trim().toLowerCase();
				const value = item.slice(separator + 1).trim();
				if (name && value) cookies[name] = value;
			}
		}
	}

	return cookies;
};

/**
 * Build session info from the upgrade request: cookies plus ip and wskey.
 * @param {Object} connection - WebSocket connection with .request set
 * @returns {Object} Session info
 */
const buildSessionInfo = (connection) => {
	const request = connection.request;
	return mergeObjects(getCookies(connection), {
		ip: request.headers['x-forwarded-for'] || request.socket.remoteAddress,
		wskey: request.headers['sec-websocket-key'],
	});
};

/**
 * Deep merge objects (plain-object values merge, everything else replaces).
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
const mergeObjects = (target, source) => {
	const result = { ...target };

	for (const [key, value] of Object.entries(source)) {
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[key] = mergeObjects(result[key] || {}, value);
		} else {
			result[key] = value;
		}
	}

	return result;
};

const onWSClose = (broker, connection) => {
	if (broker.config.log) {
		console.log('← connection closed', connection.sessionInfo.wskey);
	}

	if (broker.config.onClientDisconnect) {
		broker.config.onClientDisconnect(connection, broker);
	}

	sendBackendMessage(broker, connection, { type: 'session-disconnect' });
};

/**
 * Check if criteria matches session info
 * @param {Object} criteria - Matching criteria
 * @param {Object} sessionInfo - Session information to match against
 * @returns {boolean} Whether criteria matches
 */
const match = (criteria, sessionInfo) => {
	return Object.entries(criteria).every(([key, value]) => {
		const val1 = String(value);
		const val2 = String(sessionInfo[key] || '');
		return val1 === '*' || val1.toLowerCase() === val2.toLowerCase();
	});
};

/**
 * Apply a function to connections matching criteria
 * @param {Object} broker - Broker instance
 * @param {Object} connection - Specific connection (optional)
 * @param {Object} criteria - Matching criteria (optional)
 * @param {Function} applyFunc - Function to apply
 */
const applyCommand = (broker, connection, criteria, applyFunc) => {
	if (connection && !criteria) {
		applyFunc(connection);
	} else {
		broker.websocketServer.clients.forEach(client => {
			if (!criteria || match(criteria, client.sessionInfo)) {
				applyFunc(client);
			}
		});
	}
};

const backendCommands = {
	log: (broker, connection, message) => {
		console.log('! log', message.text);
	},

	session: (broker, connection, message) => {
		applyCommand(broker, connection, message.match, (client) => {
			client.sessionInfo = mergeObjects(client.sessionInfo, message.data);
		});
	},

	close: (broker, connection, message) => {
		applyCommand(broker, connection, message.match, (client) => {
			client.close();
		});
	},

	send: (broker, connection, message) => {
		const payload = JSON.stringify(message.message);
		const recipients = [];

		applyCommand(broker, connection, message.match, (client) => {
			sendClientMessage(broker, client, payload, true);
			recipients.push(client);
		});

		if (broker.config.log) {
			console.log(`← sent to ${recipients.length}/${broker.websocketServer.clients.size} clients`, message.message);
		}
	},

	list: (broker, connection, message) => {
		const result = [];

		broker.websocketServer.clients.forEach(client => {
			if (!message.match || match(message.match, client.sessionInfo)) {
				result.push(client.sessionInfo);
			}
		});

		return result;
	}
};

const onBackendMessage = (broker, connection, message) => {
	const result = [];

	if (Array.isArray(message) && message.length > 0) {
		message.forEach(cmd => {
			if (broker.config.log) {
				console.log('↓ from backend', cmd);
			}
			if (broker.config.backendCommands[cmd.type]) {
				result.push(broker.config.backendCommands[cmd.type](cmd, connection, broker));
			} else if (backendCommands[cmd.type]) {
				result.push(backendCommands[cmd.type](broker, connection, cmd));
			} else if (broker.config.onBackendMessage) {
				result.push(broker.config.onBackendMessage(cmd, connection, broker));
			} else if (broker.config.log) {
				console.log('! unknown backend command', cmd);
			}
		});
	}

	return result;
};

/**
 * POST urlencoded form data using global fetch, with a bounded response body.
 * Calls back with (error, response, body); response is the fetch Response (or null on
 * transport/timeout errors) and body is the raw text (null on error).
 * @param {string} url - Target URL
 * @param {Object} formData - Form data to send
 * @param {Function} callback - Callback function
 * @param {number} maxResponseBytes - Response body cap
 * @param {number} timeoutMs - Total request timeout
 */
const makeHttpRequest = (url, formData, callback, maxResponseBytes = DEFAULT_BACKEND_RESPONSE_LIMIT, timeoutMs = DEFAULT_BACKEND_TIMEOUT_MS) => {
	(async () => {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(formData).toString(),
			signal: AbortSignal.timeout(timeoutMs),
			redirect: 'error',
		});

		const reader = response.body.getReader();
		const chunks = [];
		let receivedBytes = 0;
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			receivedBytes += value.byteLength;
			if (receivedBytes > maxResponseBytes) {
				await reader.cancel();
				throw new Error(`backend response exceeded ${maxResponseBytes} bytes`);
			}
			chunks.push(value);
		}
		return { response, body: Buffer.concat(chunks).toString('utf8') };
	})()
		.then(({ response, body }) => callback(null, response, body))
		.catch((error) => callback(error, null, null));
};

const sendBackendMessage = (broker, connection, message, whenDone) => {
	if (broker.config.backend && broker.config.backend.type === 'http') {
		const data = {
			message: JSON.stringify(message),
			connection: JSON.stringify(connection.sessionInfo)
		};
		if (broker.config.log) {
			console.log('↑ to backend', message);
		}
		makeHttpRequest(broker.config.backend.url, data, (upstreamError, httpResponse, body) => {
			const backendResponse = safeParseJSON(body);
			if (upstreamError && broker.config.log) {
				console.log('! backend error', upstreamError.message, data);
			} else if (whenDone) {
				whenDone(backendResponse);
			} else {
				onBackendMessage(broker, connection, backendResponse);
			}
		}, limitFor(broker, 'backendResponseBytes', DEFAULT_BACKEND_RESPONSE_LIMIT), limitFor(broker, 'backendTimeoutMs', DEFAULT_BACKEND_TIMEOUT_MS));
	}
};

const onClientMessage = (broker, connection, messageRaw) => {
	const messageBytes = byteLength(messageRaw);
	const maxMessageBytes = limitFor(broker, 'clientMessageBytes', DEFAULT_CLIENT_MESSAGE_LIMIT);
	if (messageBytes > maxMessageBytes) {
		const errorMessage = oversizedMessage(maxMessageBytes, messageBytes);
		if (broker.config.log) {
			console.log('! client message too large', connection.sessionInfo.wskey, errorMessage);
		}
		sendClientMessage(broker, connection, errorMessage, true);
		connection.close(1009, 'message too large');
		return;
	}

	const message = safeParseJSON(messageRaw);
	if (broker.config.log) {
		console.log('→ from client', connection.sessionInfo.wskey, message);
	}
	let doSendBackendMessage = true;
	if (broker.config.onClientMessage) {
		doSendBackendMessage = broker.config.onClientMessage(message, connection, broker);
	}

	if (doSendBackendMessage) {
		if (!message.type || !message.type.startsWith('client-')) {
			message.type = `client-${message.type || 'message'}`;
		}
		sendBackendMessage(broker, connection, message);
	}
};

const sendClientMessage = (broker, connection, message, noLog) => {
	try {

		const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
		connection.send(messageStr);

		if (broker.config.log && !noLog) {
			console.log('← to client', connection.sessionInfo.wskey, messageStr);
		}

	} catch (error) {
		if (broker.config.log) {
			console.log('! Error sending message to client:', error.message);
		}
	}
};

const onWSConnection = (broker, connection, request) => {
	try {
		connection.broker = broker;
		connection.request = request;
		connection.cookieData = getCookies(connection);
		connection.sessionInfo = buildSessionInfo(connection);

		if (broker.config.log) {
			console.log('↪ new connection', connection.sessionInfo.wskey);
		}

		connection.on('message', (message) => {
			onClientMessage(broker, connection, message);
		});

		connection.on('close', () => {
			onWSClose(broker, connection);
		});

		let doSendBackendMessage = true;

		if (broker.config.onClientConnect) {
			doSendBackendMessage = broker.config.onClientConnect(connection);
		}

		if (doSendBackendMessage) {
			sendBackendMessage(broker, connection, { type: 'session-connect' });
		}
	} catch (error) {
		if (broker.config.log) {
			console.log('! Connection Error', error);
		}
	}
};

const onCommandRequest = (broker, request, response) => {
	if (request.method === 'POST') {
		let body = '';
		let receivedBytes = 0;
		let rejected = false;
		const maxRequestBytes = limitFor(broker, 'commandRequestBytes', DEFAULT_COMMAND_REQUEST_LIMIT);
		request.on('data', (data) => {
			if (rejected) return;
			receivedBytes += byteLength(data);
			if (receivedBytes > maxRequestBytes) {
				rejected = true;
				response.writeHead(413, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify({ error: 'request too large', limit: maxRequestBytes, bytes: receivedBytes }));
				request.destroy();
				return;
			}
			body += data;
		});
		request.on('end', () => {
			if (rejected) return;
			response.writeHead(200, { 'Content-Type': 'application/json' });
			const address = request.socket.remoteAddress;
			if (!broker.config.backend ||
				!broker.config.backend.allow ||
				!broker.config.backend.allow.includes(address)) {
				response.end(JSON.stringify({ error: 'access denied' }));
				return;
			}

			const rawData = new URLSearchParams(body).get('data');
			let data = {};
			if (rawData) {
				data = safeParseJSON(rawData);
			}

			if (Array.isArray(data) && data.length > 0) {
				const result = onBackendMessage(broker, null, data);
				response.write(JSON.stringify(result));
			}

			response.end();
		});

	} else {
		response.writeHead(200, { 'Content-Type': 'text/plain' });
		response.end('WebSocket Broker Running');
	}
};

const onError = (broker, error) => {
	if (broker.config.log) {
		console.log('! Error', error);
	}
};

const initWebSocketServer = (broker) => {
	if (!broker.config.server) {
		broker.httpServer = http.createServer();
	} else {
		broker.httpServer = broker.config.server;
	}

	const wsServer = new WebSocketServer({
		server: broker.httpServer,
		maxPayload: limitFor(broker, 'clientMessageBytes', DEFAULT_CLIENT_MESSAGE_LIMIT),
	});

	wsServer.on('connection', broker.onWSConnection);
	wsServer.on('error', broker.onError);

	broker.httpServer.on('request', (request, response) => {
		onCommandRequest(broker, request, response);
	});

	broker.httpServer.listen(broker.config.port, () => {
		if (broker.config.log) {
			console.log(`➥ websocket server listening on port ${broker.config.port}`);
		}
	});

	return wsServer;
};

/**
 * WebSocket Broker Class
 * A modern WebSocket server that handles client connections and backend communication
 */
class Broker {
	constructor(config) {
		this.config = config;

		if (!config.backendCommands) {
			config.backendCommands = {};
		}

		this.onWSConnection = (connection, request) => onWSConnection(this, connection, request);
		this.onError = (error) => onError(this, error);

		this.websocketServer = initWebSocketServer(this);
	}

	/**
	 * Broadcast a message to all clients or filtered clients
	 * @param {Object} message - Message to broadcast
	 * @param {Object} filter - Optional filter criteria
	 */
	broadcast(message, filter) {
		const command = { message };
		if (filter) command.match = filter;
		backendCommands.send(this, null, command);
	}

	/**
	 * Log a message
	 * @param {Object} message - Message to log
	 */
	log(message) {
		backendCommands.log(this, null, { text: message });
	}

	/**
	 * Send a message to the backend
	 * @param {Object} message - Message to send
	 * @param {Function} whenDone - Optional callback
	 */
	sendBackendMessage(message, whenDone) {
		sendBackendMessage(this, { sessionInfo: { type: 'direct' } }, message, whenDone);
	}

	/**
	 * Get the number of connected clients
	 * @returns {number} Number of connected clients
	 */
	getClientCount() {
		return this.websocketServer.clients.size;
	}

	/**
	 * Get all connected clients
	 * @returns {Array} Array of client session info
	 */
	getClients() {
		const clients = [];
		this.websocketServer.clients.forEach(client => {
			if (client.sessionInfo) {
				clients.push(client.sessionInfo);
			}
		});
		return clients;
	}
}

module.exports = {
	Broker,
	_internals: {
		DEFAULT_CLIENT_MESSAGE_LIMIT,
		DEFAULT_BACKEND_RESPONSE_LIMIT,
		DEFAULT_COMMAND_REQUEST_LIMIT,
		DEFAULT_BACKEND_TIMEOUT_MS,
		byteLength,
		limitFor,
		safeParseJSON,
		getCookies,
		buildSessionInfo,
		onClientMessage,
		onCommandRequest,
		makeHttpRequest,
	},
};
