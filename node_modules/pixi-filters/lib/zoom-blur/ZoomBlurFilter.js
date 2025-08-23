'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var zoomBlur$1 = require('./zoom-blur.js');
var zoomBlur = require('./zoom-blur2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _ZoomBlurFilter = class _ZoomBlurFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the ZoomBlurFilter constructor.
   */
  constructor(options) {
    options = { ..._ZoomBlurFilter.DEFAULT_OPTIONS, ...options };
    const kernelSize = options.maxKernelSize ?? 32;
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: zoomBlur["default"].replace("${MAX_KERNEL_SIZE}", kernelSize.toFixed(1)),
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: zoomBlur$1["default"].replace("${MAX_KERNEL_SIZE}", kernelSize.toFixed(1)),
      name: "zoom-blur-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        zoomBlurUniforms: {
          uStrength: { value: options.strength, type: "f32" },
          uCenter: { value: options.center, type: "vec2<f32>" },
          uRadii: { value: new Float32Array(2), type: "vec2<f32>" }
        }
      }
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.zoomBlurUniforms.uniforms;
    Object.assign(this, options);
  }
  /**
   * Sets the strength of the zoom blur effect
   * @default 0.1
   */
  get strength() {
    return this.uniforms.uStrength;
  }
  set strength(value) {
    this.uniforms.uStrength = value;
  }
  /**
   * The center of the zoom
   * @default [0,0]
   */
  get center() {
    return this.uniforms.uCenter;
  }
  set center(value) {
    if (Array.isArray(value)) {
      value = { x: value[0], y: value[1] };
    }
    this.uniforms.uCenter = value;
  }
  /**
   * Sets the center of the effect in normalized screen coords on the `x` axis
   * @default 0
   */
  get centerX() {
    return this.uniforms.uCenter.x;
  }
  set centerX(value) {
    this.uniforms.uCenter.x = value;
  }
  /**
   * Sets the center of the effect in normalized screen coords on the `y` axis
   * @default 0
   */
  get centerY() {
    return this.uniforms.uCenter.y;
  }
  set centerY(value) {
    this.uniforms.uCenter.y = value;
  }
  /**
   * The inner radius of zoom. The part in inner circle won't apply zoom blur effect
   * @default 0
   */
  get innerRadius() {
    return this.uniforms.uRadii[0];
  }
  set innerRadius(value) {
    this.uniforms.uRadii[0] = value;
  }
  /**
   * Outer radius of the effect. less than `0` equates to infinity
   * @default -1
   */
  get radius() {
    return this.uniforms.uRadii[1];
  }
  set radius(value) {
    this.uniforms.uRadii[1] = value < 0 || value === Infinity ? -1 : value;
  }
};
/** Default values for options. */
__publicField(_ZoomBlurFilter, "DEFAULT_OPTIONS", {
  strength: 0.1,
  center: { x: 0, y: 0 },
  innerRadius: 0,
  radius: -1,
  maxKernelSize: 32
});
let ZoomBlurFilter = _ZoomBlurFilter;

exports.ZoomBlurFilter = ZoomBlurFilter;
//# sourceMappingURL=ZoomBlurFilter.js.map
