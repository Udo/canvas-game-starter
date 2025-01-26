import { Filter, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './old-film.mjs';
import source from './old-film2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _OldFilmFilter = class _OldFilmFilter extends Filter {
  /**
   * @param options - Options for the OldFilmFilter constructor.
   */
  constructor(options) {
    options = { ..._OldFilmFilter.DEFAULT_OPTIONS, ...options };
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
      name: "old-film-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        oldFilmUniforms: {
          uSepia: { value: options.sepia, type: "f32" },
          uNoise: { value: new Float32Array(2), type: "vec2<f32>" },
          uScratch: { value: new Float32Array(3), type: "vec3<f32>" },
          uVignetting: { value: new Float32Array(3), type: "vec3<f32>" },
          uSeed: { value: options.seed, type: "f32" },
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
    this.uniforms = this.resources.oldFilmUniforms.uniforms;
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
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * The amount of saturation of sepia effect,
   * a value of `1` is more saturation and closer to `0` is less, and a value of `0` produces no sepia effect
   * @default 0.3
   */
  get sepia() {
    return this.uniforms.uSepia;
  }
  set sepia(value) {
    this.uniforms.uSepia = value;
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
   * @default 1
   */
  get noiseSize() {
    return this.uniforms.uNoise[1];
  }
  set noiseSize(value) {
    this.uniforms.uNoise[1] = value;
  }
  /**
   * How often scratches appear
   * @default 0.5
   */
  get scratch() {
    return this.uniforms.uScratch[0];
  }
  set scratch(value) {
    this.uniforms.uScratch[0] = value;
  }
  /**
   * The density of the number of scratches
   * @default 0.3
   */
  get scratchDensity() {
    return this.uniforms.uScratch[1];
  }
  set scratchDensity(value) {
    this.uniforms.uScratch[1] = value;
  }
  /**
   * The width of the scratches
   * @default 1
   */
  get scratchWidth() {
    return this.uniforms.uScratch[2];
  }
  set scratchWidth(value) {
    this.uniforms.uScratch[2] = value;
  }
  /**
   * The radius of the vignette effect, smaller values produces a smaller vignette
   * @default 0.3
   */
  get vignetting() {
    return this.uniforms.uVignetting[0];
  }
  set vignetting(value) {
    this.uniforms.uVignetting[0] = value;
  }
  /**
   * Amount of opacity on the vignette
   * @default 1
   */
  get vignettingAlpha() {
    return this.uniforms.uVignetting[1];
  }
  set vignettingAlpha(value) {
    this.uniforms.uVignetting[1] = value;
  }
  /**
   * Blur intensity of the vignette
   * @default 1
   */
  get vignettingBlur() {
    return this.uniforms.uVignetting[2];
  }
  set vignettingBlur(value) {
    this.uniforms.uVignetting[2] = value;
  }
};
/** Default values for options. */
__publicField(_OldFilmFilter, "DEFAULT_OPTIONS", {
  sepia: 0.3,
  noise: 0.3,
  noiseSize: 1,
  scratch: 0.5,
  scratchDensity: 0.3,
  scratchWidth: 1,
  vignetting: 0.3,
  vignettingAlpha: 1,
  vignettingBlur: 0.3,
  seed: 0
});
let OldFilmFilter = _OldFilmFilter;

export { OldFilmFilter };
//# sourceMappingURL=OldFilmFilter.mjs.map
