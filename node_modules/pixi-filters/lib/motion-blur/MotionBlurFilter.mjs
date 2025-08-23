import { Filter, ObservablePoint, deprecation, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './motion-blur.mjs';
import source from './motion-blur2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _MotionBlurFilter = class _MotionBlurFilter extends Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (Array.isArray(options) || "x" in options && "y" in options || options instanceof ObservablePoint) {
      deprecation("6.0.0", "MotionBlurFilter constructor params are now options object. See params: { velocity, kernelSize, offset }");
      const x = "x" in options ? options.x : options[0];
      const y = "y" in options ? options.y : options[1];
      options = { velocity: { x, y } };
      if (args[1] !== void 0)
        options.kernelSize = args[1];
      if (args[2] !== void 0)
        options.offset = args[2];
    }
    options = { ..._MotionBlurFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = GpuProgram.from({
      vertex: {
        source: wgslVertex,
        entryPoint: "mainVertex"
      },
      fragment: {
        source,
        entryPoint: "mainFragment"
      }
    });
    const glProgram = GlProgram.from({
      vertex,
      fragment,
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

export { MotionBlurFilter };
//# sourceMappingURL=MotionBlurFilter.mjs.map
