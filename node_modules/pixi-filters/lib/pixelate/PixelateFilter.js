'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var pixelate$1 = require('./pixelate2.js');
var pixelate = require('./pixelate.js');

class PixelateFilter extends pixi_js.Filter {
  /**
   * @param {Point|Array<number>|number} [size=10] - Either the width/height of the size of the pixels, or square size
   */
  constructor(size = 10) {
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: pixelate["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: pixelate$1["default"],
      name: "pixelate-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        pixelateUniforms: {
          uSize: { value: new Float32Array(2), type: "vec2<f32>" }
        }
      }
    });
    this.size = size;
  }
  /**
   * The size of the pixels
   * @default [10,10]
   */
  get size() {
    return this.resources.pixelateUniforms.uniforms.uSize;
  }
  set size(value) {
    if (value instanceof pixi_js.Point) {
      this.sizeX = value.x;
      this.sizeY = value.y;
    } else if (Array.isArray(value)) {
      this.resources.pixelateUniforms.uniforms.uSize = value;
    } else {
      this.sizeX = this.sizeY = value;
    }
  }
  /**
  * The size of the pixels on the `x` axis
  * @default 10
  */
  get sizeX() {
    return this.resources.pixelateUniforms.uniforms.uSize[0];
  }
  set sizeX(value) {
    this.resources.pixelateUniforms.uniforms.uSize[0] = value;
  }
  /**
  * The size of the pixels on the `y` axis
  * @default 10
  */
  get sizeY() {
    return this.resources.pixelateUniforms.uniforms.uSize[1];
  }
  set sizeY(value) {
    this.resources.pixelateUniforms.uniforms.uSize[1] = value;
  }
}

exports.PixelateFilter = PixelateFilter;
//# sourceMappingURL=PixelateFilter.js.map
