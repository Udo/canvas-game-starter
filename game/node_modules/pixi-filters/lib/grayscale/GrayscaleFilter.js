'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var grayscale$1 = require('./grayscale.js');
var grayscale = require('./grayscale2.js');

class GrayscaleFilter extends pixi_js.Filter {
  constructor() {
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: grayscale["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: grayscale$1["default"],
      name: "grayscale-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {}
    });
  }
}

exports.GrayscaleFilter = GrayscaleFilter;
//# sourceMappingURL=GrayscaleFilter.js.map
