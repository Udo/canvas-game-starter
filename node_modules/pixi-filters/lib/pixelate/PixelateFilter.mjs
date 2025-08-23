import { Filter, GpuProgram, GlProgram, Point } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './pixelate2.mjs';
import source from './pixelate.mjs';

class PixelateFilter extends Filter {
  /**
   * @param {Point|Array<number>|number} [size=10] - Either the width/height of the size of the pixels, or square size
   */
  constructor(size = 10) {
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
    if (value instanceof Point) {
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

export { PixelateFilter };
//# sourceMappingURL=PixelateFilter.mjs.map
