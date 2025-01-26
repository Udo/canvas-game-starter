Director = {

	handlers : {

	},

	tick_rate : 250,

	tick : () => {
		setTimeout(Director.tick, Director.tick_rate);
		if(Connection.status != 'connected') return;

		if(Graphics.stage)
			$('#frame-rate').text(Graphics.stage.debug.fps+' FPS');

		if(!isset(Game.state.time) && Connection.last_tx.type != 'request-gamestate')
			Connection.send('request-gamestate');

	},

	init : () => {
		Events.batch_subscribe(Director.handlers);
		Director.tick();
		return true;
	},

}

Game = {

	state : {

	},

	handlers : {
		reset : () => {
			Game.state = {};
		},
		gamestate : (msg) => {
			each(msg.state, (v, k) => {
				Game.state[k] = v;
			});
			if(msg.state.map)
				Events.emit('newmap', msg);
		},
	},

	init : () => {
		Events.batch_subscribe(Game.handlers);
		return true;
	},

}
