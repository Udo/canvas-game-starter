import { Filter, deprecation, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './convolution.mjs';
import source from './convolution2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ConvolutionFilter = class _ConvolutionFilter extends Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (Array.isArray(options)) {
      deprecation("6.0.0", "ConvolutionFilter constructor params are now options object. See params: { matrix, width, height }");
      options = { matrix: options };
      if (args[1] !== void 0)
        options.width = args[1];
      if (args[2] !== void 0)
        options.height = args[2];
    }
    options = { ..._ConvolutionFilter.DEFAULT_OPTIONS, ...options };
    const width = options.width ?? 200;
    const height = options.height ?? 200;
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

export { ConvolutionFilter };
//# sourceMappingURL=ConvolutionFilter.mjs.map
