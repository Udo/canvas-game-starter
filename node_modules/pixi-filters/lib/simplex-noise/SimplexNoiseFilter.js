'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var simplex$1 = require('./simplex.js');
var simplex = require('./simplex2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _SimplexNoiseFilter = class _SimplexNoiseFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the SimplexNoise constructor.
   */
  constructor(options) {
    options = { ..._SimplexNoiseFilter.defaults, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: simplex["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: simplex$1["default"],
      name: "simplex-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        simplexUniforms: {
          uStrength: { value: options?.strength ?? 0, type: "f32" },
          uNoiseScale: { value: options?.noiseScale ?? 0, type: "f32" },
          uOffsetX: { value: options?.offsetX ?? 0, type: "f32" },
          uOffsetY: { value: options?.offsetY ?? 0, type: "f32" },
          uOffsetZ: { value: options?.offsetZ ?? 0, type: "f32" },
          uStep: { value: options?.step ?? 0, type: "f32" }
        }
      }
    });
  }
  /**
   * Strength of the noise (color = (noiseMap + strength) * texture)
   * @default 0.5
   */
  get strength() {
    return this.resources.simplexUniforms.uniforms.uStrength;
  }
  set strength(value) {
    this.resources.simplexUniforms.uniforms.uStrength = value;
  }
  /**
   * Noise map scale.
   * @default 10
   */
  get noiseScale() {
    return this.resources.simplexUniforms.uniforms.uNoiseScale;
  }
  set noiseScale(value) {
    this.resources.simplexUniforms.uniforms.uNoiseScale = value;
  }
  /**
   * Horizontal offset for the noise map.
   * @default 0
   */
  get offsetX() {
    return this.resources.simplexUniforms.uniforms.uOffsetX;
  }
  set offsetX(value) {
    this.resources.simplexUniforms.uniforms.uOffsetX = value;
  }
  /**
   * Vertical offset for the noise map.
   * @default 0
   */
  get offsetY() {
    return this.resources.simplexUniforms.uniforms.uOffsetY;
  }
  set offsetY(value) {
    this.resources.simplexUniforms.uniforms.uOffsetY = value;
  }
  /**
   * Depth offset for the noise map.
   * @default 0
   */
  get offsetZ() {
    return this.resources.simplexUniforms.uniforms.uOffsetZ;
  }
  set offsetZ(value) {
    this.resources.simplexUniforms.uniforms.uOffsetZ = value;
  }
  /**
   * The threshold used with the step function to create a blocky effect in the noise pattern.
   * When this is greater than 0, the step function is used to compare the noise value to this threshold.
   * @default -1
   */
  get step() {
    return this.resources.simplexUniforms.uniforms.uStep;
  }
  set step(value) {
    this.resources.simplexUniforms.uniforms.uStep = value;
  }
};
/** Default constructor options. */
__publicField(_SimplexNoiseFilter, "defaults", {
  strength: 0.5,
  noiseScale: 10,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  step: -1
});
let SimplexNoiseFilter = _SimplexNoiseFilter;

exports.SimplexNoiseFilter = SimplexNoiseFilter;
//# sourceMappingURL=SimplexNoiseFilter.js.map
