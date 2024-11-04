'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var bevel$1 = require('./bevel2.js');
var bevel = require('./bevel.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _BevelFilter = class _BevelFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the BevelFilter constructor.
   */
  constructor(options) {
    options = { ..._BevelFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: bevel["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: bevel$1["default"],
      name: "bevel-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        bevelUniforms: {
          uLightColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uLightAlpha: { value: options.lightAlpha, type: "f32" },
          uShadowColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uShadowAlpha: { value: options.shadowAlpha, type: "f32" },
          uTransform: { value: new Float32Array(2), type: "vec2<f32>" }
        }
      },
      // Workaround: https://github.com/pixijs/filters/issues/230
      // applies correctly only if there is at least a single-pixel padding with alpha=0 around an image
      // To solve this problem, a padding of 1 put on the filter should suffice
      padding: 1
    });
    __publicField(this, "uniforms");
    __publicField(this, "_thickness");
    __publicField(this, "_rotation");
    __publicField(this, "_lightColor");
    __publicField(this, "_shadowColor");
    this.uniforms = this.resources.bevelUniforms.uniforms;
    this._lightColor = new pixi_js.Color();
    this._shadowColor = new pixi_js.Color();
    this.lightColor = options.lightColor ?? 16777215;
    this.shadowColor = options.shadowColor ?? 0;
    Object.assign(this, options);
  }
  /**
   * The angle of the light in degrees
   * @default 45
   */
  get rotation() {
    return this._rotation / pixi_js.DEG_TO_RAD;
  }
  set rotation(value) {
    this._rotation = value * pixi_js.DEG_TO_RAD;
    this._updateTransform();
  }
  /**
   * The thickness of the bevel
   * @default 2
   */
  get thickness() {
    return this._thickness;
  }
  set thickness(value) {
    this._thickness = value;
    this._updateTransform();
  }
  /**
   * The color value of the left & top bevel.
   * @example [1.0, 1.0, 1.0] = 0xffffff
   * @default 0xffffff
   */
  get lightColor() {
    return this._lightColor.value;
  }
  set lightColor(value) {
    this._lightColor.setValue(value);
    const [r, g, b] = this._lightColor.toArray();
    this.uniforms.uLightColor[0] = r;
    this.uniforms.uLightColor[1] = g;
    this.uniforms.uLightColor[2] = b;
  }
  /**
   * The alpha value of the left & top bevel.
   * @default 0.7
   */
  get lightAlpha() {
    return this.uniforms.uLightAlpha;
  }
  set lightAlpha(value) {
    this.uniforms.uLightAlpha = value;
  }
  /**
   * The color value of the right & bottom bevel.
   * @default 0xffffff
   */
  get shadowColor() {
    return this._shadowColor.value;
  }
  set shadowColor(value) {
    this._shadowColor.setValue(value);
    const [r, g, b] = this._shadowColor.toArray();
    this.uniforms.uShadowColor[0] = r;
    this.uniforms.uShadowColor[1] = g;
    this.uniforms.uShadowColor[2] = b;
  }
  /**
   * The alpha value of the right & bottom bevel.
   * @default 0.7
   */
  get shadowAlpha() {
    return this.uniforms.uShadowAlpha;
  }
  set shadowAlpha(value) {
    this.uniforms.uShadowAlpha = value;
  }
  /**
   * Update the transform matrix of offset angle.
   * @private
   */
  _updateTransform() {
    this.uniforms.uTransform[0] = this.thickness * Math.cos(this._rotation);
    this.uniforms.uTransform[1] = this.thickness * Math.sin(this._rotation);
  }
};
/** Default values for options. */
__publicField(_BevelFilter, "DEFAULT_OPTIONS", {
  rotation: 45,
  thickness: 2,
  lightColor: 16777215,
  lightAlpha: 0.7,
  shadowColor: 0,
  shadowAlpha: 0.7
});
let BevelFilter = _BevelFilter;

exports.BevelFilter = BevelFilter;
//# sourceMappingURL=BevelFilter.js.map
