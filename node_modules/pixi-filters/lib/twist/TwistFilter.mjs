import { Filter, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './twist.mjs';
import source from './twist2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _TwistFilter = class _TwistFilter extends Filter {
  /**
   * @param options - Options for the TwistFilter constructor.
   */
  constructor(options) {
    options = { ..._TwistFilter.DEFAULT_OPTIONS, ...options };
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
      name: "twist-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        twistUniforms: {
          uTwist: {
            value: [options.radius ?? 0, options.angle ?? 0],
            type: "vec2<f32>"
          },
          uOffset: {
            value: options.offset,
            type: "vec2<f32>"
          }
        }
      },
      ...options
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.twistUniforms.uniforms;
  }
  /**
   * The radius of the twist
   * @default 200
   */
  get radius() {
    return this.uniforms.uTwist[0];
  }
  set radius(value) {
    this.uniforms.uTwist[0] = value;
  }
  /**
   * The angle of the twist
   * @default 4
   */
  get angle() {
    return this.uniforms.uTwist[1];
  }
  set angle(value) {
    this.uniforms.uTwist[1] = value;
  }
  /**
   * The `x` offset coordinate to change the position of the center of the circle of effect
   * @default 0
   */
  get offset() {
    return this.uniforms.uOffset;
  }
  set offset(value) {
    this.uniforms.uOffset = value;
  }
  /**
   * The `x` offset coordinate to change the position of the center of the circle of effect
   * @default 0
   */
  get offsetX() {
    return this.offset.x;
  }
  set offsetX(value) {
    this.offset.x = value;
  }
  /**
   * The `y` offset coordinate to change the position of the center of the circle of effect
   * @default 0
   */
  get offsetY() {
    return this.offset.y;
  }
  set offsetY(value) {
    this.offset.y = value;
  }
};
/** Default values for options. */
__publicField(_TwistFilter, "DEFAULT_OPTIONS", {
  padding: 20,
  radius: 200,
  angle: 4,
  offset: { x: 0, y: 0 }
});
let TwistFilter = _TwistFilter;

export { TwistFilter };
//# sourceMappingURL=TwistFilter.mjs.map
