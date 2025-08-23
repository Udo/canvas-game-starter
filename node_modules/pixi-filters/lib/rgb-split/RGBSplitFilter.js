'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var rgbSplit$1 = require('./rgb-split2.js');
var rgbSplit = require('./rgb-split.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _RGBSplitFilter = class _RGBSplitFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (Array.isArray(options) || "x" in options && "y" in options) {
      pixi_js.deprecation("6.0.0", "RGBSplitFilter constructor params are now options object. See params: { red, green, blue }");
      options = { red: options };
      if (args[1] !== void 0)
        options.green = args[1];
      if (args[2] !== void 0)
        options.blue = args[2];
    }
    options = { ..._RGBSplitFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: rgbSplit["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: rgbSplit$1["default"],
      name: "rgb-split-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        rgbSplitUniforms: {
          uRed: { value: options.red, type: "vec2<f32>" },
          uGreen: { value: options.green, type: "vec2<f32>" },
          uBlue: { value: options.blue, type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.rgbSplitUniforms.uniforms;
    Object.assign(this, options);
  }
  /**
   * Red channel offset.
   * @default {x:-10,y:0}
   */
  get red() {
    return this.uniforms.uRed;
  }
  set red(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uRed = value;
  }
  /**
   * Amount of x-axis offset for the red channel.
   * @default -10
   */
  get redX() {
    return this.red.x;
  }
  set redX(value) {
    this.red.x = value;
  }
  /**
   * Amount of y-axis offset for the red channel.
   * @default 0
   */
  get redY() {
    return this.red.y;
  }
  set redY(value) {
    this.red.y = value;
  }
  /**
   * Green channel offset.
   * @default {x:0,y:10}
   */
  get green() {
    return this.uniforms.uGreen;
  }
  set green(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uGreen = value;
  }
  /**
   * Amount of x-axis offset for the green channel.
   * @default 0
   */
  get greenX() {
    return this.green.x;
  }
  set greenX(value) {
    this.green.x = value;
  }
  /**
   * Amount of y-axis offset for the green channel.
   * @default 10
   */
  get greenY() {
    return this.green.y;
  }
  set greenY(value) {
    this.green.y = value;
  }
  /**
   * Blue channel offset.
   * @default {x:0,y:0}
   */
  get blue() {
    return this.uniforms.uBlue;
  }
  set blue(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uBlue = value;
  }
  /**
   * Amount of x-axis offset for the blue channel.
   * @default 0
   */
  get blueX() {
    return this.blue.x;
  }
  set blueX(value) {
    this.blue.x = value;
  }
  /**
   * Amount of y-axis offset for the blue channel.
   * @default 0
   */
  get blueY() {
    return this.blue.y;
  }
  set blueY(value) {
    this.blue.y = value;
  }
};
/** Default values for options. */
__publicField(_RGBSplitFilter, "DEFAULT_OPTIONS", {
  red: { x: -10, y: 0 },
  green: { x: 0, y: 10 },
  blue: { x: 0, y: 0 }
});
let RGBSplitFilter = _RGBSplitFilter;

exports.RGBSplitFilter = RGBSplitFilter;
//# sourceMappingURL=RGBSplitFilter.js.map
