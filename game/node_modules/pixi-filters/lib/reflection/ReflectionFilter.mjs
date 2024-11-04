import { Filter, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './reflection.mjs';
import source from './reflection2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ReflectionFilter = class _ReflectionFilter extends Filter {
  /**
   * @param options - Options for the ReflectionFilter constructor.
   */
  constructor(options) {
    options = { ..._ReflectionFilter.DEFAULT_OPTIONS, ...options };
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
      name: "reflection-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        reflectionUniforms: {
          uMirror: { value: options.mirror ? 1 : 0, type: "f32" },
          uBoundary: { value: options.boundary, type: "f32" },
          uAmplitude: { value: options.amplitude, type: "vec2<f32>" },
          uWavelength: { value: options.waveLength, type: "vec2<f32>" },
          uAlpha: { value: options.alpha, type: "vec2<f32>" },
          uTime: { value: options.time, type: "f32" },
          uDimensions: { value: new Float32Array(2), type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    /**
     * Time for animating position of waves
     * @default 0
     */
    __publicField(this, "time", 0);
    this.uniforms = this.resources.reflectionUniforms.uniforms;
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
    this.uniforms.uTime = this.time;
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * `true` to reflect the image, `false` for waves-only
   * @default true
   */
  get mirror() {
    return this.uniforms.uMirror > 0.5;
  }
  set mirror(value) {
    this.uniforms.uMirror = value ? 1 : 0;
  }
  /**
   * Vertical position of the reflection point, default is 50% (middle)
   * smaller numbers produce a larger reflection, larger numbers produce a smaller reflection.
   * @default 0.5
   */
  get boundary() {
    return this.uniforms.uBoundary;
  }
  set boundary(value) {
    this.uniforms.uBoundary = value;
  }
  /**
   * Starting and ending amplitude of waves
   * @default [0,20]
   */
  get amplitude() {
    return Array.from(this.uniforms.uAmplitude);
  }
  set amplitude(value) {
    this.uniforms.uAmplitude[0] = value[0];
    this.uniforms.uAmplitude[1] = value[1];
  }
  /**
   * Starting amplitude of waves
   * @default 0
   */
  get amplitudeStart() {
    return this.uniforms.uAmplitude[0];
  }
  set amplitudeStart(value) {
    this.uniforms.uAmplitude[0] = value;
  }
  /**
   * Starting amplitude of waves
   * @default 20
   */
  get amplitudeEnd() {
    return this.uniforms.uAmplitude[1];
  }
  set amplitudeEnd(value) {
    this.uniforms.uAmplitude[1] = value;
  }
  /**
   * Starting and ending length of waves
   * @default [30,100]
   */
  get waveLength() {
    return Array.from(this.uniforms.uWavelength);
  }
  set waveLength(value) {
    this.uniforms.uWavelength[0] = value[0];
    this.uniforms.uWavelength[1] = value[1];
  }
  /**
   * Starting wavelength of waves
   * @default 30
   */
  get wavelengthStart() {
    return this.uniforms.uWavelength[0];
  }
  set wavelengthStart(value) {
    this.uniforms.uWavelength[0] = value;
  }
  /**
   * Starting wavelength of waves
   * @default 100
   */
  get wavelengthEnd() {
    return this.uniforms.uWavelength[1];
  }
  set wavelengthEnd(value) {
    this.uniforms.uWavelength[1] = value;
  }
  /**
   * Starting and ending alpha values
   * @default [1,1]
   */
  get alpha() {
    return Array.from(this.uniforms.uAlpha);
  }
  set alpha(value) {
    this.uniforms.uAlpha[0] = value[0];
    this.uniforms.uAlpha[1] = value[1];
  }
  /**
   * Starting wavelength of waves
   * @default 1
   */
  get alphaStart() {
    return this.uniforms.uAlpha[0];
  }
  set alphaStart(value) {
    this.uniforms.uAlpha[0] = value;
  }
  /**
   * Starting wavelength of waves
   * @default 1
   */
  get alphaEnd() {
    return this.uniforms.uAlpha[1];
  }
  set alphaEnd(value) {
    this.uniforms.uAlpha[1] = value;
  }
};
/** Default values for options. */
__publicField(_ReflectionFilter, "DEFAULT_OPTIONS", {
  mirror: true,
  boundary: 0.5,
  amplitude: [0, 20],
  waveLength: [30, 100],
  alpha: [1, 1],
  time: 0
});
let ReflectionFilter = _ReflectionFilter;

export { ReflectionFilter };
//# sourceMappingURL=ReflectionFilter.mjs.map
