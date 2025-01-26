import { Texture, Filter, TextureSource, deprecation, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default.mjs';
import wgslVertex from '../defaults/default2.mjs';
import fragment from './color-map.mjs';
import source from './color-map2.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ColorMapFilter = class _ColorMapFilter extends Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (options instanceof Texture || options instanceof TextureSource) {
      deprecation("6.0.0", "ColorMapFilter constructor params are now options object. See params: { colorMap, nearest, mix }");
      options = { colorMap: options };
      if (args[1] !== void 0)
        options.nearest = args[1];
      if (args[2] !== void 0)
        options.mix = args[2];
    }
    options = { ..._ColorMapFilter.DEFAULT_OPTIONS, ...options };
    if (!options.colorMap)
      throw Error("No color map texture source was provided to ColorMapFilter");
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
      name: "color-map-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        colorMapUniforms: {
          uMix: { value: options.mix, type: "f32" },
          uSize: { value: 0, type: "f32" },
          uSliceSize: { value: 0, type: "f32" },
          uSlicePixelSize: { value: 0, type: "f32" },
          uSliceInnerSize: { value: 0, type: "f32" }
        },
        uMapTexture: options.colorMap.source,
        uMapSampler: options.colorMap.source.style
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_size", 0);
    __publicField(this, "_sliceSize", 0);
    __publicField(this, "_slicePixelSize", 0);
    __publicField(this, "_sliceInnerSize", 0);
    __publicField(this, "_nearest", false);
    __publicField(this, "_scaleMode", "linear");
    __publicField(this, "_colorMap");
    this.uniforms = this.resources.colorMapUniforms.uniforms;
    Object.assign(this, options);
  }
  /** The mix from 0 to 1, where 0 is the original image and 1 is the color mapped image. */
  get mix() {
    return this.uniforms.uMix;
  }
  set mix(value) {
    this.uniforms.uMix = value;
  }
  /**
   * The size of one color slice.
   * @readonly
   */
  get colorSize() {
    return this._size;
  }
  /** The colorMap texture. */
  get colorMap() {
    return this._colorMap;
  }
  set colorMap(value) {
    if (!value || value === this.colorMap)
      return;
    const source2 = value instanceof Texture ? value.source : value;
    source2.style.scaleMode = this._scaleMode;
    source2.autoGenerateMipmaps = false;
    this._size = source2.height;
    this._sliceSize = 1 / this._size;
    this._slicePixelSize = this._sliceSize / this._size;
    this._sliceInnerSize = this._slicePixelSize * (this._size - 1);
    this.uniforms.uSize = this._size;
    this.uniforms.uSliceSize = this._sliceSize;
    this.uniforms.uSlicePixelSize = this._slicePixelSize;
    this.uniforms.uSliceInnerSize = this._sliceInnerSize;
    this.resources.uMapTexture = source2;
    this._colorMap = value;
  }
  /** Whether use NEAREST for colorMap texture. */
  get nearest() {
    return this._nearest;
  }
  set nearest(nearest) {
    this._nearest = nearest;
    this._scaleMode = nearest ? "nearest" : "linear";
    const texture = this._colorMap;
    if (texture && texture.source) {
      texture.source.scaleMode = this._scaleMode;
      texture.source.autoGenerateMipmaps = false;
      texture.source.style.update();
      texture.source.update();
    }
  }
  /**
   * If the colorMap is based on canvas,
   * and the content of canvas has changed, then call `updateColorMap` for update texture.
   */
  updateColorMap() {
    const texture = this._colorMap;
    if (texture?.source) {
      texture.source.update();
      this.colorMap = texture;
    }
  }
  /**
   * Destroys this filter
   * @default false
   */
  destroy() {
    this._colorMap?.destroy(
      /** true | TODO: Should base texture be destroyed? **/
    );
    super.destroy();
  }
};
/** Default values for options. */
__publicField(_ColorMapFilter, "DEFAULT_OPTIONS", {
  colorMap: Texture.WHITE,
  nearest: false,
  mix: 1
});
let ColorMapFilter = _ColorMapFilter;

export { ColorMapFilter };
//# sourceMappingURL=ColorMapFilter.mjs.map
