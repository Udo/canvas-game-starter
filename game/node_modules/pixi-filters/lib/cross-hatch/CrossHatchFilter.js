'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var crosshatch$1 = require('./crosshatch.js');
var crosshatch = require('./crosshatch2.js');

class CrossHatchFilter extends pixi_js.Filter {
  constructor() {
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: crosshatch["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: crosshatch$1["default"],
      name: "cross-hatch-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {}
    });
  }
}

exports.CrossHatchFilter = CrossHatchFilter;
//# sourceMappingURL=CrossHatchFilter.js.map
