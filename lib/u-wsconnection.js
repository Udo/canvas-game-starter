Connection = {

	auto_reconnect : false,
	established : false,
	
	update_indicator : (status) => {
		var status_colors = {
			'offline' : 'red',
			'online' : 'lightgreen',
			'error' : 'DarkOrange',
		};
		$('#connection-status').text(status).css('color', status_colors[status] || 'gray');
	},
	
	debug : true,
	auto_reconnect : true,
	cmd_waiting_rels : {},
	
	server_url : '',
	
	init : () => {
		new EventSystem(Connection);		
	},
	
	start : (url = null) => {
		
		if(url) Connection.server_url = url;
				
		Connection.update_indicator('offline');
		if(Connection.socket) Connection.socket.close();
		Connection.socket = new WebSocket(Connection.server_url);
		Connection.socket.onmessage = function(rawmsg) {
			var msg = JSON.parse(rawmsg.data);
			if(Connection.debug) console.log('CONNECTION MSG', msg);
			if(msg.type) Connection.trigger(msg.type, msg);
			Connection.trigger('message', msg);
		}
		Connection.socket.onclose = function() {
			Connection.update_indicator('offline');
			if(Connection.debug) console.log('CONNECTION CLOSED');
			Connection.established = false;
			Connection.trigger('close', {});
		}
		Connection.socket.onerror = function(error) {
			Connection.update_indicator('error');
			console.error('CONNECTION', error);
			Connection.established = false;
		}
		Connection.socket.onopen = function() {
			Connection.update_indicator('online');
			if(Connection.debug) console.log('CONNECTION ESTABLISHED');
			Connection.established = true;
			Connection.trigger('open', {});
		}
		setTimeout(Connection.reconnect, 2000);
		
	},
	
	deauth : () => {
		Game.session = {};
	},
	
	reconnect : () => {
		if(!Connection.established && Connection.auto_reconnect)
			Connection.start();
		else
			setTimeout(Connection.reconnect, 2000);
	},
	
	queue : [],

	dequeue : () => {
		var dq = Connection.queue;
		Connection.queue = [];
		dq.forEach(function(fm) {
			Connection.send(fm);
		});
	},
	
	send : (msg) => {
		if(Connection.established) {
			if(typeof msg == 'function')
				msg();
			else
				Connection.socket.send(JSON.stringify(msg));
		} else {
			Connection.queue.push(msg);
		}
	},
	
	close : () => {
		Connection.auto_reconnect = false;
		Connection.socket.close();
	},
	
}

