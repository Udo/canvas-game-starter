(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = factory();
	else if (typeof define === 'function' && define.amd) define([], factory);
	else root.SnapshotStore = factory();
}(typeof self !== 'undefined' ? self : this, function () {
	'use strict';
	var DEFAULT_MAX_CHARACTERS = 1024 * 1024;
	var MAX_CHARACTERS = 16 * 1024 * 1024;
	function failure(code) { return { ok: false, code: code }; }
	function create(options) {
		options = options || {};
		var namespace = options.namespace || 'game';
		var version = options.version === undefined ? 1 : options.version;
		var maxCharacters = options.maxCharacters === undefined ? DEFAULT_MAX_CHARACTERS : options.maxCharacters;
		var validConfig = typeof namespace === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(namespace) &&
			Number.isSafeInteger(version) && version >= 0 && Number.isSafeInteger(maxCharacters) &&
			maxCharacters > 0 && maxCharacters <= MAX_CHARACTERS;
		var storage = options.storage;
		if (!storage) {
			try { storage = typeof localStorage !== 'undefined' ? localStorage : null; }
			catch (_) { storage = null; }
		}
		function key(slot) { return namespace + ':' + slot; }
		function validSlot(slot) { return typeof slot === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(slot); }
		return {
			save: function (slot, payload) {
				if (!validConfig) return failure('invalid_config');
				if (!validSlot(slot)) return failure('invalid_slot');
				var encoded;
				try {
					var payloadEncoded = JSON.stringify(payload);
					if (payloadEncoded === undefined) return failure('invalid_payload');
					if (payloadEncoded.length > maxCharacters) return failure('too_large');
					encoded = JSON.stringify({ version: version, payload: JSON.parse(payloadEncoded) });
				}
				catch (_) { return failure('invalid_payload'); }
				if (encoded.length > maxCharacters) return failure('too_large');
				try { storage.setItem(key(slot), encoded); }
				catch (_) { return failure('storage_error'); }
				return { ok: true };
			},
			load: function (slot) {
				if (!validConfig) return failure('invalid_config');
				if (!validSlot(slot)) return failure('invalid_slot');
				var encoded;
				try { encoded = storage.getItem(key(slot)); }
				catch (_) { return failure('storage_error'); }
				if (encoded === null || encoded === undefined) return failure('missing');
				if (typeof encoded !== 'string') return failure('corrupt');
				if (encoded.length > maxCharacters) return failure('too_large');
				var snapshot;
				try { snapshot = JSON.parse(encoded); }
				catch (_) { return failure('corrupt'); }
				if (!snapshot || typeof snapshot !== 'object' || !Object.prototype.hasOwnProperty.call(snapshot, 'version') || !Object.prototype.hasOwnProperty.call(snapshot, 'payload')) return failure('corrupt');
				if (snapshot.version !== version) return failure('version_mismatch');
				return { ok: true, payload: snapshot.payload };
			},
			remove: function (slot) {
				if (!validConfig) return failure('invalid_config');
				if (!validSlot(slot)) return failure('invalid_slot');
				try { storage.removeItem(key(slot)); }
				catch (_) { return failure('storage_error'); }
				return { ok: true };
			}
		};
	}
	return { create: create };
}));
