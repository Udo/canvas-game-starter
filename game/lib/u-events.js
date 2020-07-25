var EventSystem = function(opt = {}) {

	this.options = opt;

	this.event_handlers = {};
	
	this.on = (type, fn) => {
		if(opt.debug) console.log('on', type);
		if(!this.event_handlers[type]) this.event_handlers[type] = [];
		this.event_handlers[type].push(fn);
	};
	
	this.remove = (type, fn) => {
		var t = this.event_handlers[type];
		if(!t) return;
		var idx = t.indexOf(fn);
		if(idx < 0) return;
		t.splice(idx, 1);
		return(idx);
	};

	this.trigger = (type, data = {}) => {
		if(opt.debug) console.log('trigger', type);
		var delete_list = [];
		var h = this.event_handlers[type];
		if(h) h.forEach((fn) => {
			var r = fn(data);
			if(r === false) delete_list.push(fn);
		});
		delete_list.forEach((fn) => { this.remove(type, fn); });
	};

}

if(typeof exports !== 'undefined') {
	exports.EventSystem = EventSystem;
}
