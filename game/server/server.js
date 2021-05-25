const fs = require('fs');
const { nv_get, nv_set, each, call_tree, json } = require('./lib.js');

var ServerState = {
	Config : {
		ws_port : 18090,	
	},
	MessageHandlers : {},
	Data : {},
	Connections : {},
}

function load_dynamic(jsfilename, set_fn)
{
	var fn = require.resolve('./'+jsfilename+'.js');
	fs.watchFile(fn, () => {
		delete require.cache[fn];
		var o = require(fn);
		set_fn(o);
		console.log('- reload', jsfilename, typeof o, Object.keys(o).join(', '));
	});
	var o = require(fn);
	set_fn(o);
	console.log('- include', jsfilename, typeof o, Object.keys(o).join(', '));
}

load_dynamic('message_handlers', (o) => { ServerState.MessageHandlers = o; });

ServerState.Data = nv_get('server/state');
if(!ServerState.Data.id_counter) ServerState.Data.id_counter = 1000;
console.log('i server state', ServerState.Data);

setInterval(() => {
	nv_set('server/state', ServerState.Data, true);
}, 10000);

process.on('exit', () => {
	console.log('! shutting down');
	nv_set('server/state', ServerState.Data, true);
});

process.on('SIGINT', function() {
	process.exit();
});

var WSBroker = require('wsbroker').Broker;

var broker = new WSBroker({
	
	port : ServerState.Config.ws_port,
	log : true,
	
	onClientMessage : function(message, connection, broker) {
		//console.log('MESSAGE RECEIVED!', message);
		//broker.broadcast(JSON.stringify(message));
		try {
			connection.rel_id = message.rel_id;
			call_tree(message.type, 
				ServerState.MessageHandlers,
				message,
				connection,
				broker);
		} catch(ee) {
			console.log('! error processing message', message, 'line: '+ee.lineNumber, ee);
		}
		connection.rel_id = false;
	},
	
	onClientConnect : (connection, broker) => {
		connection.osend = connection.send;
		if(!connection.session) connection.session = {};
		connection.send = (msg) => {
			if(connection.rel_id) msg.rel_id = connection.rel_id;
			connection.osend(json(msg));
		};
		ServerState.Connections[connection.sessionInfo.wskey] = connection;
		connection.send({ type : 'server_hello' });
	},
	
	onClientDisconnect : (connection, broker) => {
		try {
			call_tree('disconnect', ServerState.MessageHandlers, { type : 'disconnect' }, connection, broker);
			delete ServerState.Connections[connection.sessionInfo.wskey];
		} catch(ee) {
			console.log('! error processing disconnect', 'line: '+ee.lineNumber, ee);
		}
	},
	
});
 
broker.httpServer.on('request', (rq) => {
	rq.resume();
	rq.on('end', () => {
		console.log('i request', rq.url, Object.keys(rq));
	});
});
 
broker.call = (message, connection) => {
	console.log(':', message.type, JSON.stringify(message).substr(0, 16));
	call_tree(message.type, 
		ServerState.MessageHandlers,
		message,
		connection,
		broker);
}

broker.send_to_all = function(message, filter = null) {
	each(ServerState.Connections, (con) => {
		if(!filter || filter(con, message))
			con.send(message);
	});
}

broker.ServerState = ServerState;

