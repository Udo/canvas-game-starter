import { Filter, deprecation, GpuProgram, GlProgram, TexturePool } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './kawase-blur.mjs';
import source from './kawase-blur2.mjs';
import fragmentClamp from './kawase-blur-clamp.mjs';
import sourceClamp from './kawase-blur-clamp2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _KawaseBlurFilter = class _KawaseBlurFilter extends Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (typeof options === "number" || Array.isArray(options)) {
      deprecation("6.0.0", "KawaseBlurFilter constructor params are now options object. See params: { strength, quality, clamp, pixelSize }");
      options = { strength: options };
      if (args[1] !== void 0)
        options.quality = args[1];
      if (args[2] !== void 0)
        options.clamp = args[2];
    }
    options = { ..._KawaseBlurFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = GpuProgram.from({
      vertex: {
        source: wgslVertex,
        entryPoint: "mainVertex"
      },
      fragment: {
        source: options?.clamp ? sourceClamp : source,
        entryPoint: "mainFragment"
      }
    });
    const glProgram = GlProgram.from({
      vertex,
      fragment: options?.clamp ? fragmentClamp : fragment,
      name: "kawase-blur-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        kawaseBlurUniforms: {
          uOffset: { value: new Float32Array(2), type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_pixelSize", { x: 0, y: 0 });
    __publicField(this, "_clamp");
    __publicField(this, "_kernels", []);
    __publicField(this, "_blur");
    __publicField(this, "_quality");
    this.uniforms = this.resources.kawaseBlurUniforms.uniforms;
    this.pixelSize = options.pixelSize ?? { x: 1, y: 1 };
    if (Array.isArray(options.strength)) {
      this.kernels = options.strength;
    } else if (typeof options.strength === "number") {
      this._blur = options.strength;
      this.quality = options.quality ?? 3;
    }
    this._clamp = !!options.clamp;
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    const uvX = this.pixelSizeX / input.source.width;
    const uvY = this.pixelSizeY / input.source.height;
    let offset;
    if (this._quality === 1 || this._blur === 0) {
      offset = this._kernels[0] + 0.5;
      this.uniforms.uOffset[0] = offset * uvX;
      this.uniforms.uOffset[1] = offset * uvY;
      filterManager.applyFilter(this, input, output, clearMode);
    } else {
      const renderTarget = TexturePool.getSameSizeTexture(input);
      let source2 = input;
      let target = renderTarget;
      let tmp;
      const last = this._quality - 1;
      for (let i = 0; i < last; i++) {
        offset = this._kernels[i] + 0.5;
        this.uniforms.uOffset[0] = offset * uvX;
        this.uniforms.uOffset[1] = offset * uvY;
        filterManager.applyFilter(this, source2, target, true);
        tmp = source2;
        source2 = target;
        target = tmp;
      }
      offset = this._kernels[last] + 0.5;
      this.uniforms.uOffset[0] = offset * uvX;
      this.uniforms.uOffset[1] = offset * uvY;
      filterManager.applyFilter(this, source2, output, clearMode);
      TexturePool.returnTexture(renderTarget);
    }
  }
  /**
    * The amount of blur, value greater than `0`.
    * @default 4
    */
  get strength() {
    return this._blur;
  }
  set strength(value) {
    this._blur = value;
    this._generateKernels();
  }
  /**
    * The quality of the filter, integer greater than `1`.
    * @default 3
    */
  get quality() {
    return this._quality;
  }
  set quality(value) {
    this._quality = Math.max(1, Math.round(value));
    this._generateKernels();
  }
  /**
    * The kernel size of the blur filter, for advanced usage
    * @default [0]
    */
  get kernels() {
    return this._kernels;
  }
  set kernels(value) {
    if (Array.isArray(value) && value.length > 0) {
      this._kernels = value;
      this._quality = value.length;
      this._blur = Math.max(...value);
    } else {
      this._kernels = [0];
      this._quality = 1;
    }
  }
  /**
    * The size of the pixels. Large size is blurrier. For advanced usage.
    * @default {x:1,y:1}
    */
  get pixelSize() {
    return this._pixelSize;
  }
  set pixelSize(value) {
    if (typeof value === "number") {
      this.pixelSizeX = this.pixelSizeY = value;
      return;
    }
    if (Array.isArray(value)) {
      this.pixelSizeX = value[0];
      this.pixelSizeY = value[1];
      return;
    }
    this._pixelSize = value;
  }
  /**
    * The size of the pixels on the `x` axis. Large size is blurrier. For advanced usage.
    * @default 1
    */
  get pixelSizeX() {
    return this.pixelSize.x;
  }
  set pixelSizeX(value) {
    this.pixelSize.x = value;
  }
  /**
    * The size of the pixels on the `y` axis. Large size is blurrier. For advanced usage.
    * @default 1
    */
  get pixelSizeY() {
    return this.pixelSize.y;
  }
  set pixelSizeY(value) {
    this.pixelSize.y = value;
  }
  /**
    * Get the if the filter is clamped
    * @default false
    */
  get clamp() {
    return this._clamp;
  }
  /** Update padding based on kernel data */
  _updatePadding() {
    this.padding = Math.ceil(this._kernels.reduce((acc, v) => acc + v + 0.5, 0));
  }
  /** Auto generate kernels by blur & quality */
  _generateKernels() {
    const blur = this._blur;
    const quality = this._quality;
    const kernels = [blur];
    if (blur > 0) {
      let k = blur;
      const step = blur / quality;
      for (let i = 1; i < quality; i++) {
        k -= step;
        kernels.push(k);
      }
    }
    this._kernels = kernels;
    this._updatePadding();
  }
};
/** Default values for options. */
__publicField(_KawaseBlurFilter, "DEFAULT_OPTIONS", {
  strength: 4,
  quality: 3,
  clamp: false,
  pixelSize: { x: 1, y: 1 }
});
let KawaseBlurFilter = _KawaseBlurFilter;

export { KawaseBlurFilter };
//# sourceMappingURL=KawaseBlurFilter.mjs.map
