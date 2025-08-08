(function (root, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		var exports_obj = factory();
		module.exports = exports_obj;
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else {
		var exports_obj = factory();
		root.Howler = exports_obj.Howler;
		root.Howl = exports_obj.Howl;
	}
}(typeof self !== 'undefined' ? self : this, function () {

/**
 * based on Howler.js - (c) 2013-2020, James Simpson of GoldFire Studios
 * Mostly compatible API 
 */

class HowlerGlobal {
	constructor() {
		this._counter = 1000;
		this._howls = [];
		this._volume = 1;
		this._muted = false;
		this._html5Pool = [];
		this._codecs = {};
		this.ctx = null;
		this.masterGain = null;
		this.usingWebAudio = true;
		this.autoUnlock = true;
		this._audioUnlocked = false;
		this._environment = null;
		this._setup();
	}

	volume(vol) {
		if (vol === undefined) return this._volume;
		this._volume = Math.max(0, Math.min(1, vol));
		
		if (!this._muted) {
			if (this.usingWebAudio && this.masterGain) {
				this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
			}
			this._howls.forEach(howl => howl._updateVolume());
		}
		return this;
	}

	mute(muted = true) {
		this._muted = muted;
		let vol = muted ? 0 : this._volume;
		
		if (this.usingWebAudio && this.masterGain) {
			this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
		}
		this._howls.forEach(howl => howl._updateVolume());
		return this;
	}

	stop() {
		this._howls.forEach(howl => howl.stop());
		return this;
	}

	unload() {
		this._howls.slice().forEach(howl => howl.unload());
		if (this.ctx?.close) {
			this.ctx.close();
			this.ctx = null;
			this._setupAudioContext();
		}
		return this;
	}

	codecs(ext) {
		return this._codecs[ext?.replace(/^x-/, '')];
	}

	_setup() {
		this._setupAudioContext();
		this._setupCodecs();
		if (this.autoUnlock) this._setupUnlock();
	}

	_setupAudioContext() {
		if (!this.usingWebAudio) return;
		
		try {
			this.ctx = new (window.AudioContext || window.webkitAudioContext)();
			this.masterGain = this.ctx.createGain();
			this.masterGain.connect(this.ctx.destination);
			this.masterGain.gain.setValueAtTime(this._muted ? 0 : this._volume, this.ctx.currentTime);
			
			this.listener = {
				position: { x: 0, y: 0, z: 0 },
				orientation: { 
					forward: { x: 0, y: 0, z: -1 },
					up: { x: 0, y: 1, z: 0 }
				},
				velocity: { x: 0, y: 0, z: 0 },
				update: () => this._updateListener()
			};
		} catch (e) {
			this.usingWebAudio = false;
		}
	}

	_setupCodecs() {
		if (typeof Audio === 'undefined') return;
		
		let audio = new Audio();
		let test = (mime) => !!audio.canPlayType(mime).replace(/^no$/, '');
		
		this._codecs = {
			mp3: test('audio/mpeg;'),
			opus: test('audio/ogg; codecs="opus"'),
			ogg: test('audio/ogg; codecs="vorbis"'),
			wav: test('audio/wav; codecs="1"') || test('audio/wav'),
			aac: test('audio/aac;'),
			m4a: test('audio/x-m4a;') || test('audio/m4a;') || test('audio/aac;'),
			mp4: test('audio/x-mp4;') || test('audio/mp4;') || test('audio/aac;'),
			webm: test('audio/webm; codecs="vorbis"'),
			flac: test('audio/x-flac;') || test('audio/flac;')
		};
	}

	_setupUnlock() {
		if (this._audioUnlocked || !this.ctx) return;

		let unlock = () => {
			if (this._audioUnlocked) return;
			
			let buffer = this.ctx.createBuffer(1, 1, 22050);
			let source = this.ctx.createBufferSource();
			source.buffer = buffer;
			source.connect(this.ctx.destination);
			source.start(0);
			
			if (this.ctx.resume) this.ctx.resume();
			
			source.onended = () => {
				this._audioUnlocked = true;
				document.removeEventListener('touchstart', unlock, true);
				document.removeEventListener('click', unlock, true);
				this._howls.forEach(howl => howl._emit('unlock'));
			};
		};

		document.addEventListener('touchstart', unlock, true);
		document.addEventListener('click', unlock, true);
	}

	_getHtml5Audio() {
		return this._html5Pool.pop() || new Audio();
	}

	_releaseHtml5Audio(audio) {
		if (audio._unlocked && this._html5Pool.length < 10) {
			this._html5Pool.push(audio);
		}
	}

	environment(env) {
		if(!env) 
			return this._environment;
		if (typeof env === 'string') {
			let presets = {
				room: { size: 'small', decay: 1.5, dampening: 0.8 },
				hall: { size: 'medium', decay: 2.5, dampening: 0.6 },
				cathedral: { size: 'large', decay: 8.0, dampening: 0.1 },
				cave: { size: 'large', decay: 6.0, dampening: 0.2 },
				underwater: { size: 'medium', decay: 3.0, dampening: 0.9 }
			};
			this._environment = presets[env] || null;
		} else {
			this._environment = env;
		}
		this._howls.forEach(howl => howl._updateEnvironment?.());
		return this;
	}

	_updateListener() {
		if (!this.ctx?.listener) return;
		
		let { position, orientation, velocity } = this.listener;
		let l = this.ctx.listener;
		
		if (l.positionX) {
			l.positionX.setValueAtTime(position.x, this.ctx.currentTime);
			l.positionY.setValueAtTime(position.y, this.ctx.currentTime);
			l.positionZ.setValueAtTime(position.z, this.ctx.currentTime);
			l.forwardX.setValueAtTime(orientation.forward.x, this.ctx.currentTime);
			l.forwardY.setValueAtTime(orientation.forward.y, this.ctx.currentTime);
			l.forwardZ.setValueAtTime(orientation.forward.z, this.ctx.currentTime);
			l.upX.setValueAtTime(orientation.up.x, this.ctx.currentTime);
			l.upY.setValueAtTime(orientation.up.y, this.ctx.currentTime);
			l.upZ.setValueAtTime(orientation.up.z, this.ctx.currentTime);
		} else {
			l.setPosition(position.x, position.y, position.z);
			l.setOrientation(
				orientation.forward.x, orientation.forward.y, orientation.forward.z,
				orientation.up.x, orientation.up.y, orientation.up.z
			);
		}
		
		if (l.setVelocity) {
			l.setVelocity(velocity.x, velocity.y, velocity.z);
		}
	}
}

class Howl {
	constructor(options = {}) {
		if (!options.src?.length) throw new Error('src required');
		
		Object.assign(this, {
			_src: Array.isArray(options.src) ? options.src : [options.src],
			_volume: options.volume ?? 1,
			_rate: options.rate ?? 1,
			_loop: options.loop ?? false,
			_muted: options.mute ?? false,
			_preload: options.preload ?? true,
			_autoplay: options.autoplay ?? false,
			_sprite: options.sprite ?? {},
			_format: options.format ? (Array.isArray(options.format) ? options.format : [options.format]) : null,
			_html5: options.html5 ?? false,
			_pool: options.pool ?? 5,
			_xhr: { method: 'GET', ...options.xhr },
			_duration: 0,
			_state: 'unloaded',
			_sounds: [],
			_queue: [],
			_listeners: {},
			_webAudio: Howler.usingWebAudio && !options.html5,
			
			_analyzer: null,
			_frequencyCallback: null,
			_frequencyData: null,
			_frequencyBands: options.frequencyBands || 16,
			_frequencyBoost: 4.0,
			_frequencyEnabled: false,
			
			_effects: []
		});

		if (options.spatial) {
			this.spatial = {
				enabled: true,
				position: { x: 0, y: 0, z: 0 },
				orientation: { x: 0, y: 0, z: -1 },
				velocity: { x: 0, y: 0, z: 0 },
				distance: {
					ref: 1,
					max: 10000,
					rolloff: 1,
					model: 'inverse'
				},
				cone: {
					inner: 360,
					outer: 360,
					outerGain: 0
				},
				occlusion: 0,
				obstruction: 0,
				panningModel: 'HRTF',
				update: () => this._updateSpatial()
			};
			
			if (Array.isArray(options.spatial.position)) {
				let [x, y, z] = options.spatial.position;
				Object.assign(this.spatial.position, { x, y, z });
			}
			if (options.spatial.distance) {
				Object.assign(this.spatial.distance, options.spatial.distance);
			}
			if (options.spatial.cone) {
				Object.assign(this.spatial.cone, options.spatial.cone);
			}
			if (options.spatial.panningModel) {
				this.spatial.panningModel = options.spatial.panningModel;
			}
		}

		['load', 'loaderror', 'play', 'pause', 'stop', 'end', 'fade', 'volume', 'rate', 'seek', 'mute', 'unlock'].forEach(event => {
			if (options[`on${event}`]) this.on(event, options[`on${event}`]);
		});

		Howler._howls.push(this);
		
		if (this._autoplay) this._queue.push({ event: 'play', action: () => this.play() });
		if (this._preload) this.load();
	}

	load() {
		if (this._state !== 'unloaded') return Promise.resolve(this);
		
		this._state = 'loading';
		
		return new Promise((resolve, reject) => {
			let url = this._selectSource();
			if (!url) {
				let error = 'No compatible source found';
				this._emit('loaderror', null, error);
				return reject(new Error(error));
			}

			this._src = url;
			
			if (this._webAudio) {
				this._loadWebAudio(url).then(resolve).catch(reject);
			} else {
				this._loadHtml5(url).then(resolve).catch(reject);
			}
		});
	}

	play(sprite) {
		if (typeof sprite === 'number') {
			let sound = this._sounds.find(s => s._id === sprite);
			return sound ? this._playSound(sound) : null;
		}

		if (this._state !== 'loaded') {
			if (this._state === 'loading') {
				return new Promise(resolve => {
					this._queue.push({ event: 'play', action: () => resolve(this.play(sprite)) });
				});
			}
			return this.load().then(() => this.play(sprite));
		}

		let sound = this._getSound();
		sound._sprite = sprite || '__default';
		return this._playSound(sound);
	}

	pause(id) {
		this._getSounds(id).forEach(sound => {
			if (!sound._paused) {
				sound._paused = true;
				if (sound._node) {
					if (this._webAudio && sound._source) {
						sound._source.stop();
						this._cleanupSound(sound);
					} else {
						sound._node.pause();
					}
				}
				this._emit('pause', sound._id);
			}
		});
		return this;
	}

	stop(id) {
		this._getSounds(id).forEach(sound => {
			sound._paused = true;
			sound._ended = true;
			if (sound._node) {
				if (this._webAudio) {
					if (sound._source) {
						sound._source.stop();
					}
				} else {
					sound._node.pause();
					sound._node.currentTime = 0;
				}
				this._cleanupSound(sound);
			}
			this._emit('stop', sound._id);
		});
		return this;
	}

	mute(muted, id) {
		if (muted === undefined) return this._muted;
		
		if (id === undefined) this._muted = muted;
		
		this._getSounds(id).forEach(sound => {
			sound._muted = muted;
			this._updateSoundVolume(sound);
			this._emit('mute', sound._id);
		});
		return this;
	}

	volume(vol, id) {
		if (vol === undefined) {
			let sound = id ? this._sounds.find(s => s._id === id) : this._sounds[0];
			return sound ? sound._volume : this._volume;
		}

		vol = Math.max(0, Math.min(1, vol));
		if (id === undefined) this._volume = vol;

		this._getSounds(id).forEach(sound => {
			sound._volume = vol;
			this._updateSoundVolume(sound);
			this._emit('volume', sound._id);
		});
		return this;
	}

	fade(from, to, duration, id) {
		this._getSounds(id).forEach(sound => {
			sound._volume = from;
			this._updateSoundVolume(sound);
			
			let startTime = Date.now();
			let fadeStep = () => {
				let elapsed = Date.now() - startTime;
				let progress = Math.min(elapsed / duration, 1);
				let currentVol = from + (to - from) * progress;
				
				sound._volume = currentVol;
				this._updateSoundVolume(sound);
				
				if (progress < 1) {
					requestAnimationFrame(fadeStep);
				} else {
					this._emit('fade', sound._id);
				}
			};
			
			requestAnimationFrame(fadeStep);
		});
		return this;
	}

	rate(rate, id) {
		if (rate === undefined) {
			let sound = id ? this._sounds.find(s => s._id === id) : this._sounds[0];
			return sound ? sound._rate : this._rate;
		}

		if (id === undefined) this._rate = rate;

		this._getSounds(id).forEach(sound => {
			sound._rate = rate;
			if (sound._node) {
				if (this._webAudio && sound._source) {
					sound._source.playbackRate.setValueAtTime(rate, Howler.ctx.currentTime);
				} else {
					sound._node.playbackRate = rate;
				}
			}
			this._emit('rate', sound._id);
		});
		return this;
	}

	seek(seek, id) {
		if (seek === undefined) {
			let sound = id ? this._sounds.find(s => s._id === id) : this._sounds[0];
			if (!sound) return 0;
			
			if (this._webAudio) {
				let elapsed = sound._playStart ? Howler.ctx.currentTime - sound._playStart : 0;
				return sound._seek + elapsed * sound._rate;
			}
			return sound._node?.currentTime || 0;
		}

		this._getSounds(id).forEach(sound => {
			let wasPlaying = !sound._paused;
			if (wasPlaying) this.pause(sound._id);
			
			sound._seek = seek;
			if (!this._webAudio && sound._node) {
				sound._node.currentTime = seek;
			}
			
			if (wasPlaying) this.play(sound._id);
			this._emit('seek', sound._id);
		});
		return this;
	}

	playing(id) {
		if (id) {
			let sound = this._sounds.find(s => s._id === id);
			return sound ? !sound._paused : false;
		}
		return this._sounds.some(s => !s._paused);
	}

	duration(id) {
		if (id) {
			let sound = this._sounds.find(s => s._id === id);
			if (sound && this._sprite[sound._sprite]) {
				return this._sprite[sound._sprite][1] / 1000;
			}
		}
		return this._duration;
	}

	state() {
		return this._state;
	}

	unload() {
		this.stop();
		this._stopFrequencyAnalysis();
		Howler._howls.splice(Howler._howls.indexOf(this), 1);
		this._sounds = [];
		this._state = 'unloaded';
		return null;
	}

	enableEQ(bands = 16, callback, boost = 4.0) {
		if (!this._webAudio) {
			console.warn('Frequency analysis requires Web Audio API');
			return this;
		}
		
		this._frequencyCallback = callback;
		this._frequencyBands = bands;
		this._frequencyBoost = boost;
		this._frequencyEnabled = true;
		
		if (!this._analyzer) {
			this._analyzer = Howler.ctx.createAnalyser();
			this._analyzer.fftSize = 2048;
			this._analyzer.smoothingTimeConstant = 0.3;
			this._frequencyData = new Uint8Array(this._analyzer.frequencyBinCount);
			this._analyzer.connect(Howler.masterGain);
		}
		
		this._rebuildEffectChain();
		this._startFrequencyAnalysis();
		return this;
	}

	disableEQ() {
		this._frequencyEnabled = false;
		this._stopFrequencyAnalysis();
		this._rebuildEffectChain();
		return this;
	}

	getFrequencyData() {
		if (!this._analyzer || !this._frequencyEnabled) return null;
		
		this._analyzer.getByteFrequencyData(this._frequencyData);
		
		let bands = new Array(this._frequencyBands);
		let nyquist = Howler.ctx.sampleRate / 2;
		let dataLength = this._frequencyData.length;
		
		let minFreq = 20;
		let maxFreq = nyquist;
		let logMin = Math.log(minFreq);
		let logMax = Math.log(maxFreq);
		let logRange = logMax - logMin;
		
		for (let i = 0; i < this._frequencyBands; i++) {
			// Logarithmic frequency distribution
			let logStart = logMin + (i / this._frequencyBands) * logRange;
			let logEnd = logMin + ((i + 1) / this._frequencyBands) * logRange;
			
			let startFreq = Math.exp(logStart);
			let endFreq = Math.exp(logEnd);
			
			let startBin = Math.floor((startFreq / nyquist) * dataLength);
			let endBin = Math.ceil((endFreq / nyquist) * dataLength);
			
			let sum = 0;
			let count = 0;
			for (let j = startBin; j < Math.min(endBin, dataLength); j++) {
				sum += this._frequencyData[j];
				count++;
			}
			
			bands[i] = count > 0 ? (sum / count / 255) : 0; // Normalize to 0-1
		}
		
		for (let i = 0; i < bands.length; i++) {
			bands[i] = Math.min(1.0, bands[i] * this._frequencyBoost); 
		}
		
		return bands;
	}

	_startFrequencyAnalysis() {
		if (!this._frequencyEnabled || this._frequencyAnimationId) return;
		
		let analyze = () => {
			if (!this._frequencyEnabled) return;
			
			let frequencyData = this.getFrequencyData();
			if (frequencyData && this._frequencyCallback) {
				this._frequencyCallback(frequencyData);
			}
			
			this._frequencyAnimationId = requestAnimationFrame(analyze);
		};
		
		analyze();
	}

	_stopFrequencyAnalysis() {
		if (this._frequencyAnimationId) {
			cancelAnimationFrame(this._frequencyAnimationId);
			this._frequencyAnimationId = null;
		}
	}

	addEffect(type, options = {}) {
		if (!this._webAudio) {
			console.warn('Audio effects require Web Audio API');
			return null;
		}
		
		let effect;
		
		switch (type.toLowerCase()) {
			case 'lowpass':
				effect = Howler.ctx.createBiquadFilter();
				effect.type = 'lowpass';
				effect.frequency.setValueAtTime(options.frequency || 1000, Howler.ctx.currentTime);
				effect.Q.setValueAtTime(options.Q || 1, Howler.ctx.currentTime);
				break;
				
			case 'highpass':
				effect = Howler.ctx.createBiquadFilter();
				effect.type = 'highpass';
				effect.frequency.setValueAtTime(options.frequency || 300, Howler.ctx.currentTime);
				effect.Q.setValueAtTime(options.Q || 1, Howler.ctx.currentTime);
				break;
				
			case 'bandpass':
				effect = Howler.ctx.createBiquadFilter();
				effect.type = 'bandpass';
				effect.frequency.setValueAtTime(options.frequency || 1000, Howler.ctx.currentTime);
				effect.Q.setValueAtTime(options.Q || 1, Howler.ctx.currentTime);
				break;
				
			case 'notch':
				effect = Howler.ctx.createBiquadFilter();
				effect.type = 'notch';
				effect.frequency.setValueAtTime(options.frequency || 1000, Howler.ctx.currentTime);
				effect.Q.setValueAtTime(options.Q || 30, Howler.ctx.currentTime);
				break;
				
			case 'delay':
				effect = Howler.ctx.createDelay(options.maxDelay || 1);
				effect.delayTime.setValueAtTime(options.delay || 0.3, Howler.ctx.currentTime);
				break;
				
			case 'reverb':
				effect = Howler.ctx.createConvolver();
				let length = Howler.ctx.sampleRate * (options.duration || 2);
				let impulse = Howler.ctx.createBuffer(2, length, Howler.ctx.sampleRate);
				let decay = options.decay || 2;
				
				for (let channel = 0; channel < 2; channel++) {
					let channelData = impulse.getChannelData(channel);
					for (let i = 0; i < length; i++) {
						channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
					}
				}
				effect.buffer = impulse;
				break;
				
			case 'gain':
				effect = Howler.ctx.createGain();
				effect.gain.setValueAtTime(options.gain || 1, Howler.ctx.currentTime);
				break;
				
			case 'distortion':
				effect = Howler.ctx.createWaveShaper();
				let samples = 44100;
				let curve = new Float32Array(samples);
				let amount = options.amount || 50;
				for (let i = 0; i < samples; i++) {
					let x = (i * 2) / samples - 1;
					curve[i] = ((3 + amount) * x * 20 * Math.PI / 180) / (Math.PI + amount * Math.abs(x));
				}
				effect.curve = curve;
				effect.oversample = options.oversample || '4x';
				break;
				
			default:
				console.warn(`Unknown effect type: ${type}`);
				return null;
		}
		
		if (effect) {
			this._effects.push(effect);
			this._rebuildEffectChain();
		}
		
		return effect;
	}

	get effects() {
		return this._effects;
	}

	updateEffectsChain() {
		this._rebuildEffectChain();
		return this;
	}

	_rebuildEffectChain() {
		this._sounds.forEach(sound => {
			if (sound._node && this._webAudio) {
				let startNode = sound._panner || sound._node;
				this._connectSoundToChain(sound, startNode);
			}
		});
	}

	_connectSoundToChain(sound, startNode = null) {
		if (!sound._node || !this._webAudio) return;
		
		let sourceNode = startNode || sound._node;
		sourceNode.disconnect();
		
		let currentNode = sourceNode;
		
		this._effects.forEach(effect => {
			currentNode.connect(effect);
			currentNode = effect;
		});
		
		if (this._environmentReverb && sound._panner) {
			this._ensureEnvironmentSend(sound);
			currentNode.connect(sound._environmentSend);
			sound._environmentSend.connect(this._environmentReverb);
		}
		
		if (this._analyzer && this._frequencyEnabled) {
			currentNode.connect(this._analyzer);
			sound._analyzerConnected = true;
		} else {
			currentNode.connect(Howler.masterGain);
			sound._analyzerConnected = false;
		}
	}

	_ensureEnvironmentSend(sound) {
		if (!sound._environmentSend) {
			sound._environmentSend = Howler.ctx.createGain();
			sound._environmentSend.gain.setValueAtTime(0.7, Howler.ctx.currentTime);
		}
	}

	on(event, fn, id) {
		(this._listeners[event] = this._listeners[event] || []).push({ fn, id });
		return this;
	}

	off(event, fn, id) {
		let listeners = this._listeners[event];
		if (!listeners) return this;
		
		if (!fn && !id) {
			this._listeners[event] = [];
		} else {
			this._listeners[event] = listeners.filter(l => 
				(fn && l.fn !== fn) || (id && l.id !== id)
			);
		}
		return this;
	}

	once(event, fn, id) {
		let onceFn = (...args) => {
			fn(...args);
			this.off(event, onceFn, id);
		};
		return this.on(event, onceFn, id);
	}

	_selectSource() {
		for (let src of this._src) {
			let ext = this._format?.[this._src.indexOf(src)] || 
									src.match(/\.([^.?]+)(\?|$)/)?.[1] || 
									src.match(/^data:audio\/([^;,]+)/)?.[1];
			
			if (ext && Howler.codecs(ext)) return src;
		}
		return null;
	}

	async _loadWebAudio(url) {
		try {
			let arrayBuffer;
			
			if (url.startsWith('data:')) {
				let data = atob(url.split(',')[1]);
				arrayBuffer = new Uint8Array(data.length);
				for (let i = 0; i < data.length; i++) {
					arrayBuffer[i] = data.charCodeAt(i);
				}
				arrayBuffer = arrayBuffer.buffer;
			} else {
				let response = await fetch(url, this._xhr);
				arrayBuffer = await response.arrayBuffer();
			}

			let audioBuffer = await Howler.ctx.decodeAudioData(arrayBuffer);
			this._buffer = audioBuffer;
			this._duration = audioBuffer.duration;
			this._finishLoad();
			return this;
		} catch (error) {
			this._emit('loaderror', null, error.message);
			throw error;
		}
	}

	async _loadHtml5(url) {
		return new Promise((resolve, reject) => {
			let audio = Howler._getHtml5Audio();
			
			let onLoad = () => {
				this._duration = Math.ceil(audio.duration * 10) / 10;
				this._finishLoad();
				audio.removeEventListener('canplaythrough', onLoad);
				audio.removeEventListener('error', onError);
				resolve(this);
			};
			
			let onError = () => {
				let error = `Failed to load: ${url}`;
				audio.removeEventListener('canplaythrough', onLoad);
				audio.removeEventListener('error', onError);
				this._emit('loaderror', null, error);
				reject(new Error(error));
			};

			audio.addEventListener('canplaythrough', onLoad);
			audio.addEventListener('error', onError);
			audio.src = url;
			audio.load();
		});
	}

	_finishLoad() {
		if (!Object.keys(this._sprite).length) {
			this._sprite = { __default: [0, this._duration * 1000] };
		}
		
		this._state = 'loaded';
		this._emit('load');
		this._processQueue();
	}

	_processQueue() {
		if (this._queue.length) {
			let { action } = this._queue.shift();
			action();
			this._processQueue();
		}
	}

	_getSound() {
		let sound = this._sounds.find(s => s._ended);
		
		if (!sound) {
			if (this._sounds.length >= this._pool) {
				return this._sounds.find(s => s._paused) || this._sounds[0];
			}
			sound = this._createSound();
		}
		
		return this._resetSound(sound);
	}

	_createSound() {
		let sound = {
			_id: ++Howler._counter,
			_volume: this._volume,
			_rate: this._rate,
			_seek: 0,
			_paused: true,
			_ended: true,
			_muted: this._muted,
			_sprite: '__default'
		};
		
		this._sounds.push(sound);
		this._createSoundNode(sound);
		return sound;
	}

	_resetSound(sound) {
		Object.assign(sound, {
			_volume: this._volume,
			_rate: this._rate,
			_seek: 0,
			_paused: true,
			_ended: true,
			_muted: this._muted,
			_sprite: '__default'
		});
		return sound;
	}

	_createSoundNode(sound) {
		if (this._webAudio) {
			sound._node = Howler.ctx.createGain();
			
			if (this.spatial?.enabled) {
				sound._panner = Howler.ctx.createPanner();
				// Set the panning model (this doesn't change dynamically)
				sound._panner.panningModel = this.spatial.panningModel;
				sound._node.connect(sound._panner);
				this._updateSoundSpatial(sound);
				
				if (Howler._environment) {
					this._updateEnvironment();
				}
				
				this._connectSoundToChain(sound, sound._panner);
			} else {
				this._connectSoundToChain(sound);
			}
		} else {
			sound._node = Howler._getHtml5Audio();
			sound._node.src = this._src;
		}
	}

	_playSound(sound) {
		if (!sound || this._state !== 'loaded') return null;

		let sprite = this._sprite[sound._sprite];
		if (!sprite) return null;

		let [start, duration] = sprite;
		let seek = Math.max(0, sound._seek || start / 1000);
		
		sound._paused = false;
		sound._ended = false;

		if (this._webAudio) {
			this._playWebAudio(sound, seek, duration / 1000);
		} else {
			this._playHtml5(sound, seek);
		}

		this._emit('play', sound._id);
		return sound._id;
	}

	_playWebAudio(sound, seek, duration) {
		this._cleanupSound(sound);
		
		sound._source = Howler.ctx.createBufferSource();
		sound._source.buffer = this._buffer;
		sound._source.connect(sound._node);
		
		sound._source.playbackRate.setValueAtTime(sound._rate, Howler.ctx.currentTime);
		sound._playStart = Howler.ctx.currentTime;
		
		if (sound._loop) {
			sound._source.loop = true;
			sound._source.start(0, seek);
		} else {
			// Fix: duration is the sprite duration, not total audio duration
			sound._source.start(0, seek, duration);
			sound._source.onended = () => this._onSoundEnd(sound);
		}

		this._updateSoundVolume(sound);
	}

	_playHtml5(sound, seek) {
		let { _node: node } = sound;
		node.currentTime = seek;
		node.volume = this._getEffectiveVolume(sound);
		node.playbackRate = sound._rate;
		node.muted = sound._muted || this._muted || Howler._muted;
		
		let promise = node.play();
		if (promise) {
			promise.catch(() => this._emit('playerror', sound._id, 'Playback failed'));
		}
		
		if (!sound._loop) {
			node.onended = () => this._onSoundEnd(sound);
		}
	}

	_onSoundEnd(sound) {
		sound._paused = true;
		sound._ended = true;
		this._emit('end', sound._id);
		
		if (sound._loop) {
			sound._ended = false;
			this._playSound(sound);
		}
	}

	_updateSoundVolume(sound) {
		if (!sound._node) return;
		
		let volume = this._getEffectiveVolume(sound);
		
		if (this._webAudio) {
			sound._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
		} else {
			sound._node.volume = volume;
		}
	}

	_getEffectiveVolume(sound) {
		if (sound._muted || this._muted || Howler._muted) return 0;
		return sound._volume * this._volume * Howler._volume;
	}

	_updateVolume() {
		this._sounds.forEach(sound => this._updateSoundVolume(sound));
	}

	_cleanupSound(sound) {
		if (sound._source) {
			sound._source.disconnect();
			sound._source = null;
		}
		if (sound._occlusionFilter) {
			sound._occlusionFilter.disconnect();
			sound._occlusionFilter = null;
		}
	}

	_getSounds(id) {
		return id ? this._sounds.filter(s => s._id === id) : this._sounds;
	}

	_emit(event, id, data) {
		let listeners = this._listeners[event];
		if (!listeners) return;
		
		listeners.forEach(({ fn, id: listenerId }) => {
			if (!listenerId || listenerId === id) {
				setTimeout(() => fn(id, data), 0);
			}
		});
	}

	_updateSpatial() {
		if (!this.spatial?.enabled) return;
		
		this._sounds.forEach(sound => {
			if (sound._panner) {
				this._updateSoundSpatial(sound);
			}
		});
	}

	_updateSoundSpatial(sound) {
		if (!sound._panner || !this.spatial?.enabled) return;
		
		let { position, orientation, velocity, distance, cone, occlusion, obstruction } = this.spatial;
		let p = sound._panner;
		
		if (p.positionX) {
			p.positionX.setValueAtTime(position.x, Howler.ctx.currentTime);
			p.positionY.setValueAtTime(position.y, Howler.ctx.currentTime);
			p.positionZ.setValueAtTime(position.z, Howler.ctx.currentTime);
			p.orientationX.setValueAtTime(orientation.x, Howler.ctx.currentTime);
			p.orientationY.setValueAtTime(orientation.y, Howler.ctx.currentTime);
			p.orientationZ.setValueAtTime(orientation.z, Howler.ctx.currentTime);
		} else {
			p.setPosition(position.x, position.y, position.z);
			p.setOrientation(orientation.x, orientation.y, orientation.z);
		}
		
		if (p.setVelocity && velocity) {
			p.setVelocity(velocity.x, velocity.y, velocity.z);
		}
		
		p.refDistance = distance.ref;
		p.maxDistance = distance.max;
		p.rolloffFactor = distance.rolloff;
		p.distanceModel = distance.model;
		
		p.coneInnerAngle = cone.inner;
		p.coneOuterAngle = cone.outer;
		p.coneOuterGain = cone.outerGain;
		
		this._applyOcclusion(sound, occlusion || 0, obstruction || 0);
	}

	_applyOcclusion(sound, occlusion, obstruction) {
		if (!sound._occlusionFilter && (occlusion > 0 || obstruction > 0)) {
			sound._occlusionFilter = Howler.ctx.createBiquadFilter();
			sound._occlusionFilter.type = 'lowpass';
			sound._node.disconnect();
			sound._node.connect(sound._occlusionFilter);
			sound._occlusionFilter.connect(sound._panner || Howler.masterGain);
		}
		
		if (sound._occlusionFilter) {
			let freq = 20000 * (1 - Math.max(occlusion, obstruction) * 0.9);
			let gain = 1 - occlusion * 0.8;
			sound._occlusionFilter.frequency.setValueAtTime(freq, Howler.ctx.currentTime);
			sound._node.gain.setValueAtTime(gain * this._getEffectiveVolume(sound), Howler.ctx.currentTime);
		}
	}

	_updateEnvironment() {
		if (!Howler._environment || !this._webAudio) return;
		
		if (!this._environmentReverb) {
			this._environmentReverb = Howler.ctx.createConvolver();
			let { size, decay, dampening } = Howler._environment;
			let length = Howler.ctx.sampleRate * (size === 'large' ? 6 : size === 'medium' ? 3 : 1.5);
			let impulse = Howler.ctx.createBuffer(2, length, Howler.ctx.sampleRate);
			
			for (let channel = 0; channel < 2; channel++) {
				let channelData = impulse.getChannelData(channel);
				for (let i = 0; i < length; i++) {
					let progress = i / length;
					let sample = 0;
					
					if (i < Howler.ctx.sampleRate * 0.2) {
						for (let j = 0; j < 8; j++) {
							let delay = (j + 1) * 0.02 * Howler.ctx.sampleRate;
							if (Math.abs(i - delay) < 100) {
								sample += (Math.random() * 2 - 1) * 0.3 * Math.exp(-j * 0.5);
							}
						}
					}
					
					let envelope = Math.pow(1 - progress, decay);
					let reverb = (Math.random() * 2 - 1) * envelope;
					sample += reverb * (1 - dampening + Math.random() * dampening * 0.3);
					
					if (size === 'large') {
						let lowFreq = Math.sin(i * 0.01) * envelope * 0.2;
						sample += lowFreq;
					}
					
					channelData[i] = Math.tanh(sample * 0.8); 
				}
			}
			this._environmentReverb.buffer = impulse;
			
			this._environmentGain = Howler.ctx.createGain();
			this._environmentGain.gain.setValueAtTime(0.8, Howler.ctx.currentTime); 
			this._environmentReverb.connect(this._environmentGain);
			this._environmentGain.connect(Howler.masterGain);
		}
		
		this._rebuildEffectChain();
	}
}

let Howler = new HowlerGlobal();

return { Howler, Howl };

}));
