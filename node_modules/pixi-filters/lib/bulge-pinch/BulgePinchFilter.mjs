import { Filter, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './bulge-pinch.mjs';
import source from './bulge-pinch2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _BulgePinchFilter = class _BulgePinchFilter extends Filter {
  /**
   * @param options - Options for the BulgePinchFilter constructor.
   */
  constructor(options) {
    options = { ..._BulgePinchFilter.DEFAULT_OPTIONS, ...options };
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
      name: "bulge-pinch-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        bulgePinchUniforms: {
          uDimensions: { value: [0, 0], type: "vec2<f32>" },
          uCenter: { value: options.center, type: "vec2<f32>" },
          uRadius: { value: options.radius, type: "f32" },
          uStrength: { value: options.strength, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.bulgePinchUniforms.uniforms;
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
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * Sets the center of the effect in normalized screen coords.
   * { x: 0, y: 0 } means top-left and { x: 1, y: 1 } mean bottom-right
   * @default {x:0.5,y:0.5}
   */
  get center() {
    return this.uniforms.uCenter;
  }
  set center(value) {
    if (typeof value === "number") {
      value = { x: value, y: value };
    }
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uCenter = value;
  }
  /**
   * Sets the center of the effect in normalized screen coords on the `x` axis
   * @default 0
   */
  get centerX() {
    return this.uniforms.uCenter.x;
  }
  set centerX(value) {
    this.uniforms.uCenter.x = value;
  }
  /**
   * Sets the center of the effect in normalized screen coords on the `y` axis
   * @default 0
   */
  get centerY() {
    return this.uniforms.uCenter.y;
  }
  set centerY(value) {
    this.uniforms.uCenter.y = value;
  }
  /**
   * The radius of the circle of effect
   * @default 100
   */
  get radius() {
    return this.uniforms.uRadius;
  }
  set radius(value) {
    this.uniforms.uRadius = value;
  }
  /**
   * A value between -1 and 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
   * @default 1
   */
  get strength() {
    return this.uniforms.uStrength;
  }
  set strength(value) {
    this.uniforms.uStrength = value;
  }
};
/** Default values for options. */
__publicField(_BulgePinchFilter, "DEFAULT_OPTIONS", {
  center: { x: 0.5, y: 0.5 },
  radius: 100,
  strength: 1
});
let BulgePinchFilter = _BulgePinchFilter;

export { BulgePinchFilter };
//# sourceMappingURL=BulgePinchFilter.mjs.map
