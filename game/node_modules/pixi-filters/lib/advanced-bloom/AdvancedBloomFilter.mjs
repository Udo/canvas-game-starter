import { Filter, GpuProgram, GlProgram, Texture, TexturePool } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import { KawaseBlurFilter } from '../kawase-blur/KawaseBlurFilter.mjs';
import fragment from './advanced-bloom.mjs';
import source from './advanced-bloom2.mjs';
import { ExtractBrightnessFilter } from './ExtractBrightnessFilter.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _AdvancedBloomFilter = class _AdvancedBloomFilter extends Filter {
  /**
   * @param options - Options for the AdvancedBloomFilter constructor.
   */
  constructor(options) {
    options = { ..._AdvancedBloomFilter.DEFAULT_OPTIONS, ...options };
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
      name: "advanced-bloom-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        advancedBloomUniforms: {
          uBloomScale: { value: options.bloomScale, type: "f32" },
          uBrightness: { value: options.brightness, type: "f32" }
        },
        uMapTexture: Texture.WHITE
      }
    });
    __publicField(this, "uniforms");
    /** To adjust the strength of the bloom. Higher values is more intense brightness. */
    __publicField(this, "bloomScale", 1);
    /** The brightness, lower value is more subtle brightness, higher value is blown-out. */
    __publicField(this, "brightness", 1);
    __publicField(this, "_extractFilter");
    __publicField(this, "_blurFilter");
    this.uniforms = this.resources.advancedBloomUniforms.uniforms;
    this._extractFilter = new ExtractBrightnessFilter({
      threshold: options.threshold
    });
    this._blurFilter = new KawaseBlurFilter({
      strength: options.kernels ?? options.blur,
      quality: options.kernels ? void 0 : options.quality
    });
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    const brightTarget = TexturePool.getSameSizeTexture(input);
    this._extractFilter.apply(filterManager, input, brightTarget, true);
    const bloomTarget = TexturePool.getSameSizeTexture(input);
    this._blurFilter.apply(filterManager, brightTarget, bloomTarget, true);
    this.uniforms.uBloomScale = this.bloomScale;
    this.uniforms.uBrightness = this.brightness;
    this.resources.uMapTexture = bloomTarget.source;
    filterManager.applyFilter(this, input, output, clearMode);
    TexturePool.returnTexture(bloomTarget);
    TexturePool.returnTexture(brightTarget);
  }
  /**
   * Defines how bright a color needs to be extracted.
   * @default 0.5
   */
  get threshold() {
    return this._extractFilter.threshold;
  }
  set threshold(value) {
    this._extractFilter.threshold = value;
  }
  /** The kernels of the Blur Filter */
  get kernels() {
    return this._blurFilter.kernels;
  }
  set kernels(value) {
    this._blurFilter.kernels = value;
  }
  /**
   * The strength of the Blur properties simultaneously
   * @default 2
   */
  get blur() {
    return this._blurFilter.strength;
  }
  set blur(value) {
    this._blurFilter.strength = value;
  }
  /**
   * The quality of the Blur Filter
   * @default 4
   */
  get quality() {
    return this._blurFilter.quality;
  }
  set quality(value) {
    this._blurFilter.quality = value;
  }
  /**
   * The pixel size of the Kawase Blur filter
   * @default {x:1,y:1}
   */
  get pixelSize() {
    return this._blurFilter.pixelSize;
  }
  set pixelSize(value) {
    if (typeof value === "number") {
      value = { x: value, y: value };
    }
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this._blurFilter.pixelSize = value;
  }
  /**
   * The horizontal pixelSize of the Kawase Blur filter
   * @default 1
   */
  get pixelSizeX() {
    return this._blurFilter.pixelSizeX;
  }
  set pixelSizeX(value) {
    this._blurFilter.pixelSizeX = value;
  }
  /**
   * The vertical pixel size of the Kawase Blur filter
   * @default 1
   */
  get pixelSizeY() {
    return this._blurFilter.pixelSizeY;
  }
  set pixelSizeY(value) {
    this._blurFilter.pixelSizeY = value;
  }
};
/** Default values for options. */
__publicField(_AdvancedBloomFilter, "DEFAULT_OPTIONS", {
  threshold: 0.5,
  bloomScale: 1,
  brightness: 1,
  blur: 8,
  quality: 4,
  pixelSize: { x: 1, y: 1 }
});
let AdvancedBloomFilter = _AdvancedBloomFilter;

export { AdvancedBloomFilter };
//# sourceMappingURL=AdvancedBloomFilter.mjs.map
