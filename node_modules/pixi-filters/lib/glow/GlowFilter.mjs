import { Filter, GpuProgram, GlProgram, Color } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './glow.mjs';
import source from './glow2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _GlowFilter = class _GlowFilter extends Filter {
  /**
   * @param options - Options for the GlowFilter constructor.
   */
  constructor(options) {
    options = { ..._GlowFilter.DEFAULT_OPTIONS, ...options };
    const distance = options.distance ?? 10;
    const quality = options.quality ?? 0.1;
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
      fragment: fragment.replace(/__ANGLE_STEP_SIZE__/gi, `${(1 / quality / distance).toFixed(7)}`).replace(/__DIST__/gi, `${distance.toFixed(0)}.0`),
      name: "glow-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        glowUniforms: {
          uDistance: { value: distance, type: "f32" },
          uStrength: { value: [options.innerStrength, options.outerStrength], type: "vec2<f32>" },
          uColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uAlpha: { value: options.alpha, type: "f32" },
          uQuality: { value: quality, type: "f32" },
          uKnockout: { value: options?.knockout ?? false ? 1 : 0, type: "f32" }
        }
      },
      padding: distance
    });
    __publicField(this, "uniforms");
    __publicField(this, "_color");
    this.uniforms = this.resources.glowUniforms.uniforms;
    this._color = new Color();
    this.color = options.color ?? 16777215;
  }
  /**
   * Only draw the glow, not the texture itself
   * @default false
   */
  get distance() {
    return this.uniforms.uDistance;
  }
  set distance(value) {
    this.uniforms.uDistance = this.padding = value;
  }
  /**
  * The strength of the glow inward from the edge of the sprite.
  * @default 0
  */
  get innerStrength() {
    return this.uniforms.uStrength[0];
  }
  set innerStrength(value) {
    this.uniforms.uStrength[0] = value;
  }
  /**
  * The strength of the glow outward from the edge of the sprite.
  * @default 4
  */
  get outerStrength() {
    return this.uniforms.uStrength[1];
  }
  set outerStrength(value) {
    this.uniforms.uStrength[1] = value;
  }
  /**
  * The color of the glow.
  * @default 0xFFFFFF
  */
  get color() {
    return this._color.value;
  }
  set color(value) {
    this._color.setValue(value);
    const [r, g, b] = this._color.toArray();
    this.uniforms.uColor[0] = r;
    this.uniforms.uColor[1] = g;
    this.uniforms.uColor[2] = b;
  }
  /**
  * The alpha of the glow
  * @default 1
  */
  get alpha() {
    return this.uniforms.uAlpha;
  }
  set alpha(value) {
    this.uniforms.uAlpha = value;
  }
  /**
  * A number between 0 and 1 that describes the quality of the glow. The higher the number the less performant
  * @default 0.1
  */
  get quality() {
    return this.uniforms.uQuality;
  }
  set quality(value) {
    this.uniforms.uQuality = value;
  }
  /**
  * Only draw the glow, not the texture itself
  * @default false
  */
  get knockout() {
    return this.uniforms.uKnockout === 1;
  }
  set knockout(value) {
    this.uniforms.uKnockout = value ? 1 : 0;
  }
};
/** Default values for options. */
__publicField(_GlowFilter, "DEFAULT_OPTIONS", {
  distance: 10,
  outerStrength: 4,
  innerStrength: 0,
  color: 16777215,
  alpha: 1,
  quality: 0.1,
  knockout: false
});
let GlowFilter = _GlowFilter;

export { GlowFilter };
//# sourceMappingURL=GlowFilter.mjs.map
