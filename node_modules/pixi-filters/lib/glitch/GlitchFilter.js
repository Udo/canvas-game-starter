'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var glitch$1 = require('./glitch.js');
var glitch = require('./glitch2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _GlitchFilter = class _GlitchFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the GlitchFilter constructor.
   */
  constructor(options) {
    options = { ..._GlitchFilter.defaults, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: glitch["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: glitch$1["default"],
      name: "glitch-filter"
    });
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = options.sampleSize ?? 512;
    const texture = new pixi_js.Texture({
      source: new pixi_js.ImageSource({ resource: canvas })
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        glitchUniforms: {
          uSeed: { value: options?.seed ?? 0, type: "f32" },
          uDimensions: { value: new Float32Array(2), type: "vec2<f32>" },
          uAspect: { value: 1, type: "f32" },
          uFillMode: { value: options?.fillMode ?? 0, type: "f32" },
          uOffset: { value: options?.offset ?? 100, type: "f32" },
          uDirection: { value: options?.direction ?? 0, type: "f32" },
          uRed: { value: options.red, type: "vec2<f32>" },
          uGreen: { value: options.green, type: "vec2<f32>" },
          uBlue: { value: options.blue, type: "vec2<f32>" }
        },
        uDisplacementMap: texture.source,
        uDisplacementSampler: texture.source.style
      }
    });
    __publicField(this, "uniforms");
    /**
     * `true` will divide the bands roughly based on equal amounts
     * where as setting to `false` will vary the band sizes dramatically (more random looking).
     */
    __publicField(this, "average", false);
    /** Minimum size of slices as a portion of the `sampleSize` */
    __publicField(this, "minSize", 8);
    /** Height of the displacement map canvas. */
    __publicField(this, "sampleSize", 512);
    /** Internally generated canvas. */
    __publicField(this, "_canvas");
    /**
     * The displacement map is used to generate the bands.
     * If using your own texture, `slices` will be ignored.
     *
     * @member {Texture}
     * @readonly
     */
    __publicField(this, "texture");
    /** Internal number of slices */
    __publicField(this, "_slices", 0);
    __publicField(this, "_sizes", new Float32Array(1));
    __publicField(this, "_offsets", new Float32Array(1));
    this.uniforms = this.resources.glitchUniforms.uniforms;
    this._canvas = canvas;
    this.texture = texture;
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in Filter
   * @private
   */
  apply(filterManager, input, output, clearMode) {
    const { width, height } = input.frame;
    this.uniforms.uDimensions[0] = width;
    this.uniforms.uDimensions[1] = height;
    this.uniforms.uAspect = height / width;
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * Randomize the slices size (heights).
   *
   * @private
   */
  _randomizeSizes() {
    const arr = this._sizes;
    const last = this._slices - 1;
    const size = this.sampleSize;
    const min = Math.min(this.minSize / size, 0.9 / this._slices);
    if (this.average) {
      const count = this._slices;
      let rest = 1;
      for (let i = 0; i < last; i++) {
        const averageWidth = rest / (count - i);
        const w = Math.max(averageWidth * (1 - Math.random() * 0.6), min);
        arr[i] = w;
        rest -= w;
      }
      arr[last] = rest;
    } else {
      let rest = 1;
      const ratio = Math.sqrt(1 / this._slices);
      for (let i = 0; i < last; i++) {
        const w = Math.max(ratio * rest * Math.random(), min);
        arr[i] = w;
        rest -= w;
      }
      arr[last] = rest;
    }
    this.shuffle();
  }
  /**
   * Shuffle the sizes of the slices, advanced usage.
   */
  shuffle() {
    const arr = this._sizes;
    const last = this._slices - 1;
    for (let i = last; i > 0; i--) {
      const rand = Math.random() * i >> 0;
      const temp = arr[i];
      arr[i] = arr[rand];
      arr[rand] = temp;
    }
  }
  /**
   * Randomize the values for offset from -1 to 1
   *
   * @private
   */
  _randomizeOffsets() {
    for (let i = 0; i < this._slices; i++) {
      this._offsets[i] = Math.random() * (Math.random() < 0.5 ? -1 : 1);
    }
  }
  /**
   * Regenerating random size, offsets for slices.
   */
  refresh() {
    this._randomizeSizes();
    this._randomizeOffsets();
    this.redraw();
  }
  /**
   * Redraw displacement bitmap texture, advanced usage.
   */
  redraw() {
    const size = this.sampleSize;
    const texture = this.texture;
    const ctx = this._canvas.getContext("2d");
    ctx.clearRect(0, 0, 8, size);
    let offset;
    let y = 0;
    for (let i = 0; i < this._slices; i++) {
      offset = Math.floor(this._offsets[i] * 256);
      const height = this._sizes[i] * size;
      const red = offset > 0 ? offset : 0;
      const green = offset < 0 ? -offset : 0;
      ctx.fillStyle = `rgba(${red}, ${green}, 0, 1)`;
      ctx.fillRect(0, y >> 0, size, height + 1 >> 0);
      y += height;
    }
    texture.source.update();
  }
  /**
   * Manually custom slices size (height) of displacement bitmap
   *
   * @member {number[]|Float32Array}
   */
  set sizes(sizes) {
    const len = Math.min(this._slices, sizes.length);
    for (let i = 0; i < len; i++) {
      this._sizes[i] = sizes[i];
    }
  }
  get sizes() {
    return this._sizes;
  }
  /**
   * Manually set custom slices offset of displacement bitmap, this is
   * a collection of values from -1 to 1. To change the max offset value
   * set `offset`.
   *
   * @member {number[]|Float32Array}
   */
  set offsets(offsets) {
    const len = Math.min(this._slices, offsets.length);
    for (let i = 0; i < len; i++) {
      this._offsets[i] = offsets[i];
    }
  }
  get offsets() {
    return this._offsets;
  }
  /**
   * The count of slices.
   * @default 5
   */
  get slices() {
    return this._slices;
  }
  set slices(value) {
    if (this._slices === value)
      return;
    this._slices = value;
    this._sizes = new Float32Array(value);
    this._offsets = new Float32Array(value);
    this.refresh();
  }
  /**
   * The maximum offset amount of slices.
   * @default 100
   */
  get offset() {
    return this.uniforms.uOffset;
  }
  set offset(value) {
    this.uniforms.uOffset = value;
  }
  /**
   * A seed value for randomizing glitch effect.
   * @default 0
   */
  get seed() {
    return this.uniforms.uSeed;
  }
  set seed(value) {
    this.uniforms.uSeed = value;
  }
  /**
   * The fill mode of the space after the offset.
   * @default FILL_MODES.TRANSPARENT
   */
  get fillMode() {
    return this.uniforms.uFillMode;
  }
  set fillMode(value) {
    this.uniforms.uFillMode = value;
  }
  /**
   * The angle in degree of the offset of slices.
   * @default 0
   */
  get direction() {
    return this.uniforms.uDirection / pixi_js.DEG_TO_RAD;
  }
  set direction(value) {
    this.uniforms.uDirection = value * pixi_js.DEG_TO_RAD;
  }
  /**
   * Red channel offset.
   * @default {x:0,y:0}
   */
  get red() {
    return this.uniforms.uRed;
  }
  set red(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uRed = value;
  }
  /**
   * Green channel offset.
   * @default {x:0,y:0}
   */
  get green() {
    return this.uniforms.uGreen;
  }
  set green(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uGreen = value;
  }
  /**
   * Blue offset.
   * @default {x:0,y:0}
   */
  get blue() {
    return this.uniforms.uBlue;
  }
  set blue(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uBlue = value;
  }
  /**
   * Removes all references
   */
  destroy() {
    this.texture?.destroy(true);
    this.texture = this._canvas = this.red = this.green = this.blue = this._sizes = this._offsets = null;
  }
};
/** Default constructor options. */
__publicField(_GlitchFilter, "defaults", {
  slices: 5,
  offset: 100,
  direction: 0,
  fillMode: 0,
  average: false,
  seed: 0,
  red: { x: 0, y: 0 },
  green: { x: 0, y: 0 },
  blue: { x: 0, y: 0 },
  minSize: 8,
  sampleSize: 512
});
let GlitchFilter = _GlitchFilter;

exports.GlitchFilter = GlitchFilter;
//# sourceMappingURL=GlitchFilter.js.map
