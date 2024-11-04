'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var outline$1 = require('./outline.js');
var outline = require('./outline2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _OutlineFilter = class _OutlineFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (typeof options === "number") {
      pixi_js.deprecation("6.0.0", "OutlineFilter constructor params are now options object. See params: { thickness, color, quality, alpha, knockout }");
      options = { thickness: options };
      if (args[1] !== void 0)
        options.color = args[1];
      if (args[2] !== void 0)
        options.quality = args[2];
      if (args[3] !== void 0)
        options.alpha = args[3];
      if (args[4] !== void 0)
        options.knockout = args[4];
    }
    options = { ..._OutlineFilter.DEFAULT_OPTIONS, ...options };
    const quality = options.quality ?? 0.1;
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: outline["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: outline$1["default"].replace(/\$\{ANGLE_STEP\}/, _OutlineFilter.getAngleStep(quality).toFixed(7)),
      name: "outline-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        outlineUniforms: {
          uThickness: { value: new Float32Array(2), type: "vec2<f32>" },
          uColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uAlpha: { value: options.alpha, type: "f32" },
          uAngleStep: { value: 0, type: "f32" },
          uKnockout: { value: options.knockout ? 1 : 0, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_thickness");
    __publicField(this, "_quality");
    __publicField(this, "_color");
    this.uniforms = this.resources.outlineUniforms.uniforms;
    this.uniforms.uAngleStep = _OutlineFilter.getAngleStep(quality);
    this._color = new pixi_js.Color();
    this.color = options.color ?? 0;
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    this.uniforms.uThickness[0] = this.thickness / input.source.width;
    this.uniforms.uThickness[1] = this.thickness / input.source.height;
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /**
   * Get the angleStep by quality
   * @param quality
   */
  static getAngleStep(quality) {
    return parseFloat((Math.PI * 2 / Math.max(
      quality * _OutlineFilter.MAX_SAMPLES,
      _OutlineFilter.MIN_SAMPLES
    )).toFixed(7));
  }
  /**
   * The thickness of the outline
   * @default 1
   */
  get thickness() {
    return this._thickness;
  }
  set thickness(value) {
    this._thickness = this.padding = value;
  }
  /**
   * The color value of the ambient color
   * @example [1.0, 1.0, 1.0] = 0xffffff
   * @default 0x000000
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
   * Coefficient for alpha multiplication
   * @default 1
   */
  get alpha() {
    return this.uniforms.uAlpha;
  }
  set alpha(value) {
    this.uniforms.uAlpha = value;
  }
  /**
   * The quality of the outline from `0` to `1`.
   * Using a higher quality setting will result in more accuracy but slower performance
   * @default 0.1
   */
  get quality() {
    return this._quality;
  }
  set quality(value) {
    this._quality = value;
    this.uniforms.uAngleStep = _OutlineFilter.getAngleStep(value);
  }
  /**
   * Whether to only render outline, not the contents.
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
__publicField(_OutlineFilter, "DEFAULT_OPTIONS", {
  thickness: 1,
  color: 0,
  alpha: 1,
  quality: 0.1,
  knockout: false
});
/** The minimum number of samples for rendering outline. */
__publicField(_OutlineFilter, "MIN_SAMPLES", 1);
/** The maximum number of samples for rendering outline. */
__publicField(_OutlineFilter, "MAX_SAMPLES", 100);
let OutlineFilter = _OutlineFilter;

exports.OutlineFilter = OutlineFilter;
//# sourceMappingURL=OutlineFilter.js.map
