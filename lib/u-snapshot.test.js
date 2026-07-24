const assert = require('assert');
const SnapshotStore = require('./u-snapshot.js');

function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) { return values.has(key) ? values.get(key) : null; },
		setItem(key, value) { values.set(key, value); },
		removeItem(key) { values.delete(key); },
		values
	};
}

const storage = memoryStorage();
const saves = SnapshotStore.create({ namespace: 'test.game', version: 2, storage });
assert.deepStrictEqual(saves.load('slot'), { ok: false, code: 'missing' });
assert.deepStrictEqual(saves.save('slot', { score: 3 }), { ok: true });
assert.deepStrictEqual(saves.load('slot'), { ok: true, payload: { score: 3 } });
assert.strictEqual(storage.values.has('test.game:slot'), true);
storage.setItem('test.game:bad', '{');
assert.deepStrictEqual(saves.load('bad'), { ok: false, code: 'corrupt' });
storage.setItem('test.game:old', JSON.stringify({ version: 1, payload: {} }));
assert.deepStrictEqual(saves.load('old'), { ok: false, code: 'version_mismatch' });
assert.deepStrictEqual(saves.save('../bad', {}), { ok: false, code: 'invalid_slot' });
assert.deepStrictEqual(saves.save('undefined', undefined), { ok: false, code: 'invalid_payload' });
const circular = {}; circular.self = circular;
assert.deepStrictEqual(saves.save('circular', circular), { ok: false, code: 'invalid_payload' });
let toJSONCalls = 0;
assert.deepStrictEqual(saves.save('custom', { toJSON() { toJSONCalls++; return { safe: true }; } }), { ok: true });
assert.strictEqual(toJSONCalls, 1);
assert.deepStrictEqual(saves.load('custom'), { ok: true, payload: { safe: true } });
const bounded = SnapshotStore.create({ namespace: 'bounded', storage, maxCharacters: 64 });
assert.deepStrictEqual(bounded.save('large', { text: 'x'.repeat(100) }), { ok: false, code: 'too_large' });
storage.setItem('bounded:large', 'x'.repeat(65));
assert.deepStrictEqual(bounded.load('large'), { ok: false, code: 'too_large' });
storage.values.set('bounded:object', {});
assert.deepStrictEqual(bounded.load('object'), { ok: false, code: 'corrupt' });
const invalid = SnapshotStore.create({ namespace: '../bad', storage });
assert.deepStrictEqual(invalid.save('slot', {}), { ok: false, code: 'invalid_config' });
const failingStorage = { getItem() { throw new Error('private'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('private'); } };
const failing = SnapshotStore.create({ storage: failingStorage });
assert.deepStrictEqual(failing.save('slot', {}), { ok: false, code: 'storage_error' });
assert.deepStrictEqual(failing.load('slot'), { ok: false, code: 'storage_error' });
assert.deepStrictEqual(failing.remove('slot'), { ok: false, code: 'storage_error' });
console.log('u-snapshot.test.js passed');
