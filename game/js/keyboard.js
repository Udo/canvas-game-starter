Keyboard = {

	active : true,

	state : {

	},

	bindings : {
	},

	keydown : (event) => {
		if(!Keyboard.active) return;
		if(!Keyboard.state[event.key]) {
			Events.emit('keydown', { keyCode : event.keyCode, key : event.key });
			Keyboard.state[event.key] = true;
		}
	},

	keyup : (event) => {
		if(Keyboard.state[event.key]) {
			Events.emit('keyup', { keyCode : event.keyCode, key : event.key });
			delete Keyboard.state[event.key];
		}
	},

	init : () => {
		window.addEventListener('keydown', Keyboard.keydown);
		window.addEventListener('keyup', Keyboard.keyup);
		return true;
	},

}
