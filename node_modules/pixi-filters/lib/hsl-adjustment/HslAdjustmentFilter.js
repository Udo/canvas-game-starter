'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var hsladjustment$1 = require('./hsladjustment.js');
var hsladjustment = require('./hsladjustment2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _HslAdjustmentFilter = class _HslAdjustmentFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the HslAdjustmentFilter constructor.
   */
  constructor(options) {
    options = { ..._HslAdjustmentFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: hsladjustment["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: hsladjustment$1["default"],
      name: "hsl-adjustment-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        hslUniforms: {
          uHsl: { value: new Float32Array(3), type: "vec3<f32>" },
          uColorize: { value: options.colorize ? 1 : 0, type: "f32" },
          uAlpha: { value: options.alpha, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_hue");
    this.uniforms = this.resources.hslUniforms.uniforms;
    Object.assign(this, options);
  }
  /**
   * The amount of hue in degrees (-180 to 180)
   * @default 0
   */
  get hue() {
    return this._hue;
  }
  set hue(value) {
    this._hue = value;
    this.uniforms.uHsl[0] = value * (Math.PI / 180);
  }
  /**
   * The amount of lightness (-1 to 1)
   * @default 0
   */
  get saturation() {
    return this.uniforms.uHsl[1];
  }
  set saturation(value) {
    this.uniforms.uHsl[1] = value;
  }
  /**
   * The amount of lightness (-1 to 1)
   * @default 0
   */
  get lightness() {
    return this.uniforms.uHsl[2];
  }
  set lightness(value) {
    this.uniforms.uHsl[2] = value;
  }
  /**
   * Whether to colorize the image
   * @default false
   */
  get colorize() {
    return this.uniforms.uColorize === 1;
  }
  set colorize(value) {
    this.uniforms.uColorize = value ? 1 : 0;
  }
  /**
   * The amount of alpha (0 to 1)
   * @default 1
   */
  get alpha() {
    return this.uniforms.uAlpha;
  }
  set alpha(value) {
    this.uniforms.uAlpha = value;
  }
};
/** Default values for options. */
__publicField(_HslAdjustmentFilter, "DEFAULT_OPTIONS", {
  hue: 0,
  saturation: 0,
  lightness: 0,
  colorize: false,
  alpha: 1
});
let HslAdjustmentFilter = _HslAdjustmentFilter;

exports.HslAdjustmentFilter = HslAdjustmentFilter;
//# sourceMappingURL=HslAdjustmentFilter.js.map
