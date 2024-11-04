'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var emboss$1 = require('./emboss.js');
var emboss = require('./emboss2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class EmbossFilter extends pixi_js.Filter {
  /**
   * @param {number} [strength=5] - Strength of the emboss.
   */
  constructor(strength = 5) {
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: emboss["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: emboss$1["default"],
      name: "emboss-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        embossUniforms: {
          uStrength: { value: strength, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.embossUniforms.uniforms;
  }
  /**
   * Strength of the emboss
   * @default 5
   */
  get strength() {
    return this.uniforms.uStrength;
  }
  set strength(value) {
    this.uniforms.uStrength = value;
  }
}

exports.EmbossFilter = EmbossFilter;
//# sourceMappingURL=EmbossFilter.js.map
