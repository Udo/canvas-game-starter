const assert = require('assert');
const http = require('http');
const Module = require('module');
const { EventEmitter } = require('events');

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
	if (request === 'ws') {
		return {
			WebSocketServer: class WebSocketServer {
				constructor(options = {}) {
					this.options = options;
					this.clients = new Set();
				}
				on() {}
			},
		};
	}
	return originalLoad.call(this, request, parent, isMain);
};

const { _internals } = require('./wsbroker');
Module._load = originalLoad;

function testSafeParseJSONDoesNotEchoPayload() {
	const parsed = _internals.safeParseJSON(Buffer.from('{not json'));
	assert.strictEqual(typeof parsed.json_error, 'string', 'parse error is returned');
	assert(parsed.json_error.length > 0, 'parse error message is nonempty');
	assert.strictEqual(parsed.bytes, Buffer.byteLength('{not json'), 'parse error includes byte count');
	assert.strictEqual(Object.prototype.hasOwnProperty.call(parsed, 'source'), false, 'parse error does not echo raw payload');
}

function testOversizedClientMessageIsRejected() {
	const sent = [];
	let closeCode = null;
	let closeReason = null;
	let forwarded = false;
	const broker = {
		config: {
			log: false,
			limits: { clientMessageBytes: 8 },
			onClientMessage: () => {
				forwarded = true;
				return false;
			},
		},
	};
	const connection = {
		sessionInfo: { wskey: 'test-key' },
		send: (message) => sent.push(JSON.parse(message)),
		close: (code, reason) => {
			closeCode = code;
			closeReason = reason;
		},
	};

	_internals.onClientMessage(broker, connection, Buffer.from('0123456789'));
	assert.strictEqual(forwarded, false, 'oversized messages do not reach game handlers');
	assert.strictEqual(sent.length, 1, 'client gets one structured error');
	assert.deepStrictEqual(sent[0], { type: 'error', error: 'message_too_large', limit: 8, bytes: 10 });
	assert.strictEqual(closeCode, 1009, 'connection closes with websocket message-too-large code');
	assert.strictEqual(closeReason, 'message too large');
}

function testValidBufferMessageStillReachesHandler() {
	let received = null;
	const broker = {
		config: {
			log: false,
			limits: { clientMessageBytes: 1024 },
			onClientMessage: (message) => {
				received = message;
				return false;
			},
		},
	};
	const connection = {
		sessionInfo: { wskey: 'test-key' },
		send: () => {},
		close: () => { throw new Error('valid message should not close'); },
	};

	_internals.onClientMessage(broker, connection, Buffer.from('{"type":"move","x":1}'));
	assert.deepStrictEqual(received, { type: 'move', x: 1 }, 'valid buffer frames are parsed for handlers');
}

function testOversizedCommandRequestIsRejected() {
	const request = new EventEmitter();
	request.method = 'POST';
	request.connection = { remoteAddress: '127.0.0.1' };
	request.socket = request.connection;
	let destroyed = false;
	request.destroy = () => { destroyed = true; };

	const response = {
		statusCode: null,
		body: '',
		writeHead: (statusCode) => { response.statusCode = statusCode; },
		write: (chunk) => { response.body += chunk; },
		end: (chunk = '') => { response.body += chunk; },
	};
	const broker = { config: { limits: { commandRequestBytes: 4 } } };

	_internals.onCommandRequest(broker, request, response);
	request.emit('data', Buffer.from('12345'));
	request.emit('end');

	assert.strictEqual(response.statusCode, 413, 'oversized command request returns 413');
	assert.strictEqual(destroyed, true, 'oversized command request is destroyed');
	assert.deepStrictEqual(JSON.parse(response.body), { error: 'request too large', limit: 4, bytes: 5 });
}

async function testBackendResponseLimit() {
	const server = http.createServer((req, res) => {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end('[{"type":"log","text":"' + 'x'.repeat(32) + '"}]');
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	const { port } = server.address();

	try {
		const error = await new Promise(resolve => {
			_internals.makeHttpRequest(
				`http://127.0.0.1:${port}/backend`,
				{ message: '{}', connection: '{}' },
				(upstreamError) => resolve(upstreamError),
				8,
			);
		});
		assert(error, 'oversized backend response returns an error');
		assert.strictEqual(error.message, 'backend response exceeded 8 bytes');
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
}

function testSessionInfoFromUpgradeRequest() {
	const connection = {
		request: {
			headers: {
				cookie: 'User=Alice; theme=dark; token=abc=def==',
				'x-forwarded-for': '203.0.113.7',
				'sec-websocket-key': 'ws-key-1',
			},
			socket: { remoteAddress: '127.0.0.1' },
		},
	};
	const cookies = _internals.getCookies(connection);
	assert.deepStrictEqual(cookies, { user: 'Alice', theme: 'dark', token: 'abc=def==' }, 'cookies parse with lowercased names and values containing =');
	const session = _internals.buildSessionInfo(connection);
	assert.strictEqual(session.ip, '203.0.113.7', 'forwarded ip wins');
	assert.strictEqual(session.wskey, 'ws-key-1', 'ws key comes from upgrade request headers');
	assert.strictEqual(session.user, 'Alice', 'cookies merge into session info');

	const noForward = { request: { headers: {}, socket: { remoteAddress: '10.0.0.2' } } };
	assert.strictEqual(_internals.buildSessionInfo(noForward).ip, '10.0.0.2', 'falls back to socket address');
}

(async () => {
	testSafeParseJSONDoesNotEchoPayload();
	testSessionInfoFromUpgradeRequest();
	testOversizedClientMessageIsRejected();
	testValidBufferMessageStillReachesHandler();
	testOversizedCommandRequestIsRejected();
	await testBackendResponseLimit();
	console.log('All wsbroker limit tests passed.');
})().catch(error => {
	console.error(error);
	process.exit(1);
});
