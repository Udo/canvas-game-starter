(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		root.EventEmitter = factory();
	}
}(typeof self !== 'undefined' ? self : this, function () {

class EventEmitter {
	constructor() {
		/** Map<eventName, Map<slotKey|Symbol, Function>> */
		this._topics = new Map();
	}

	/**
	 * Subscribe to `topic`. If `slot_key` is provided (truthy),
	 * it dedupes by that key; otherwise a unique Symbol is used.
	 * Returns an unsubscribe fn.
	 */
	on(topic, handler, slot_key = null) {
		let map = this._topics.get(topic);
		if (!map) {
			map = new Map();
			this._topics.set(topic, map);
		}
		// use the provided slot_key or a fresh Symbol()
		const key = slot_key != null ? slot_key : Symbol();
		map.set(key, handler);
		return () => this.off(topic, key);
	}

	/**
	 * Unsubscribe by handler function or by slot_key.
	 */
	off(topic, handlerOrSlotKey) {
		const map = this._topics.get(topic);
		if (!map) return;

		// if it matches a slotKey directly, remove it
		if (map.has(handlerOrSlotKey)) {
			map.delete(handlerOrSlotKey);
		} else {
			// otherwise assume it's a function: remove all matching fns
			for (const [key, fn] of map.entries()) {
				if (fn === handlerOrSlotKey) {
					map.delete(key);
				}
			}
		}

		if (map.size === 0) {
			this._topics.delete(topic);
		}
	}

	/**
	 * Emit to all handlers on `topic`. Handlers returning
	 * 'remove_handler' are auto-removed.
	 * Returns the number of handlers invoked.
	 */
	emit(topic, ...args) {
		let count = 0;
		const map = this._topics.get(topic);
		if (!map) return count;

		for (const [key, fn] of Array.from(map.entries())) {
			const res = fn(...args);
			count++;
			if (res === 'remove_handler') {
				map.delete(key);
			}
		}

		if (map.size === 0) {
			this._topics.delete(topic);
		}
		return count;
	}

	clear(topic) {
		if (topic) {
			this._topics.delete(topic);
		}
		return this;
	}
}

return EventEmitter;

}));
