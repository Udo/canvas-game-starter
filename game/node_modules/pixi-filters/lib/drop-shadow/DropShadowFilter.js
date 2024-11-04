'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default2.js');
var _default = require('../defaults/default.js');
var KawaseBlurFilter = require('../kawase-blur/KawaseBlurFilter.js');
var dropShadow$1 = require('./drop-shadow.js');
var dropShadow = require('./drop-shadow2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _DropShadowFilter = class _DropShadowFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the DropShadowFilter constructor.
   */
  constructor(options) {
    options = { ..._DropShadowFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: dropShadow["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: dropShadow$1["default"],
      name: "drop-shadow-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        dropShadowUniforms: {
          uAlpha: { value: options.alpha, type: "f32" },
          uColor: { value: new Float32Array(3), type: "vec3<f32>" },
          uOffset: { value: options.offset, type: "vec2<f32>" }
        }
      },
      resolution: options.resolution
    });
    __publicField(this, "uniforms");
    /**
     * Hide the contents, only show the shadow.
     * @default false
     */
    __publicField(this, "shadowOnly", false);
    __publicField(this, "_color");
    __publicField(this, "_blurFilter");
    __publicField(this, "_basePass");
    this.uniforms = this.resources.dropShadowUniforms.uniforms;
    this._color = new pixi_js.Color();
    this.color = options.color ?? 0;
    this._blurFilter = new KawaseBlurFilter.KawaseBlurFilter({
      strength: options.kernels ?? options.blur,
      quality: options.kernels ? void 0 : options.quality
    });
    this._basePass = new pixi_js.Filter({
      gpuProgram: pixi_js.GpuProgram.from({
        vertex: {
          source: _default["default"],
          entryPoint: "mainVertex"
        },
        fragment: {
          source: `
                    @group(0) @binding(1) var uTexture: texture_2d<f32>; 
                    @group(0) @binding(2) var uSampler: sampler;
                    @fragment
                    fn mainFragment(
                        @builtin(position) position: vec4<f32>,
                        @location(0) uv : vec2<f32>
                    ) -> @location(0) vec4<f32> {
                        return textureSample(uTexture, uSampler, uv);
                    }
                    `,
          entryPoint: "mainFragment"
        }
      }),
      glProgram: pixi_js.GlProgram.from({
        vertex: _default$1["default"],
        fragment: `
                in vec2 vTextureCoord;
                out vec4 finalColor;
                uniform sampler2D uTexture;

                void main(void){
                    finalColor = texture(uTexture, vTextureCoord);
                }
                `,
        name: "drop-shadow-filter"
      }),
      resources: {}
    });
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    const renderTarget = pixi_js.TexturePool.getSameSizeTexture(input);
    filterManager.applyFilter(this, input, renderTarget, true);
    this._blurFilter.apply(filterManager, renderTarget, output, clearMode);
    if (!this.shadowOnly) {
      filterManager.applyFilter(this._basePass, input, output, false);
    }
    pixi_js.TexturePool.returnTexture(renderTarget);
  }
  /**
   * Set the offset position of the drop-shadow relative to the original image.
   * @default [4,4]
   */
  get offset() {
    return this.uniforms.uOffset;
  }
  set offset(value) {
    this.uniforms.uOffset = value;
    this._updatePadding();
  }
  /**
   * Set the offset position of the drop-shadow relative to the original image on the `x` axis
   * @default 4
   */
  get offsetX() {
    return this.offset.x;
  }
  set offsetX(value) {
    this.offset.x = value;
    this._updatePadding();
  }
  /**
   * Set the offset position of the drop-shadow relative to the original image on the `y` axis
   * @default 4
   */
  get offsetY() {
    return this.offset.y;
  }
  set offsetY(value) {
    this.offset.y = value;
    this._updatePadding();
  }
  /**
   * The color value of shadow.
   * @example [0.0, 0.0, 0.0] = 0x000000
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
  /**
   * The strength of the shadow's blur.
   * @default 2
   */
  get blur() {
    return this._blurFilter.strength;
  }
  set blur(value) {
    this._blurFilter.strength = value;
    this._updatePadding();
  }
  /**
   * Sets the quality of the Blur Filter
   * @default 4
   */
  get quality() {
    return this._blurFilter.quality;
  }
  set quality(value) {
    this._blurFilter.quality = value;
    this._updatePadding();
  }
  /** Sets the kernels of the Blur Filter */
  get kernels() {
    return this._blurFilter.kernels;
  }
  set kernels(value) {
    this._blurFilter.kernels = value;
  }
  /**
   * Sets the pixelSize of the Kawase Blur filter
   * @default [1,1]
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
   * Sets the pixelSize of the Kawase Blur filter on the `x` axis
   * @default 1
   */
  get pixelSizeX() {
    return this._blurFilter.pixelSizeX;
  }
  set pixelSizeX(value) {
    this._blurFilter.pixelSizeX = value;
  }
  /**
   * Sets the pixelSize of the Kawase Blur filter on the `y` axis
   * @default 1
   */
  get pixelSizeY() {
    return this._blurFilter.pixelSizeY;
  }
  set pixelSizeY(value) {
    this._blurFilter.pixelSizeY = value;
  }
  /**
   * Recalculate the proper padding amount.
   * @private
   */
  _updatePadding() {
    const offsetPadding = Math.max(
      Math.abs(this.offsetX),
      Math.abs(this.offsetY)
    );
    this.padding = offsetPadding + this.blur * 2 + this.quality * 4;
  }
};
/** Default values for options. */
__publicField(_DropShadowFilter, "DEFAULT_OPTIONS", {
  offset: { x: 4, y: 4 },
  color: 0,
  alpha: 0.5,
  shadowOnly: false,
  kernels: void 0,
  blur: 2,
  quality: 3,
  pixelSize: { x: 1, y: 1 },
  resolution: 1
});
let DropShadowFilter = _DropShadowFilter;

exports.DropShadowFilter = DropShadowFilter;
//# sourceMappingURL=DropShadowFilter.js.map
