'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var convolution$1 = require('./convolution.js');
var convolution = require('./convolution2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ConvolutionFilter = class _ConvolutionFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (Array.isArray(options)) {
      pixi_js.deprecation("6.0.0", "ConvolutionFilter constructor params are now options object. See params: { matrix, width, height }");
      options = { matrix: options };
      if (args[1] !== void 0)
        options.width = args[1];
      if (args[2] !== void 0)
        options.height = args[2];
    }
    options = { ..._ConvolutionFilter.DEFAULT_OPTIONS, ...options };
    const width = options.width ?? 200;
    const height = options.height ?? 200;
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: convolution["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: convolution$1["default"],
      name: "convolution-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        convolutionUniforms: {
          uMatrix: { value: options.matrix, type: "mat3x3<f32>" },
          uTexelSize: { value: { x: 1 / width, y: 1 / height }, type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.convolutionUniforms.uniforms;
    this.width = width;
    this.height = height;
  }
  /**
   * An array of values used for matrix transformation, specified as a 9 point Array
   * @example
   * const matrix = new Float32Array(9); // 9 elements of value 0
   * const matrix = [0,0.5,0,0.5,1,0.5,0,0.5,0];
   * @default [0,0,0,0,0,0,0,0,0]
   */
  get matrix() {
    return this.uniforms.uMatrix;
  }
  set matrix(matrix) {
    matrix.forEach((v, i) => {
      this.uniforms.uMatrix[i] = v;
    });
  }
  /**
   * Width of the object you are transforming
   * @default 200
   */
  get width() {
    return 1 / this.uniforms.uTexelSize.x;
  }
  set width(value) {
    this.uniforms.uTexelSize.x = 1 / value;
  }
  /**
   * Height of the object you are transforming
   * @default 200
   */
  get height() {
    return 1 / this.uniforms.uTexelSize.y;
  }
  set height(value) {
    this.uniforms.uTexelSize.y = 1 / value;
  }
};
/** Default values for options. */
__publicField(_ConvolutionFilter, "DEFAULT_OPTIONS", {
  matrix: new Float32Array(9),
  width: 200,
  height: 200
});
let ConvolutionFilter = _ConvolutionFilter;

exports.ConvolutionFilter = ConvolutionFilter;
//# sourceMappingURL=ConvolutionFilter.js.map
