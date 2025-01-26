'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var simpleLightmap$1 = require('./simple-lightmap.js');
var simpleLightmap = require('./simple-lightmap2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _SimpleLightmapFilter = class _SimpleLightmapFilter extends pixi_js.Filter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (options instanceof pixi_js.Texture) {
      pixi_js.deprecation("6.0.0", "SimpleLightmapFilter constructor params are now options object. See params: { lightMap, color, alpha }");
      options = { lightMap: options };
      if (args[1] !== void 0)
        options.color = args[1];
      if (args[2] !== void 0)
        options.alpha = args[2];
    }
    options = { ..._SimpleLightmapFilter.DEFAULT_OPTIONS, ...options };
    if (!options.lightMap)
      throw Error("No light map texture source was provided to SimpleLightmapFilter");
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: simpleLightmap["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: simpleLightmap$1["default"],
      name: "simple-lightmap-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        simpleLightmapUniforms: {
          uColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uAlpha: { value: options.alpha, type: "f32" },
          uDimensions: { value: new Float32Array(2), type: "vec2<f32>" }
        },
        uMapTexture: options.lightMap.source,
        uMapSampler: options.lightMap.source.style
      }
    });
    __publicField(this, "uniforms");
    __publicField(this, "_color");
    __publicField(this, "_lightMap");
    this.uniforms = this.resources.simpleLightmapUniforms.uniforms;
    this._color = new pixi_js.Color();
    this.color = options.color ?? 0;
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    this.uniforms.uDimensions[0] = input.frame.width;
    this.uniforms.uDimensions[1] = input.frame.height;
    filterManager.applyFilter(this, input, output, clearMode);
  }
  /** A sprite where your lightmap is rendered */
  get lightMap() {
    return this._lightMap;
  }
  set lightMap(value) {
    this._lightMap = value;
    this.resources.uMapTexture = value.source;
    this.resources.uMapSampler = value.source.style;
  }
  /**
   * The color value of the ambient color
   * @example [1.0, 1.0, 1.0] = 0xffffff
   * @default 0x000000
   */
  get color() {
    return this._color.value;
  }
  set color(value) {
    this._color.setValue(value);
    const [r, g, b] = this._color.toArray();
    this.uniforms.uColor[0] = r;
    this.uniforms.uColor[1] = g;
    this.uniforms.uColor[2] = b;
  }
  /**
   * Coefficient for alpha multiplication
   * @default 1
   */
  get alpha() {
    return this.uniforms.uAlpha;
  }
  set alpha(value) {
    this.uniforms.uAlpha = value;
  }
};
/** Default values for options. */
__publicField(_SimpleLightmapFilter, "DEFAULT_OPTIONS", {
  lightMap: pixi_js.Texture.WHITE,
  color: 0,
  alpha: 1
});
let SimpleLightmapFilter = _SimpleLightmapFilter;

exports.SimpleLightmapFilter = SimpleLightmapFilter;
//# sourceMappingURL=SimpleLightmapFilter.js.map
