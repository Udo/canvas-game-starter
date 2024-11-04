import { Filter, deprecation, GpuProgram, GlProgram, Color } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './multi-color-replace2.mjs';
import source from './multi-color-replace.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _MultiColorReplaceFilter = class _MultiColorReplaceFilter extends Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (Array.isArray(options)) {
      deprecation("6.0.0", "MultiColorReplaceFilter constructor params are now options object. See params: { replacements, tolerance, maxColors }");
      options = { replacements: options };
      if (args[1])
        options.tolerance = args[1];
      if (args[2])
        options.maxColors = args[2];
    }
    options = { ..._MultiColorReplaceFilter.DEFAULT_OPTIONS, ...options };
    const maxColors = options.maxColors ?? options.replacements.length;
    const gpuProgram = GpuProgram.from({
      vertex: {
        source: wgslVertex,
        entryPoint: "mainVertex"
      },
      fragment: {
        source: source.replace(/\$\{MAX_COLORS\}/g, maxColors.toFixed(0)),
        entryPoint: "mainFragment"
      }
    });
    const glProgram = GlProgram.from({
      vertex,
      fragment: fragment.replace(/\$\{MAX_COLORS\}/g, maxColors.toFixed(0)),
      name: "multi-color-replace-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        multiColorReplaceUniforms: {
          uOriginalColors: {
            value: new Float32Array(3 * maxColors),
            type: "vec3<f32>",
            size: maxColors
          },
          uTargetColors: {
            value: new Float32Array(3 * maxColors),
            type: "vec3<f32>",
            size: maxColors
          },
          uTolerance: { value: options.tolerance, type: "f32" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_replacements", []);
    __publicField(this, "_maxColors");
    this._maxColors = maxColors;
    this.uniforms = this.resources.multiColorReplaceUniforms.uniforms;
    this.replacements = options.replacements;
  }
  /**
   * The collection of replacement items. Each item is color-pair
   * (an array length is 2). In the pair, the first value is original color , the second value is target color
   */
  set replacements(replacements) {
    const originals = this.uniforms.uOriginalColors;
    const targets = this.uniforms.uTargetColors;
    const colorCount = replacements.length;
    const color = new Color();
    if (colorCount > this._maxColors) {
      throw new Error(`Length of replacements (${colorCount}) exceeds the maximum colors length (${this._maxColors})`);
    }
    originals[colorCount * 3] = -1;
    let r;
    let g;
    let b;
    for (let i = 0; i < colorCount; i++) {
      const pair = replacements[i];
      color.setValue(pair[0]);
      [r, g, b] = color.toArray();
      originals[i * 3] = r;
      originals[i * 3 + 1] = g;
      originals[i * 3 + 2] = b;
      color.setValue(pair[1]);
      [r, g, b] = color.toArray();
      targets[i * 3] = r;
      targets[i * 3 + 1] = g;
      targets[i * 3 + 2] = b;
    }
    this._replacements = replacements;
  }
  get replacements() {
    return this._replacements;
  }
  /**
    * Should be called after changing any of the contents of the replacements.
    * This is a convenience method for resetting the `replacements`.
    * @todo implement nested proxy to remove the need for this function
    */
  refresh() {
    this.replacements = this._replacements;
  }
  /**
    * The maximum number of color replacements supported by this filter. Can be changed
    * _only_ during construction.
    * @readonly
    */
  get maxColors() {
    return this._maxColors;
  }
  /**
    * Tolerance of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
    * @default 0.05
    */
  get tolerance() {
    return this.uniforms.uTolerance;
  }
  set tolerance(value) {
    this.uniforms.uTolerance = value;
  }
  /**
   * @deprecated since 6.0.0
   *
   * Tolerance of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
   * @default 0.05
   */
  set epsilon(value) {
    deprecation("6.0.0", "MultiColorReplaceFilter.epsilon is deprecated, please use MultiColorReplaceFilter.tolerance instead");
    this.tolerance = value;
  }
  get epsilon() {
    deprecation("6.0.0", "MultiColorReplaceFilter.epsilon is deprecated, please use MultiColorReplaceFilter.tolerance instead");
    return this.tolerance;
  }
};
/** Default values for options. */
__publicField(_MultiColorReplaceFilter, "DEFAULT_OPTIONS", {
  replacements: [[16711680, 255]],
  tolerance: 0.05,
  maxColors: void 0
});
let MultiColorReplaceFilter = _MultiColorReplaceFilter;

export { MultiColorReplaceFilter };
//# sourceMappingURL=MultiColorReplaceFilter.mjs.map
