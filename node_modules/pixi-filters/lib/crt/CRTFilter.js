'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var crt$1 = require('./crt.js');
var crt = require('./crt2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _CRTFilter = class _CRTFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the CRTFilter constructor.
   */
  constructor(options) {
    options = { ..._CRTFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: crt["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: crt$1["default"],
      name: "crt-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        crtUniforms: {
          uLine: { value: new Float32Array(4), type: "vec4<f32>" },
          uNoise: { value: new Float32Array(2), type: "vec2<f32>" },
          uVignette: { value: new Float32Array(3), type: "vec3<f32>" },
          uSeed: { value: options.seed, type: "f32" },
          uTime: { value: options.time, type: "f32" },
          uDimensions: { value: new Float32Array(2), type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    /**
     * A seed value to apply to the random noise generation
     * @default 0
     */
    __publicField(this, "seed");
    /**
     * Opacity/intensity of the noise effect between `0` and `1`
     * @default 0.3
     */
    __publicField(this, "time");
    this.uniforms = this.resources.crtUniforms.uniforms;
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    this.uniforms.uDimensions[0] = input.frame.width;
    this.uniforms.uDimensions[1] = input.frame.height;
    this.uniforms.uSeed = this.seed;
    this.uniforms.uTime = this.time;
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * Bend of interlaced lines, higher value means more bend
   * @default 1
   */
  get curvature() {
    return this.uniforms.uLine[0];
  }
  set curvature(value) {
    this.uniforms.uLine[0] = value;
  }
  /**
   * Width of interlaced lines
   * @default 1
   */
  get lineWidth() {
    return this.uniforms.uLine[1];
  }
  set lineWidth(value) {
    this.uniforms.uLine[1] = value;
  }
  /**
   * Contrast of interlaced lines
   * @default 0.25
   */
  get lineContrast() {
    return this.uniforms.uLine[2];
  }
  set lineContrast(value) {
    this.uniforms.uLine[2] = value;
  }
  /**
   * The orientation of the line:
   *
   * `true` create vertical lines, `false` creates horizontal lines
   * @default false
   */
  get verticalLine() {
    return this.uniforms.uLine[3] > 0.5;
  }
  set verticalLine(value) {
    this.uniforms.uLine[3] = value ? 1 : 0;
  }
  /**
   * Opacity/intensity of the noise effect between `0` and `1`
   * @default 0.3
   */
  get noise() {
    return this.uniforms.uNoise[0];
  }
  set noise(value) {
    this.uniforms.uNoise[0] = value;
  }
  /**
   * The size of the noise particles
   * @default 0
   */
  get noiseSize() {
    return this.uniforms.uNoise[1];
  }
  set noiseSize(value) {
    this.uniforms.uNoise[1] = value;
  }
  /**
   * The radius of the vignette effect, smaller values produces a smaller vignette
   * @default 0.3
   */
  get vignetting() {
    return this.uniforms.uVignette[0];
  }
  set vignetting(value) {
    this.uniforms.uVignette[0] = value;
  }
  /**
   * Amount of opacity of vignette
   * @default 1
   */
  get vignettingAlpha() {
    return this.uniforms.uVignette[1];
  }
  set vignettingAlpha(value) {
    this.uniforms.uVignette[1] = value;
  }
  /**
   * Blur intensity of the vignette
   * @default 0.3
   */
  get vignettingBlur() {
    return this.uniforms.uVignette[2];
  }
  set vignettingBlur(value) {
    this.uniforms.uVignette[2] = value;
  }
};
/** Default values for options. */
__publicField(_CRTFilter, "DEFAULT_OPTIONS", {
  curvature: 1,
  lineWidth: 1,
  lineContrast: 0.25,
  verticalLine: false,
  noise: 0,
  noiseSize: 1,
  vignetting: 0.3,
  vignettingAlpha: 1,
  vignettingBlur: 0.3,
  time: 0,
  seed: 0
});
let CRTFilter = _CRTFilter;

exports.CRTFilter = CRTFilter;
//# sourceMappingURL=CRTFilter.js.map
