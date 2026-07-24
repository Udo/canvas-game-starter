const assert = require('assert');
const ActionInput = require('./u-action-input.js');

function eventTarget() {
	const listeners = {};
	return {
		addEventListener(type, fn) { (listeners[type] || (listeners[type] = [])).push(fn); },
		removeEventListener(type, fn) { listeners[type] = (listeners[type] || []).filter(item => item !== fn); },
		emit(type, event = {}) { (listeners[type] || []).slice().forEach(fn => fn(event)); }
	};
}

const target = eventTarget();
const lifecycleTarget = eventTarget();
let pads = [];
let pollError = false;
const input = ActionInput.create({
	target,
	lifecycleTarget,
	pollGamepads: () => { if (pollError) throw new Error('unavailable'); return pads; },
	bindings: {
		left: [{ key: 'ArrowLeft' }, { mouse: 2 }, { gamepadButton: 14 }, { gamepadAxis: 0, direction: -1 }],
		jump: [{ key: ' ' }, { gamepadButton: 0 }]
	}
}).listen();

target.emit('keydown', { key: 'ArrowLeft' });
assert.strictEqual(input.held('left'), true);
assert.strictEqual(input.pressed('left'), true);
assert.strictEqual(input.value('left'), 1);
input.endFrame();
assert.strictEqual(input.pressed('left'), false);
target.emit('keyup', { key: 'ArrowLeft' });
assert.strictEqual(input.released('left'), true);
input.endFrame();

target.emit('mousedown', { button: 2 });
assert.strictEqual(input.held('left'), true);
lifecycleTarget.emit('blur');
assert.strictEqual(input.held('left'), false);
assert.strictEqual(input.released('left'), true);
input.endFrame();

pads = [{ connected: true, buttons: [{ pressed: true, value: 0.75 }], axes: [-0.8] }];
input.update();
assert.strictEqual(input.held('left'), true);
assert.strictEqual(input.held('jump'), true);
assert.strictEqual(input.value('left'), 0.8);
assert.strictEqual(input.value('jump'), 0.75);
input.endFrame();
lifecycleTarget.emit('gamepaddisconnected', { gamepad: { index: 0 } });
assert.strictEqual(input.held('left'), false);
assert.strictEqual(input.held('jump'), false);
assert.strictEqual(input.released('left'), true);
input.endFrame();

pads = [{ index: 0, connected: true, buttons: [{ value: 2 }], axes: [Number.NaN] }];
input.update();
assert.strictEqual(input.held('jump'), true);
assert.strictEqual(input.value('jump'), 1);
assert.strictEqual(input.held('left'), false);
input.endFrame();
pollError = true;
input.update();
assert.strictEqual(input.held('jump'), false);
assert.strictEqual(input.released('jump'), true);
input.stop();
console.log('u-action-input.test.js passed');
