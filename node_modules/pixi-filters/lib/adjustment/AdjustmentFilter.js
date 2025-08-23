'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var adjustment$1 = require('./adjustment2.js');
var adjustment = require('./adjustment.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _AdjustmentFilter = class _AdjustmentFilter extends pixi_js.Filter {
  /**
   * @param options - The options of the adjustment filter.
   */
  constructor(options) {
    options = { ..._AdjustmentFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: adjustment["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: adjustment$1["default"],
      name: "adjustment-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        adjustmentUniforms: {
          uGamma: { value: options.gamma, type: "f32" },
          uContrast: { value: options.contrast, type: "f32" },
          uSaturation: { value: options.saturation, type: "f32" },
          uBrightness: { value: options.brightness, type: "f32" },
          uColor: {
            value: [
              options.red,
              options.green,
              options.blue,
              options.alpha
            ],
            type: "vec4<f32>"
          }
        }
      }
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.adjustmentUniforms.uniforms;
  }
  /**
   * Amount of luminance
   * @default 1
   */
  get gamma() {
    return this.uniforms.uGamma;
  }
  set gamma(value) {
    this.uniforms.uGamma = value;
  }
  /**
   * Amount of contrast
   * @default 1
   */
  get contrast() {
    return this.uniforms.uContrast;
  }
  set contrast(value) {
    this.uniforms.uContrast = value;
  }
  /**
   * Amount of color saturation
   * @default 1
   */
  get saturation() {
    return this.uniforms.uSaturation;
  }
  set saturation(value) {
    this.uniforms.uSaturation = value;
  }
  /**
   * The overall brightness
   * @default 1
   */
  get brightness() {
    return this.uniforms.uBrightness;
  }
  set brightness(value) {
    this.uniforms.uBrightness = value;
  }
  /**
   * The multiplied red channel
   * @default 1
   */
  get red() {
    return this.uniforms.uColor[0];
  }
  set red(value) {
    this.uniforms.uColor[0] = value;
  }
  /**
   * The multiplied blue channel
   * @default 1
   */
  get green() {
    return this.uniforms.uColor[1];
  }
  set green(value) {
    this.uniforms.uColor[1] = value;
  }
  /**
   * The multiplied green channel
   * @default 1
   */
  get blue() {
    return this.uniforms.uColor[2];
  }
  set blue(value) {
    this.uniforms.uColor[2] = value;
  }
  /**
   * The overall alpha channel
   * @default 1
   */
  get alpha() {
    return this.uniforms.uColor[3];
  }
  set alpha(value) {
    this.uniforms.uColor[3] = value;
  }
};
/** Default values for options. */
__publicField(_AdjustmentFilter, "DEFAULT_OPTIONS", {
  gamma: 1,
  contrast: 1,
  saturation: 1,
  brightness: 1,
  red: 1,
  green: 1,
  blue: 1,
  alpha: 1
});
let AdjustmentFilter = _AdjustmentFilter;

exports.AdjustmentFilter = AdjustmentFilter;
//# sourceMappingURL=AdjustmentFilter.js.map
