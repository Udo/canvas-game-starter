const { Broker } = require('./wsbroker');
const { HandlerLoader } = require('./handler-loader');
const path = require('path');

class GameServer {
	constructor(port = 8080) {
		this.port = port;
		this.users = new Map();
		this.userConnections = new Map();
		this.connectionUsers = new Map();
		
		this.handlerLoader = new HandlerLoader(path.join(__dirname, 'handlers'), '📎');
		console.log(`✅ Loaded ${this.handlerLoader.getAvailableHandlers().length} handlers: ${this.handlerLoader.getAvailableHandlers().join(', ')}`);
		
		this.cmd = new HandlerLoader(path.join(__dirname, 'cmd'), '⚙️');
		console.log(`✅ Loaded ${this.cmd.getAvailableHandlers().length} commands: ${this.cmd.getAvailableHandlers().join(', ')}`);
		
		this.initializeBroker();
	}

	initializeBroker() {
		const config = {
			port: this.port,
			log: true,
			
			onClientConnect: (connection) => {
				console.log(`New client connected: ${connection.sessionInfo.wskey}`);
				this.cmd.get('handleClientConnect')(this, { connection });
				return false;
			},
			
			onClientDisconnect: (connection, broker) => {
				console.log(`Client disconnected: ${connection.sessionInfo.wskey}`);
				this.cmd.get('handleClientDisconnect')(this, { connection });
			},
			
			onClientMessage: (message, connection, broker) => {
				this.handleClientMessage(message, connection);
				return false;
			}
		};

		this.broker = new Broker(config);
	}

	handleClientMessage(message, connection) {
		if (typeof message === 'string') {
			try {
				message = JSON.parse(message);
			} catch (parseError) {
				console.error('❌ Failed to parse message JSON:', parseError.message);
				this.cmd.get('sendError')(this, { connection, errorMessage: 'Invalid JSON format' });
				return;
			}
		}

		const messageType = message.type;
		
		if (!messageType) {
			this.cmd.get('sendError')(this, { connection, errorMessage: 'Message type is required' });
			return;
		}
		
		const handler = this.handlerLoader.getHandler(messageType);
		
		if (handler) {
			try {
				handler(message, connection, this);
			} catch (handlerError) {
				console.error(`❌ Handler error for '${messageType}':`, handlerError);
				this.cmd.get('sendError')(this, { connection, errorMessage: `Handler error: ${handlerError.message}` });
			}
		} else {
			console.log(`❌ Unknown message type: ${messageType}`);
			this.cmd.get('sendError')(this, { connection, errorMessage: `Unknown command: ${messageType}` });
		}
	}
}

let server;
try {
	server = new GameServer(8080);
	console.log('🚀 Simple WebSocket chat server started on port 8080');
} catch (error) {
	console.error('❌ Failed to start server:', error);
	process.exit(1);
}

process.on('uncaughtException', (error) => {
	console.error('❌ Uncaught Exception:', error);
	console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('❌ Unhandled Rejection at:', promise);
	console.error('Reason:', reason);
});

setTimeout(() => {
	server.cmd.get('sendKeepAlive')(server, { });
}, 20000);

process.on('SIGINT', () => {
	console.log('\n🛑 Shutting down server...');
	process.exit(0);
});

module.exports = { GameServer };
