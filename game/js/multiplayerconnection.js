function MultiplayerConnection(prop) {

	this.prop = prop;
	let session = this.session = {
		session : localStorage.getItem('multiplayer_session_id'),
		user : localStorage.getItem('multiplayer_user_id'),
	};
	let room_prop = this.room_prop = {};

	if(!prop.room_key)
		prop.room_key = 'game/lobby';

	if(!prop.signaling_server)
		prop.signaling_server = 'ws://dev.openfu.com/gr/';

    prop.reconnect_interval = prop.reconnect_interval || 1000;
    prop.ws_status = 'disconnected';

	let socket = this.socket = new WebSocket(prop.signaling_server);

	let send_msg = this.send = function(msg) {
		socket.send(JSON.stringify(msg));
	}

	let send_event = this.send_event = function(payload_msg) {
		send_msg({ type : 'event', payload : payload_msg });
	}

	let connect_ws = this.connect_ws = () => {
        socket = this.socket = new WebSocket(prop.signaling_server);

        socket.onopen = () => {
			prop.ws_status = 'opening';
            if (typeof prop.onopen == 'function') prop.onopen();
            console.log('socket.onopen()', 'WebSocket connection established');
            send_msg({ type: 'join', room: prop.room_key, session_id : session.session, user_id : session.user });
        };

        socket.onclose = () => {
			prop.ws_status = 'disconnected';
            if (typeof prop.onclose == 'function') prop.onclose();
            console.log('socket.onclose()', 'WebSocket connection closed. Attempting to reconnect...');
            setTimeout(connect_ws, prop.reconnect_interval);
        };

        socket.onerror = error => {
			prop.ws_status = 'disconnected';
            if (typeof prop.onerror == 'function') prop.onerror(error);
            else console.error('socket.onerror()', 'WebSocket error:', error);
        };

        socket.onmessage = message => {
            let data = {}

            try { data = JSON.parse(message.data); }
            catch (ee) { console.error(ee, message.data, blobToString(message.data)); }

            if(!data.type) return;

            console.log('socket.onmessage()', data.type);

            switch (data.type) {
				case 'you/joined':
					prop.ws_status = 'joined';
					break;
                default:
                    console.log('Unknown message type:', data);
            }

            var segments = data.type.split('/');
            if(segments[0] == 'you' && data.session) {
				$.each(data.session, (k, v) => {
					session[k] = v;
				});
				if(data.session.session)
					localStorage.setItem('multiplayer_session_id', data.session.session);
				if(data.session.session)
					localStorage.setItem('multiplayer_user_id', data.session.user);
			}
			if(data.room_prop)
				room_prop = this.room_prop = data.room_prop;

            var hfn = 'on_'+segments.join('_');
            if(typeof prop[hfn] == 'function')
				prop[hfn](data);
			else if (typeof prop.onmessage == 'function')
				prop.onmessage(data);

        };
    };

    connect_ws();
}
