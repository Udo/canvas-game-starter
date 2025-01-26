const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 30002 });
const all_connections = new Set();
const message_handlers = {};
const message_handlers_dir = './js/';

let seq_counter = new Date().getTime() * 1000;

let broker = {

	gamestate : {

	},

	module : (type) => {
		return message_handler_load('modules/'+type);
	},

	fio : {

		load : function(area, file_id) {
			try {
				let data = fs.readFileSync('data/'+area+'/'+file_id+'.json');
				return JSON.parse(data);
			} catch(ee) {
				return {};
			}
		},
		save : async function(area, file_id, data) {
			try {
				let raw_data = JSON.stringify(data);
				await fs.promises.writeFile('data/'+area+'/'+file_id+'.json', raw_data, 'utf8');
				return true;
			} catch(ee) {
				console.log('! cannot save file ', 'data/'+area+'/'+file_id+'.json', ee);
			}
		},
		remove : async function(area, file_id) {
			try {
				await fs.promises.unlink('data/'+area+'/'+file_id+'.json');
				return true;
			} catch(ee) {
				console.log('! cannot remove file', 'data/'+area+'/'+file_id+'.json', ee);
			}
		},

	},

}

function create_uid() {
	return(uuidv4().substr(0, 8));
}

function message_handler_load(type) {
	let ehnd = message_handlers[type];
	if(ehnd) return ehnd;
	const p = message_handlers_dir+`${type}.js`;
	if(!fs.existsSync(p)) {
		console.log(`! unhandled type: ${type}`);
		return false;
	}
	delete require.cache[require.resolve(p)];
	let hnd = message_handlers[type] = require(p);
	console.log(`I loaded: ${type}`);
	return hnd;
}

function message_handlers_dispatch(ws, message) {
	console.log('C RX '+ws.context.connection_id, message.type);
	const { type } = message;
	let h = message_handler_load('msg/'+type);
	if(!h) return;
	try {
		h(ws, message);
	} catch(ee) {
		console.error(`! error in "${type}":`, ee.message);
	}
}

wss.on('connection', ws => {

	all_connections.add(ws);

	ws.context = {
		session_id : create_uid(),
		connection_id : create_uid(),
		client_id : 'unknown',
		msg_counter : new Date().getTime() * 1000,
	}

	ws.leave = function() {
		//broadcast({ type: 'client/left', from : ws.user });
		console.log('- client left', ws.context.connection_id, ws.context.client_id);
		all_connections.delete(ws);
	}

	ws.save_session = () => {
		broker.fio.save('session', ws.context.client_id, ws.session);
	}

	ws.on('message', raw => {

		let message;
		try {
			message = JSON.parse(raw);
		} catch (e) {
			console.error('! invalid JSON', e);
			return;
		}

		message_handlers_dispatch(ws, message);

	});

	ws.send_raw = ws.send;
	ws.send = (message) => {
		send(ws, message);
	};

	ws.broadcast = (message) => {
		broadcast(message);
	};

	ws.on('close', () => {
		ws.leave();
	});

	ws.broker = broker;

	console.log('- client joined', ws.context.connection_id, ws.context.client_id);

});

function send(ws, message) {
	if(!message) return console.error('!send(ws, message) error: message missing');
	message.seq = ws.context.msg_counter++;
	let message_string = JSON.stringify(message);
	console.log('C TX '+ws.context.connection_id, message.type);
	ws.send_raw(message_string);
}

function broadcast(message) {
	message.seq = ws.context.msg_counter++;
	let message_string = JSON.stringify(message);
	console.log('A TX ', message.type);
	// todo: send to all
}

function watch_for_changes(jsdir) {
	fs.watch(message_handlers_dir+jsdir+'/', (eventType, filename) => {
		if (eventType === 'change' || eventType === 'rename') {
			const type = jsdir+'/'+path.basename(filename, '.js');
			if(message_handlers[type]) {
				delete message_handlers[type];
				console.log(`I clear "${type}"`);
			}
		}
	});
}

watch_for_changes('modules');
watch_for_changes('msg');

process.on('uncaughtException', (err) => {
  console.error('!', err);
});

console.log('I game server started');
