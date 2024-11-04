import { Filter, deprecation, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './dot2.mjs';
import source from './dot.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _DotFilter = class _DotFilter extends Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (typeof options === "number") {
      deprecation("6.0.0", "DotFilter constructor params are now options object. See params: { scale, angle, grayscale }");
      options = { scale: options };
      if (args[1] !== void 0)
        options.angle = args[1];
      if (args[2] !== void 0)
        options.grayscale = args[2];
    }
    options = { ..._DotFilter.DEFAULT_OPTIONS, ...options };
    const dotUniforms = {
      uScale: { value: options.scale, type: "f32" },
      uAngle: { value: options.angle, type: "f32" },
      uGrayScale: { value: options.grayscale ? 1 : 0, type: "f32" }
    };
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
      name: "dot-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        dotUniforms
      }
    });
  }
  /**
   * The scale of the effect.
   * @default 1
   */
  get scale() {
    return this.resources.dotUniforms.uniforms.uScale;
  }
  set scale(value) {
    this.resources.dotUniforms.uniforms.uScale = value;
  }
  /**
  * The radius of the effect.
  * @default 5
  */
  get angle() {
    return this.resources.dotUniforms.uniforms.uAngle;
  }
  set angle(value) {
    this.resources.dotUniforms.uniforms.uAngle = value;
  }
  /**
  * Whether to rendering it in gray scale.
  * @default true
  */
  get grayscale() {
    return this.resources.dotUniforms.uniforms.uGrayScale === 1;
  }
  set grayscale(value) {
    this.resources.dotUniforms.uniforms.uGrayScale = value ? 1 : 0;
  }
};
/** Default values for options. */
__publicField(_DotFilter, "DEFAULT_OPTIONS", {
  scale: 1,
  angle: 5,
  grayscale: true
});
let DotFilter = _DotFilter;

export { DotFilter };
//# sourceMappingURL=DotFilter.mjs.map
