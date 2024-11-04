import { Filter, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './emboss.mjs';
import source from './emboss2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class EmbossFilter extends Filter {
  /**
   * @param {number} [strength=5] - Strength of the emboss.
   */
  constructor(strength = 5) {
    const gpuProgram = GpuProgram.from({
      vertex: {
        source: wgslVertex,
        entryPoint: "mainVertex"
      },
      fragment: {
        source,
        entryPoint: "mainFragment"
      }
    });
    const glProgram = GlProgram.from({
      vertex,
      fragment,
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

export { EmbossFilter };
//# sourceMappingURL=EmbossFilter.mjs.map
