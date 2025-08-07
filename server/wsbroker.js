const { parse: parseQueryString } = require('querystring');
const http = require('http');
const https = require('https');
const { parse: parseUrl } = require('url');
const { WebSocketServer } = require('ws');

/**
 * Safely parse JSON string, returning an object with error info if parsing fails
 * @param {*} raw - The raw data to parse
 * @returns {Object} Parsed object or error info
 */
const safeParseJSON = (raw) => {
	if (typeof raw !== 'string')
		return raw;
	try {
		return JSON.parse(raw);
	} catch (error) {
		return { json_error: `${error.message} // source: ${raw}` };
	}
};

/**
 * Extract cookies from connection headers
 * @param {Object} connection - WebSocket connection
 * @returns {Object} Parsed cookies
 */
const getCookies = (connection) => {
	const cookies = {};
	const cookieHeader = connection.upgradeReq?.headers?.cookie;
	
	if (cookieHeader) {
		cookieHeader.split(';').forEach(item => {
			const [name, value] = item.split('=');
			if (name && value) {
				cookies[name.trim().toLowerCase()] = value.trim();
			}
		});
	}
	
	return cookies;
};

/**
 * Deep merge objects (replaces Lodash.merge)
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

/**
 * Iterate over object properties (replaces Lodash.forEach)
 * @param {Object} obj - Object to iterate
 * @param {Function} callback - Callback function
 */
const forEachObject = (obj, callback) => {
	Object.entries(obj).forEach(([key, value]) => callback(value, key));
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
 * Make HTTP POST request using native Node.js modules
 * @param {string} url - Target URL
 * @param {Object} formData - Form data to send
 * @param {Function} callback - Callback function
 */
const makeHttpRequest = (url, formData, callback) => {
	const parsedUrl = parseUrl(url);
	const httpModule = parsedUrl.protocol === 'https:' ? https : http;
	
	const postData = parseQueryString.stringify(formData);
	
	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
		path: parsedUrl.path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(postData)
		}
	};
	
	const req = httpModule.request(options, (res) => {
		let body = '';
		res.on('data', (chunk) => {
			body += chunk;
		});
		res.on('end', () => {
			callback(null, res, body);
		});
	});
	
	req.on('error', (error) => {
		callback(error, null, null);
	});
	
	req.write(postData);
	req.end();
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
			console.log('! backend error', upstreamError, data);
		} else if (whenDone) {
			whenDone(backendResponse);
		} else {
			onBackendMessage(broker, connection, backendResponse);
		}
	});
	}
};

const onClientMessage = (broker, connection, messageRaw) => {
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

const onWSConnection = (broker, connection) => {
	try {
		connection.broker = broker;
		connection.cookieData = getCookies(connection);
		connection.sessionInfo = mergeObjects(connection.cookieData, {
			ip: connection.upgradeReq.headers['x-forwarded-for'] || 
				connection.upgradeReq.connection.remoteAddress,
			wskey: connection.upgradeReq.headers['sec-websocket-key'],
		});
		
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
		request.on('data', (data) => {
			body += data;
		});		
		request.on('end', () => {
			response.writeHead(200, { 'Content-Type': 'application/json' });			
			const address = request.connection.remoteAddress || request.socket.remoteAddress;			
			if (!broker.config.backend || 
				!broker.config.backend.allow || 
				!broker.config.backend.allow.includes(address)) {
				response.end(JSON.stringify({ error: 'access denied' }));
				return;
			}
			
			const params = parseQueryString(body);
			let data = {};			
			if (params.data) {
				data = safeParseJSON(params.data);
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
		
		this.onWSConnection = (connection) => onWSConnection(this, connection);
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

module.exports = { Broker };
