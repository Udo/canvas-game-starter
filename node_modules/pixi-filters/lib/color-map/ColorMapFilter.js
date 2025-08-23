'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var colorMap$1 = require('./color-map.js');
var colorMap = require('./color-map2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ColorMapFilter = class _ColorMapFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (options instanceof pixi_js.Texture || options instanceof pixi_js.TextureSource) {
      pixi_js.deprecation("6.0.0", "ColorMapFilter constructor params are now options object. See params: { colorMap, nearest, mix }");
      options = { colorMap: options };
      if (args[1] !== void 0)
        options.nearest = args[1];
      if (args[2] !== void 0)
        options.mix = args[2];
    }
    options = { ..._ColorMapFilter.DEFAULT_OPTIONS, ...options };
    if (!options.colorMap)
      throw Error("No color map texture source was provided to ColorMapFilter");
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: colorMap["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: colorMap$1["default"],
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
    const source2 = value instanceof pixi_js.Texture ? value.source : value;
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
  colorMap: pixi_js.Texture.WHITE,
  nearest: false,
  mix: 1
});
let ColorMapFilter = _ColorMapFilter;

exports.ColorMapFilter = ColorMapFilter;
//# sourceMappingURL=ColorMapFilter.js.map
