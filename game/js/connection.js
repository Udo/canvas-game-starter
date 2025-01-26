Connection = {

	sock : false,
	server_url : 'http://dev.openfu.com/jam/pirate16/ws/',

	last_tx : {},

	send : (msg) => {
		if(typeof msg == 'string')
			msg = { type : msg };
		msg.client_id = localStorage.client_id;
		Connection.last_tx = msg;
		Connection.sock.send(JSON.stringify(msg));
	},

	handlers : {

		session : () => {
			if(Connection.session.username)
				Events.emit('update_userdetails');
			else
				Events.emit('login');
		},

		connection : (msg) => {
			Connection.status = msg.status;
		},

	},

	session : {},

	init : () => {

		if(!localStorage.client_id) {
			localStorage.client_id = make_hash(Math.random()+(new Date()));
		}

		Events.emit('connection', { status : 'connecting' });
		var s = Connection.sock = new WebSocket(Connection.server_url);

		Events.batch_subscribe(Connection.handlers);

		s.onopen = () => {
			Events.emit('connection', { status : 'connected' });
			Connection.send({type : 'hello'});
		};

		s.onmessage = (event) => {
			try {
				var msg = JSON.parse(event.data);
			} catch (ee) {
				console.error('error decoding message', event.data);
				return;
			}
			console.log('ws message', msg);
			if(isset(msg.session)) {
				Connection.session = msg.session;
				Events.emit('session', msg.session);
			}
			if(isset(msg.user)) {
				Game.state.user = msg.user;
				Events.emit('user', msg.user);
			}
			Events.emit(msg.type, msg);
		};

		s.onclose = (event) => {
			Events.emit('connection', { status : 'disconnected' });
			setTimeout(Connection.init, 1000);
		};

		s.onerror = (event) => {
			console.log('ws error', event);
		};

		return true;
	},

}
