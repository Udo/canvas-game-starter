'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var motionBlur$1 = require('./motion-blur.js');
var motionBlur = require('./motion-blur2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _MotionBlurFilter = class _MotionBlurFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (Array.isArray(options) || "x" in options && "y" in options || options instanceof pixi_js.ObservablePoint) {
      pixi_js.deprecation("6.0.0", "MotionBlurFilter constructor params are now options object. See params: { velocity, kernelSize, offset }");
      const x = "x" in options ? options.x : options[0];
      const y = "y" in options ? options.y : options[1];
      options = { velocity: { x, y } };
      if (args[1] !== void 0)
        options.kernelSize = args[1];
      if (args[2] !== void 0)
        options.offset = args[2];
    }
    options = { ..._MotionBlurFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: motionBlur["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: motionBlur$1["default"],
      name: "motion-blur-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        motionBlurUniforms: {
          uVelocity: { value: options.velocity, type: "vec2<f32>" },
          uKernelSize: { value: Math.trunc(options.kernelSize ?? 5), type: "i32" },
          uOffset: { value: options.offset, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_kernelSize");
    this.uniforms = this.resources.motionBlurUniforms.uniforms;
    Object.assign(this, options);
  }
  /**
   * Sets the velocity of the motion for blur effect
   * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
   * once defined in the constructor
   * @default {x:0,y:0}
   */
  get velocity() {
    return this.uniforms.uVelocity;
  }
  set velocity(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uVelocity = value;
    this._updateDirty();
  }
  /**
   * Sets the velocity of the motion for blur effect on the `x` axis
   * @default 0
   */
  get velocityX() {
    return this.velocity.x;
  }
  set velocityX(value) {
    this.velocity.x = value;
    this._updateDirty();
  }
  /**
   * Sets the velocity of the motion for blur effect on the `x` axis
   * @default 0
   */
  get velocityY() {
    return this.velocity.y;
  }
  set velocityY(value) {
    this.velocity.y = value;
    this._updateDirty();
  }
  /**
   * The kernelSize of the blur filter. Must be odd number >= 5
   * @default 5
   */
  get kernelSize() {
    return this._kernelSize;
  }
  set kernelSize(value) {
    this._kernelSize = value;
    this._updateDirty();
  }
  /**
   * The offset of the blur filter
   * @default 0
   */
  get offset() {
    return this.uniforms.uOffset;
  }
  set offset(value) {
    this.uniforms.uOffset = value;
  }
  _updateDirty() {
    this.padding = (Math.max(Math.abs(this.velocityX), Math.abs(this.velocityY)) >> 0) + 1;
    this.uniforms.uKernelSize = this.velocityX !== 0 || this.velocityY !== 0 ? this._kernelSize : 0;
  }
};
/** Default values for options. */
__publicField(_MotionBlurFilter, "DEFAULT_OPTIONS", {
  velocity: { x: 0, y: 0 },
  kernelSize: 5,
  offset: 0
});
let MotionBlurFilter = _MotionBlurFilter;

exports.MotionBlurFilter = MotionBlurFilter;
//# sourceMappingURL=MotionBlurFilter.js.map
