'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _BloomFilter = class _BloomFilter extends pixi_js.AlphaFilter {
  /** @ignore */
  constructor(...args) {
    let options = args[0] ?? {};
    if (typeof options === "number" || Array.isArray(options) || "x" in options && "y" in options) {
      pixi_js.deprecation("6.0.0", "BloomFilter constructor params are now options object. See params: { strength, quality, resolution, kernelSize }");
      let strength = options;
      if (Array.isArray(strength))
        strength = { x: strength[0], y: strength[1] };
      options = { strength };
      if (args[1] !== void 0)
        options.quality = args[1];
      if (args[2] !== void 0)
        options.resolution = args[2];
      if (args[3] !== void 0)
        options.kernelSize = args[3];
    }
    options = { ..._BloomFilter.DEFAULT_OPTIONS, ...options };
    super();
    __publicField(this, "_blurXFilter");
    __publicField(this, "_blurYFilter");
    __publicField(this, "_strength");
    this._strength = { x: 2, y: 2 };
    if (options.strength) {
      if (typeof options.strength === "number") {
        this._strength.x = options.strength;
        this._strength.y = options.strength;
      } else {
        this._strength.x = options.strength.x;
        this._strength.y = options.strength.y;
      }
    }
    this._blurXFilter = new pixi_js.BlurFilterPass({
      ...options,
      horizontal: true,
      strength: this.strengthX
    });
    this._blurYFilter = new pixi_js.BlurFilterPass({
      ...options,
      horizontal: false,
      strength: this.strengthY
    });
    this._blurYFilter.blendMode = "screen";
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clear) {
    const renderTarget = pixi_js.TexturePool.getSameSizeTexture(input);
    filterManager.applyFilter(this, input, output, clear);
    this._blurXFilter.apply(filterManager, input, renderTarget, true);
    this._blurYFilter.apply(filterManager, renderTarget, output, false);
    pixi_js.TexturePool.returnTexture(renderTarget);
  }
  /**
   * Sets the strength of both the blurX and blurY properties simultaneously
   * @default 2
   */
  get strength() {
    return this._strength;
  }
  set strength(value) {
    this._strength = typeof value === "number" ? { x: value, y: value } : value;
    this._updateStrength();
  }
  /**
   * Sets the strength of the blur on the `x` axis
   * @default 2
   */
  get strengthX() {
    return this.strength.x;
  }
  set strengthX(value) {
    this.strength.x = value;
    this._updateStrength();
  }
  /**
   * Sets the strength of the blur on the `y` axis
   * @default 2
   */
  get strengthY() {
    return this.strength.y;
  }
  set strengthY(value) {
    this.strength.y = value;
    this._updateStrength();
  }
  _updateStrength() {
    this._blurXFilter.blur = this.strengthX;
    this._blurYFilter.blur = this.strengthY;
  }
  /**
   * @deprecated since 6.0.0
   *
   * The strength of both the blurX and blurY properties simultaneously
   * @default 2
   * @see BloomFilter#strength
   */
  get blur() {
    pixi_js.deprecation("6.0.0", "BloomFilter.blur is deprecated, please use BloomFilter.strength instead");
    return this.strengthX;
  }
  set blur(value) {
    pixi_js.deprecation("6.0.0", "BloomFilter.blur is deprecated, please use BloomFilter.strength instead");
    this.strength = value;
  }
  /**
   * @deprecated since 6.0.0
   *
   * The strength of the blurX property
   * @default 2
   * @see BloomFilter#strengthX
   */
  get blurX() {
    pixi_js.deprecation("6.0.0", "BloomFilter.blurX is deprecated, please use BloomFilter.strengthX instead");
    return this.strengthX;
  }
  set blurX(value) {
    pixi_js.deprecation("6.0.0", "BloomFilter.blurX is deprecated, please use BloomFilter.strengthX instead");
    this.strengthX = value;
  }
  /**
   * @deprecated since 6.0.0
   *
   * The strength of the blurY property
   * @default 2
   * @see BloomFilter#strengthY
   */
  get blurY() {
    pixi_js.deprecation("6.0.0", "BloomFilter.blurY is deprecated, please use BloomFilter.strengthY instead");
    return this.strengthY;
  }
  set blurY(value) {
    pixi_js.deprecation("6.0.0", "BloomFilter.blurY is deprecated, please use BloomFilter.strengthY instead");
    this.strengthY = value;
  }
};
/** Default values for options. */
__publicField(_BloomFilter, "DEFAULT_OPTIONS", {
  strength: { x: 2, y: 2 },
  quality: 4,
  resolution: 1,
  kernelSize: 5
});
let BloomFilter = _BloomFilter;

exports.BloomFilter = BloomFilter;
//# sourceMappingURL=BloomFilter.js.map
