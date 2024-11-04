'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var godRay$1 = require('./god-ray2.js');
var godRay = require('./god-ray.js');
var perlin$1 = require('./perlin.js');
var perlin = require('./perlin2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _GodrayFilter = class _GodrayFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the GodrayFilter constructor.
   */
  constructor(options) {
    options = { ..._GodrayFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: godRay["default"].replace("${PERLIN}", perlin["default"]),
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: godRay$1["default"].replace("${PERLIN}", perlin$1["default"]),
      name: "god-ray-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        godrayUniforms: {
          uLight: { value: new Float32Array(2), type: "vec2<f32>" },
          uParallel: { value: 0, type: "f32" },
          uAspect: { value: 0, type: "f32" },
          uTime: { value: options.time, type: "f32" },
          uRay: { value: new Float32Array(3), type: "vec3<f32>" },
          uDimensions: { value: new Float32Array(2), type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    /**
     * The current time position
     * @default 0
     */
    __publicField(this, "time", 0);
    __publicField(this, "_angleLight", [0, 0]);
    __publicField(this, "_angle", 0);
    __publicField(this, "_center");
    this.uniforms = this.resources.godrayUniforms.uniforms;
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in Filter
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    const width = input.frame.width;
    const height = input.frame.height;
    this.uniforms.uLight[0] = this.parallel ? this._angleLight[0] : this._center.x;
    this.uniforms.uLight[1] = this.parallel ? this._angleLight[1] : this._center.y;
    this.uniforms.uDimensions[0] = width;
    this.uniforms.uDimensions[1] = height;
    this.uniforms.uAspect = height / width;
    this.uniforms.uTime = this.time;
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * The angle/light-source of the rays in degrees. For instance,
   * a value of 0 is vertical rays, values of 90 or -90 produce horizontal rays
   * @default 30
   */
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    const radians = value * pixi_js.DEG_TO_RAD;
    this._angleLight[0] = Math.cos(radians);
    this._angleLight[1] = Math.sin(radians);
  }
  /**
   * `true` if light rays are parallel (uses angle), `false` to use the focal `center` point
   * @default true
   */
  get parallel() {
    return this.uniforms.uParallel > 0.5;
  }
  set parallel(value) {
    this.uniforms.uParallel = value ? 1 : 0;
  }
  /**
   * Focal point for non-parallel rays, to use this `parallel` must be set to `false`.
   * @default {x:0,y:0}
   */
  get center() {
    return this._center;
  }
  set center(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this._center = value;
  }
  /**
   * Focal point for non-parallel rays on the `x` axis, to use this `parallel` must be set to `false`.
   * @default 0
   */
  get centerX() {
    return this.center.x;
  }
  set centerX(value) {
    this.center.x = value;
  }
  /**
   * Focal point for non-parallel rays on the `y` axis, to use this `parallel` must be set to `false`.
   * @default 0
   */
  get centerY() {
    return this.center.y;
  }
  set centerY(value) {
    this.center.y = value;
  }
  /**
   * General intensity of the effect. A value closer to 1 will produce a more intense effect,
   * where a value closer to 0 will produce a subtler effect
   * @default 0.5
   */
  get gain() {
    return this.uniforms.uRay[0];
  }
  set gain(value) {
    this.uniforms.uRay[0] = value;
  }
  /**
   * The density of the fractal noise.
   * A higher amount produces more rays and a smaller amount produces fewer waves
   * @default 2.5
   */
  get lacunarity() {
    return this.uniforms.uRay[1];
  }
  set lacunarity(value) {
    this.uniforms.uRay[1] = value;
  }
  /**
   * The alpha (opacity) of the rays.  0 is fully transparent, 1 is fully opaque.
   * @default 1
   */
  get alpha() {
    return this.uniforms.uRay[2];
  }
  set alpha(value) {
    this.uniforms.uRay[2] = value;
  }
};
/** Default values for options. */
__publicField(_GodrayFilter, "DEFAULT_OPTIONS", {
  angle: 30,
  gain: 0.5,
  lacunarity: 2.5,
  parallel: true,
  time: 0,
  center: { x: 0, y: 0 },
  alpha: 1
});
let GodrayFilter = _GodrayFilter;

exports.GodrayFilter = GodrayFilter;
//# sourceMappingURL=GodrayFilter.js.map
