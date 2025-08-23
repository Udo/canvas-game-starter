import { Filter, deprecation, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './radial-blur2.mjs';
import source from './radial-blur.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _RadialBlurFilter = class _RadialBlurFilter extends Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (typeof options === "number") {
      deprecation("6.0.0", "RadialBlurFilter constructor params are now options object. See params: { angle, center, kernelSize, radius }");
      options = { angle: options };
      if (args[1]) {
        const x = "x" in args[1] ? args[1].x : args[1][0];
        const y = "y" in args[1] ? args[1].y : args[1][1];
        options.center = { x, y };
      }
      if (args[2])
        options.kernelSize = args[2];
      if (args[3])
        options.radius = args[3];
    }
    options = { ..._RadialBlurFilter.DEFAULT_OPTIONS, ...options };
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
      name: "radial-blur-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        radialBlurUniforms: {
          uRadian: { value: 0, type: "f32" },
          uCenter: { value: options.center, type: "vec2<f32>" },
          uKernelSize: { value: options.kernelSize, type: "i32" },
          uRadius: { value: options.radius, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_angle");
    __publicField(this, "_kernelSize");
    this.uniforms = this.resources.radialBlurUniforms.uniforms;
    Object.assign(this, options);
  }
  _updateKernelSize() {
    this.uniforms.uKernelSize = this._angle !== 0 ? this.kernelSize : 0;
  }
  /**
   * Sets the angle in degrees of the motion for blur effect.
   * @default 0
   */
  get angle() {
    return this._angle;
  }
  set angle(value) {
    this._angle = value;
    this.uniforms.uRadian = value * Math.PI / 180;
    this._updateKernelSize();
  }
  /**
   * The `x` and `y` offset coordinates to change the position of the center of the circle of effect.
   * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
   * once defined in the constructor
   * @default {x:0,y:0}
   */
  get center() {
    return this.uniforms.uCenter;
  }
  set center(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uCenter = value;
  }
  /**
   * Sets the velocity of the motion for blur effect on the `x` axis
   * @default 0
   */
  get centerX() {
    return this.center.x;
  }
  set centerX(value) {
    this.center.x = value;
  }
  /**
   * Sets the velocity of the motion for blur effect on the `x` axis
   * @default 0
   */
  get centerY() {
    return this.center.y;
  }
  set centerY(value) {
    this.center.y = value;
  }
  /**
   * The kernelSize of the blur filter. Must be odd number >= 3
   * @default 5
   */
  get kernelSize() {
    return this._kernelSize;
  }
  set kernelSize(value) {
    this._kernelSize = value;
    this._updateKernelSize();
  }
  /**
   * The maximum size of the blur radius, less than `0` equates to infinity
   * @default -1
   */
  get radius() {
    return this.uniforms.uRadius;
  }
  set radius(value) {
    this.uniforms.uRadius = value < 0 || value === Infinity ? -1 : value;
  }
};
/** Default values for options. */
__publicField(_RadialBlurFilter, "DEFAULT_OPTIONS", {
  angle: 0,
  center: { x: 0, y: 0 },
  kernelSize: 5,
  radius: -1
});
let RadialBlurFilter = _RadialBlurFilter;

export { RadialBlurFilter };
//# sourceMappingURL=RadialBlurFilter.mjs.map
