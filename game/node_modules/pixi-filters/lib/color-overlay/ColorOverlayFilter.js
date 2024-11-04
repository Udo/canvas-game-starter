'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var colorOverlay$1 = require('./color-overlay2.js');
var colorOverlay = require('./color-overlay.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ColorOverlayFilter = class _ColorOverlayFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (typeof options === "number" || Array.isArray(options) || options instanceof Float32Array) {
      pixi_js.deprecation("6.0.0", "ColorOverlayFilter constructor params are now options object. See params: { color, alpha }");
      options = { color: options };
      if (args[1] !== void 0)
        options.alpha = args[1];
    }
    options = { ..._ColorOverlayFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: colorOverlay["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: colorOverlay$1["default"],
      name: "color-overlay-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        colorOverlayUniforms: {
          uColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uAlpha: { value: options.alpha, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_color");
    this.uniforms = this.resources.colorOverlayUniforms.uniforms;
    this._color = new pixi_js.Color();
    this.color = options.color ?? 0;
  }
  /**
   * The over color source
   * @member {number|Array<number>|Float32Array}
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
   * The alpha value of the color
   * @default 1
   */
  get alpha() {
    return this.uniforms.uAlpha;
  }
  set alpha(value) {
    this.uniforms.uAlpha = value;
  }
};
/** Default shockwave filter options */
__publicField(_ColorOverlayFilter, "DEFAULT_OPTIONS", {
  /** The color of the overlay */
  color: 0,
  /** The alpha of the overlay */
  alpha: 1
});
let ColorOverlayFilter = _ColorOverlayFilter;

exports.ColorOverlayFilter = ColorOverlayFilter;
//# sourceMappingURL=ColorOverlayFilter.js.map
