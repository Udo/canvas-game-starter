const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 30002 });
const rooms = {};

let seq_counter = 1000;

function create_uid() {
	return(uuidv4().substr(0, 8));
}

wss.on('connection', ws => {

	ws.context = {
		user : false,
		room : false,
		session : false,
		connection : create_uid(),
	}

	ws.leave_room = function() {
		let room = ws.context.room;
		if (rooms[room] && rooms[room].clients.has(ws)) {
			ws.context.room = false;
			ws.context.joined = false;
			rooms[room].clients.delete(ws);
			broadcastToRoom(room, { type: 'client/left', from : ws.context });
		}
	}

	ws.on('message', raw => {

		let message;
		try {
			message = JSON.parse(raw);
		} catch (e) {
			console.error('Invalid JSON', e);
			return;
		}

		switch (message.type) {
			case 'join':
				if(ws.context.room) // you can only be in one room
					ws.leave_room();
				ws.context.room = message.room;
				ws.context.joined = true;
				ws.context.session = ws.context.session || message.session_id || create_uid();
				ws.context.user = ws.context.user || message.user_id || create_uid();
				ws.client_joined = true;
				if (!rooms[ws.context.room]) {
					rooms[ws.context.room] = {
						clients : new Set(),
						prop : {
							owner : ws.context.user,
						},
						data : {

						},
					};
				}
				rooms[ws.context.room].clients.add(ws);
				sendToClient(ws,
					{ type : 'you/joined', session : ws.context, room_prop : rooms[ws.context.room].prop });
				broadcastToRoom(ws.context.room,
					{ type: 'client/joined', from : ws.context });
				break;
			case 'event':
				if(!ws.context.joined)
					return;
				broadcastToRoom(ws.context.room,
					{ type: 'client/event', from : ws.context, payload : message.payload });
				break;
			default:
				console.log('Unknown message type:', data, 'from', ws.context.session);
				break;
		}

	});

	ws.on('close', () => {
		ws.leave_room();
	});

});

function sendToClient(ws, message) {
	message.seq = seq_counter++;
	let msg = JSON.stringify(message);
	console.log('CLIENT > '+ws.context.connection, msg);
	ws.send(msg);
}

function broadcastToRoom(room, message) {
	message.seq = seq_counter++;
	let msg = JSON.stringify(message);
	console.log('ROOM > '+room, msg);
	if (rooms[room]) {
		rooms[room].clients.forEach(client => {
			client.send(msg);
		});
	}
}

console.log('Game relay server started');
