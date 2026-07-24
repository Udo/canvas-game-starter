(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = factory();
	else if (typeof define === 'function' && define.amd) define([], factory);
	else root.ActionInput = factory();
}(typeof self !== 'undefined' ? self : this, function () {
	'use strict';

	function create(options) {
		options = options || {};
		var target = options.target || (typeof document !== 'undefined' ? document : null);
		var lifecycleTarget = options.lifecycleTarget || (typeof window !== 'undefined' ? window : target);
		var pollGamepads = options.pollGamepads || function () {
			return typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
		};
		var bindings = options.bindings || {};
		var sources = Object.create(null);
		var actions = Object.create(null);
		var pressed = Object.create(null);
		var released = Object.create(null);
		var listening = false;

		function bindingValue(binding) {
			if (typeof binding === 'string') return sources['key:' + binding] || 0;
			if (binding.key !== undefined || binding.code !== undefined) return sources['key:' + (binding.key || binding.code)] || 0;
			if (binding.mouse !== undefined || binding.button !== undefined && binding.type === 'mouse') return sources['mouse:' + (binding.mouse === undefined ? binding.button : binding.mouse)] || 0;
			var pad = binding.gamepad || 0;
			if (binding.gamepadButton !== undefined || binding.type === 'gamepadButton') return sources['gamepad:' + pad + ':button:' + (binding.gamepadButton === undefined ? binding.button : binding.gamepadButton)] || 0;
			if (binding.gamepadAxis !== undefined || binding.type === 'gamepadAxis') {
				var axis = binding.gamepadAxis === undefined ? binding.axis : binding.gamepadAxis;
				var value = sources['gamepad:' + pad + ':axis:' + axis] || 0;
				var direction = binding.direction === undefined ? 1 : binding.direction;
				var threshold = binding.threshold === undefined ? 0.5 : binding.threshold;
				return direction < 0 ? (value <= -threshold ? -value : 0) : (value >= threshold ? value : 0);
			}
			return 0;
		}

		function refresh() {
			Object.keys(bindings).forEach(function (name) {
				var list = Array.isArray(bindings[name]) ? bindings[name] : [bindings[name]];
				var next = list.reduce(function (highest, binding) { return Math.max(highest, bindingValue(binding)); }, 0);
				var previous = actions[name] || 0;
				actions[name] = next;
				if (previous === 0 && next > 0) pressed[name] = true;
				if (previous > 0 && next === 0) released[name] = true;
			});
		}

		function setSource(name, value) {
			sources[name] = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
			refresh();
		}
		function clearSources(prefix) {
			Object.keys(sources).forEach(function (name) { if (!prefix || name.indexOf(prefix) === 0) delete sources[name]; });
			refresh();
		}
		function updateGamepads() {
			var pads;
			try { pads = pollGamepads() || []; }
			catch (_) { clearSources('gamepad:'); return; }
			Object.keys(sources).forEach(function (name) { if (name.indexOf('gamepad:') === 0) delete sources[name]; });
			Array.prototype.forEach.call(pads, function (pad, slot) {
				if (!pad || pad.connected === false) return;
				var index = Number.isInteger(pad.index) && pad.index >= 0 ? pad.index : slot;
				Array.prototype.forEach.call(pad.buttons || [], function (button, buttonIndex) {
					var value = button && (button.value === undefined ? (button.pressed ? 1 : 0) : Number(button.value));
					sources['gamepad:' + index + ':button:' + buttonIndex] = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
				});
				Array.prototype.forEach.call(pad.axes || [], function (axis, axisIndex) {
					axis = Number(axis);
					sources['gamepad:' + index + ':axis:' + axisIndex] = Number.isFinite(axis) ? Math.max(-1, Math.min(1, axis)) : 0;
				});
			});
			refresh();
		}
		function onKeyDown(event) { setSource('key:' + (event.key || event.code), 1); }
		function onKeyUp(event) { setSource('key:' + (event.key || event.code), 0); }
		function onMouseDown(event) { setSource('mouse:' + event.button, 1); }
		function onMouseUp(event) { setSource('mouse:' + event.button, 0); }
		function onBlur() { clearSources(); }
		function onDisconnect(event) { clearSources(event.gamepad ? 'gamepad:' + event.gamepad.index + ':' : 'gamepad:'); }

		var input = {
			listen: function () {
				if (!target || !lifecycleTarget || listening) return input;
				listening = true;
				target.addEventListener('keydown', onKeyDown); target.addEventListener('keyup', onKeyUp);
				target.addEventListener('mousedown', onMouseDown);
				lifecycleTarget.addEventListener('mouseup', onMouseUp);
				lifecycleTarget.addEventListener('blur', onBlur); lifecycleTarget.addEventListener('gamepaddisconnected', onDisconnect);
				return input;
			},
			stop: function () {
				if (!target || !lifecycleTarget || !listening) return input;
				listening = false;
				target.removeEventListener('keydown', onKeyDown); target.removeEventListener('keyup', onKeyUp);
				target.removeEventListener('mousedown', onMouseDown);
				lifecycleTarget.removeEventListener('mouseup', onMouseUp);
				lifecycleTarget.removeEventListener('blur', onBlur); lifecycleTarget.removeEventListener('gamepaddisconnected', onDisconnect);
				clearSources(); return input;
			},
			update: function () { updateGamepads(); return input; },
			endFrame: function () { pressed = Object.create(null); released = Object.create(null); return input; },
			held: function (action) { return (actions[action] || 0) > 0; },
			pressed: function (action) { return !!pressed[action]; },
			released: function (action) { return !!released[action]; },
			value: function (action) { return actions[action] || 0; }
		};
		return input;
	}
	return { create: create };
}));
