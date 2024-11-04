import { Filter, deprecation, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './shockwave2.mjs';
import source from './shockwave.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ShockwaveFilter = class _ShockwaveFilter extends Filter {
  /** @ignore */
  // eslint-disable-next-line max-len
  constructor(...args) {
    let options = args[0] ?? {};
    if (Array.isArray(options) || "x" in options && "y" in options) {
      deprecation("6.0.0", "ShockwaveFilter constructor params are now options object. See params: { center, speed, amplitude, wavelength, brightness, radius, time }");
      options = { center: options, ...args[1] };
      if (args[2] !== void 0)
        options.time = args[2];
    }
    options = { ..._ShockwaveFilter.DEFAULT_OPTIONS, ...options };
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
      name: "shockwave-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        shockwaveUniforms: {
          uTime: { value: options.time, type: "f32" },
          uCenter: { value: options.center, type: "vec2<f32>" },
          uSpeed: { value: options.speed, type: "f32" },
          uWave: { value: new Float32Array(4), type: "vec4<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    /** Sets the elapsed time of the shockwave. It could control the current size of shockwave. */
    __publicField(this, "time");
    this.time = 0;
    this.uniforms = this.resources.shockwaveUniforms.uniforms;
    Object.assign(this, options);
  }
  apply(filterManager, input, output, clearMode) {
    this.uniforms.uTime = this.time;
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * The `x` and `y` center coordinates to change the position of the center of the circle of effect.
   * @default [0,0]
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
   * The speed about the shockwave ripples out. The unit is `pixel-per-second`
   * @default 500
   */
  get speed() {
    return this.uniforms.uSpeed;
  }
  set speed(value) {
    this.uniforms.uSpeed = value;
  }
  /**
   * The amplitude of the shockwave
   * @default 30
   */
  get amplitude() {
    return this.uniforms.uWave[0];
  }
  set amplitude(value) {
    this.uniforms.uWave[0] = value;
  }
  /**
   * The wavelength of the shockwave
   * @default 160
   */
  get wavelength() {
    return this.uniforms.uWave[1];
  }
  set wavelength(value) {
    this.uniforms.uWave[1] = value;
  }
  /**
   * The brightness of the shockwave
   * @default 1
   */
  get brightness() {
    return this.uniforms.uWave[2];
  }
  set brightness(value) {
    this.uniforms.uWave[2] = value;
  }
  /**
   * The maximum radius of shockwave. less than `0` means the max is an infinite distance
   * @default -1
   */
  get radius() {
    return this.uniforms.uWave[3];
  }
  set radius(value) {
    this.uniforms.uWave[3] = value;
  }
};
/** Default shockwave filter options */
__publicField(_ShockwaveFilter, "DEFAULT_OPTIONS", {
  /** The `x` and `y` center coordinates to change the position of the center of the circle of effect. */
  center: { x: 0, y: 0 },
  /** The speed about the shockwave ripples out. The unit is `pixel-per-second` */
  speed: 500,
  /** The amplitude of the shockwave */
  amplitude: 30,
  /** The wavelength of the shockwave */
  wavelength: 160,
  /** The brightness of the shockwave */
  brightness: 1,
  /** The maximum radius of shockwave. less than `0` means the max is an infinite distance */
  radius: -1
});
let ShockwaveFilter = _ShockwaveFilter;

export { ShockwaveFilter };
//# sourceMappingURL=ShockwaveFilter.mjs.map
