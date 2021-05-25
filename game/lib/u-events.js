var EventSystem = function(parent_object = false, opt = {}) {

	this.options = opt;

	this.event_handlers = {};
	this.event_handlers_once = {};
	this.event_handlers_always = {};
	
	this.on = (type, fn) => {
		if(opt.debug) console.log('event->bind on', type);
		if(!this.event_handlers[type]) this.event_handlers[type] = [];
		this.event_handlers[type].push(fn);
	};
	
	this.always = (type, fn) => {
		if(opt.debug) console.log('event->bind always', type);
		if(!this.event_handlers_always[type]) this.event_handlers_always[type] = [];
		this.event_handlers_always[type].push(fn);
	};
	
	this.once = (type, fn) => {
		if(opt.debug) console.log('event->bind once', type);
		if(!this.event_handlers_once[type]) this.event_handlers_once[type] = [];
		this.event_handlers_once[type].push(fn);
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
		// process "on"-style events, remove if event handler returns false
		var delete_list = [];
		var h = this.event_handlers[type];
		if(h) h.forEach((fn) => {
			var r = fn(data);
			if(r === false) delete_list.push(fn);
		});
		delete_list.forEach((fn) => { this.remove(type, fn); });
		// process "once" events
		var oh = this.event_handlers_once[type];
		if(oh) {
			oh.forEach((fn) => { fn(data); });
			this.event_handlers_once[type] = [];
		}
		// process "always" events which stay alive until manually cleared
		var ah = this.event_handlers_always[type];
		if(ah) {
			ah.forEach((fn) => { fn(data); });
		}
	};
	
	if(parent_object) {
		parent_object.events = this;
		parent_object.on = this.on;
		parent_object.once = this.once;
		parent_object.always = this.always;
		parent_object.trigger = this.trigger;		
	}

}

if(typeof exports !== 'undefined') {
	exports.EventSystem = EventSystem;
}
