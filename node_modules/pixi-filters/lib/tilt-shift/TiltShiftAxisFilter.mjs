import { Filter, ViewSystem, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './tilt-shift.mjs';
import source from './tilt-shift2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _TiltShiftAxisFilter = class _TiltShiftAxisFilter extends Filter {
  constructor(options) {
    const { width, height } = ViewSystem.defaultOptions;
    options = {
      ..._TiltShiftAxisFilter.DEFAULT_OPTIONS,
      /** The position to start the effect at. */
      start: { x: 0, y: height / 2 },
      /** The position to end the effect at. */
      end: { x: width, y: height / 2 },
      ...options
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
      name: "tilt-shift-axis-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        tiltShiftUniforms: {
          uBlur: {
            value: new Float32Array([
              options.blur,
              options.gradientBlur
            ]),
            type: "vec2<f32>"
          },
          uStart: { value: options.start, type: "vec2<f32>" },
          uEnd: { value: options.end, type: "vec2<f32>" },
          uDelta: { value: new Float32Array([0, 0]), type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_tiltAxis");
    this.uniforms = this.resources.tiltShiftUniforms.uniforms;
    this._tiltAxis = options.axis;
  }
  /**
   * Updates the filter delta values.
   * @ignore
   */
  updateDelta() {
    this.uniforms.uDelta[0] = 0;
    this.uniforms.uDelta[1] = 0;
    if (this._tiltAxis === void 0)
      return;
    const end = this.uniforms.uEnd;
    const start = this.uniforms.uStart;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const isVert = this._tiltAxis === "vertical";
    this.uniforms.uDelta[0] = !isVert ? dx / d : -dy / d;
    this.uniforms.uDelta[1] = !isVert ? dy / d : dx / d;
  }
};
/** Default values for options. */
__publicField(_TiltShiftAxisFilter, "DEFAULT_OPTIONS", {
  /** The strength of the blur. */
  blur: 100,
  /** The strength of the blur gradient */
  gradientBlur: 600
});
let TiltShiftAxisFilter = _TiltShiftAxisFilter;

export { TiltShiftAxisFilter };
//# sourceMappingURL=TiltShiftAxisFilter.mjs.map
