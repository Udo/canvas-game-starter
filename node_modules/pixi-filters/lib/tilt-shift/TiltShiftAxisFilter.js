'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var tiltShift$1 = require('./tilt-shift.js');
var tiltShift = require('./tilt-shift2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _TiltShiftAxisFilter = class _TiltShiftAxisFilter extends pixi_js.Filter {
  constructor(options) {
    const { width, height } = pixi_js.ViewSystem.defaultOptions;
    options = {
      ..._TiltShiftAxisFilter.DEFAULT_OPTIONS,
      /** The position to start the effect at. */
      start: { x: 0, y: height / 2 },
      /** The position to end the effect at. */
      end: { x: width, y: height / 2 },
      ...options
    };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: tiltShift["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: tiltShift$1["default"],
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

exports.TiltShiftAxisFilter = TiltShiftAxisFilter;
//# sourceMappingURL=TiltShiftAxisFilter.js.map
