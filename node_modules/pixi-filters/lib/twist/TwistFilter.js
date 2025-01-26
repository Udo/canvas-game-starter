'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');
var _default$1 = require('../defaults/default.js');
var _default = require('../defaults/default2.js');
var twist$1 = require('./twist.js');
var twist = require('./twist2.js');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _TwistFilter = class _TwistFilter extends pixi_js.Filter {
  /**
   * @param options - Options for the TwistFilter constructor.
   */
  constructor(options) {
    options = { ..._TwistFilter.DEFAULT_OPTIONS, ...options };
    const gpuProgram = pixi_js.GpuProgram.from({
      vertex: {
        source: _default["default"],
        entryPoint: "mainVertex"
      },
      fragment: {
        source: twist["default"],
        entryPoint: "mainFragment"
      }
    });
    const glProgram = pixi_js.GlProgram.from({
      vertex: _default$1["default"],
      fragment: twist$1["default"],
      name: "twist-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {
        twistUniforms: {
          uTwist: {
            value: [options.radius ?? 0, options.angle ?? 0],
            type: "vec2<f32>"
          },
          uOffset: {
            value: options.offset,
            type: "vec2<f32>"
          }
        }
      },
      ...options
    });
    __publicField(this, "uniforms");
    this.uniforms = this.resources.twistUniforms.uniforms;
  }
  /**
   * The radius of the twist
   * @default 200
   */
  get radius() {
    return this.uniforms.uTwist[0];
  }
  set radius(value) {
    this.uniforms.uTwist[0] = value;
  }
  /**
   * The angle of the twist
   * @default 4
   */
  get angle() {
    return this.uniforms.uTwist[1];
  }
  set angle(value) {
    this.uniforms.uTwist[1] = value;
  }
  /**
   * The `x` offset coordinate to change the position of the center of the circle of effect
   * @default 0
   */
  get offset() {
    return this.uniforms.uOffset;
  }
  set offset(value) {
    this.uniforms.uOffset = value;
  }
  /**
   * The `x` offset coordinate to change the position of the center of the circle of effect
   * @default 0
   */
  get offsetX() {
    return this.offset.x;
  }
  set offsetX(value) {
    this.offset.x = value;
  }
  /**
   * The `y` offset coordinate to change the position of the center of the circle of effect
   * @default 0
   */
  get offsetY() {
    return this.offset.y;
  }
  set offsetY(value) {
    this.offset.y = value;
  }
};
/** Default values for options. */
__publicField(_TwistFilter, "DEFAULT_OPTIONS", {
  padding: 20,
  radius: 200,
  angle: 4,
  offset: { x: 0, y: 0 }
});
let TwistFilter = _TwistFilter;

exports.TwistFilter = TwistFilter;
//# sourceMappingURL=TwistFilter.js.map
