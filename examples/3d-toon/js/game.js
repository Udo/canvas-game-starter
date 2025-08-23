Director = {

	handlers : {

	},

	tick_rate : 250,

	tick : () => {
		setTimeout(Director.tick, Director.tick_rate);

		if(Graphics.stage)
			$('#frame-rate').text(Graphics.stage.debug.fps+' FPS');

	},

	init : () => {
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
		},
	},

	init : () => {
		return true;
	},

}
