Events = {

	map : { },

	batch_subscribe : (handlers) => {
		each(handlers, (f, k) => {
			Events.subscribe(k, f);
		});
	},

	subscribe : (event_name, listener) => {
		//console.log('event.subscribe', event_name);
		if(!Events.map[event_name])
			Events.map[event_name] = new Set();
		Events.map[event_name].add(listener);
	},

	unsubscribe : (event_name, listener) => {
		if(!Events.map[event_name])
			return;
		Events.map[event_name].delete(listener);
	},

	emit : (event_name, prop = {}) => {
		if(!Events.map[event_name]) {
			console.log('event.emit', event_name, '(no listeners)');
			return;
		}
		console.log('event.emit', event_name, 'to', Events.map[event_name].size);
		Events.map[event_name].forEach(f => f(prop));
	},

}
