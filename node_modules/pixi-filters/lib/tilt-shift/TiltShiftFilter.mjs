import { TexturePool } from 'pixi.js';
import { TiltShiftAxisFilter } from './TiltShiftAxisFilter.mjs';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class TiltShiftFilter extends TiltShiftAxisFilter {
  /**
   * @param options - Options for the TiltShiftFilter constructor.
   */
  constructor(options) {
    options = { ...TiltShiftAxisFilter.DEFAULT_OPTIONS, ...options };
    super({ ...options, axis: "horizontal" });
    __publicField(this, "_tiltShiftYFilter");
    this._tiltShiftYFilter = new TiltShiftAxisFilter({ ...options, axis: "vertical" });
    this.updateDelta();
    Object.assign(this, options);
  }
  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  apply(filterManager, input, output, clearMode) {
    const renderTarget = TexturePool.getSameSizeTexture(input);
    filterManager.applyFilter(this, input, renderTarget, true);
    filterManager.applyFilter(this._tiltShiftYFilter, renderTarget, output, clearMode);
    TexturePool.returnTexture(renderTarget);
  }
  /** @ignore */
  updateDelta() {
    super.updateDelta();
    this._tiltShiftYFilter.updateDelta();
  }
  /** The strength of the blur. */
  get blur() {
    return this.uniforms.uBlur[0];
  }
  set blur(value) {
    this.uniforms.uBlur[0] = this._tiltShiftYFilter.uniforms.uBlur[0] = value;
  }
  /** The strength of the gradient blur. */
  get gradientBlur() {
    return this.uniforms.uBlur[1];
  }
  set gradientBlur(value) {
    this.uniforms.uBlur[1] = this._tiltShiftYFilter.uniforms.uBlur[1] = value;
  }
  /** The position to start the effect at. */
  get start() {
    return this.uniforms.uStart;
  }
  set start(value) {
    this.uniforms.uStart = this._tiltShiftYFilter.uniforms.uStart = value;
    this.updateDelta();
  }
  /** The position to start the effect at on the `x` axis. */
  get startX() {
    return this.start.x;
  }
  set startX(value) {
    this.start.x = value;
    this.updateDelta();
  }
  /** The position to start the effect at on the `x` axis. */
  get startY() {
    return this.start.y;
  }
  set startY(value) {
    this.start.y = value;
    this.updateDelta();
  }
  /** The position to end the effect at. */
  get end() {
    return this.uniforms.uEnd;
  }
  set end(value) {
    this.uniforms.uEnd = this._tiltShiftYFilter.uniforms.uEnd = value;
    this.updateDelta();
  }
  /** The position to end the effect at on the `x` axis. */
  get endX() {
    return this.end.x;
  }
  set endX(value) {
    this.end.x = value;
    this.updateDelta();
  }
  /** The position to end the effect at on the `y` axis. */
  get endY() {
    return this.end.y;
  }
  set endY(value) {
    this.end.y = value;
    this.updateDelta();
  }
}

export { TiltShiftFilter };
//# sourceMappingURL=TiltShiftFilter.mjs.map
