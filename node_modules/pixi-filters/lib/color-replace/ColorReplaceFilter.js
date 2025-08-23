'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var colorReplace$1 = require('./color-replace.js');
var colorReplace = require('./color-replace2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ColorReplaceFilter = class _ColorReplaceFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (typeof options === "number" || Array.isArray(options) || options instanceof Float32Array) {
      pixi_js.deprecation("6.0.0", "ColorReplaceFilter constructor params are now options object. See params: { originalColor, targetColor, tolerance }");
      options = { originalColor: options };
      if (args[1] !== void 0)
        options.targetColor = args[1];
      if (args[2] !== void 0)
        options.tolerance = args[2];
    }
    options = { ..._ColorReplaceFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: colorReplace["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: colorReplace$1["default"],
      name: "color-replace-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        colorReplaceUniforms: {
          uOriginalColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uTargetColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uTolerance: { value: options.tolerance, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_originalColor");
    __publicField(this, "_targetColor");
    this.uniforms = this.resources.colorReplaceUniforms.uniforms;
    this._originalColor = new pixi_js.Color();
    this._targetColor = new pixi_js.Color();
    this.originalColor = options.originalColor ?? 16711680;
    this.targetColor = options.targetColor ?? 0;
    Object.assign(this, options);
  }
  /**
   * The color that will be changed.
   * @example [1.0, 1.0, 1.0] = 0xffffff
   * @default 0xff0000
   */
  get originalColor() {
    return this._originalColor.value;
  }
  set originalColor(value) {
    this._originalColor.setValue(value);
    const [r, g, b] = this._originalColor.toArray();
    this.uniforms.uOriginalColor[0] = r;
    this.uniforms.uOriginalColor[1] = g;
    this.uniforms.uOriginalColor[2] = b;
  }
  /**
    * The resulting color.
    * @example [1.0, 1.0, 1.0] = 0xffffff
    * @default 0x000000
    */
  get targetColor() {
    return this._targetColor.value;
  }
  set targetColor(value) {
    this._targetColor.setValue(value);
    const [r, g, b] = this._targetColor.toArray();
    this.uniforms.uTargetColor[0] = r;
    this.uniforms.uTargetColor[1] = g;
    this.uniforms.uTargetColor[2] = b;
  }
  /**
    * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
    * @default 0.4
    */
  get tolerance() {
    return this.uniforms.uTolerance;
  }
  set tolerance(value) {
    this.uniforms.uTolerance = value;
  }
  /**
   * @deprecated since 6.0.0
   *
   * The resulting color, as a 3 component RGB e.g. [1.0, 0.5, 1.0]
   * @member {number|Array<number>|Float32Array}
   * @default 0x000000
   * @see ColorReplaceFilter#targetColor
   */
  set newColor(value) {
    pixi_js.deprecation("6.0.0", "ColorReplaceFilter.newColor is deprecated, please use ColorReplaceFilter.targetColor instead");
    this.targetColor = value;
  }
  get newColor() {
    pixi_js.deprecation("6.0.0", "ColorReplaceFilter.newColor is deprecated, please use ColorReplaceFilter.targetColor instead");
    return this.targetColor;
  }
  /**
   * @deprecated since 6.0.0
   *
   * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
   * @default 0.4
   * @see ColorReplaceFilter#tolerance
   */
  set epsilon(value) {
    pixi_js.deprecation("6.0.0", "ColorReplaceFilter.epsilon is deprecated, please use ColorReplaceFilter.tolerance instead");
    this.tolerance = value;
  }
  get epsilon() {
    pixi_js.deprecation("6.0.0", "ColorReplaceFilter.epsilon is deprecated, please use ColorReplaceFilter.tolerance instead");
    return this.tolerance;
  }
};
/** Default values for options. */
__publicField(_ColorReplaceFilter, "DEFAULT_OPTIONS", {
  originalColor: 16711680,
  targetColor: 0,
  tolerance: 0.4
});
let ColorReplaceFilter = _ColorReplaceFilter;

exports.ColorReplaceFilter = ColorReplaceFilter;
//# sourceMappingURL=ColorReplaceFilter.js.map
