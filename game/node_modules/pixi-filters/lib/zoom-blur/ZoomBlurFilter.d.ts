import { Filter, PointData } from 'pixi.js';
/** Options for the ZoomBlurFilter constructor. */
export interface ZoomBlurFilterOptions {
    /**
     * Sets the strength of the zoom blur effect
     * @default 0.1
     */
    strength?: number;
    /**
     * The `x` and `y` offset coordinates to change the position of the center of the circle of effect.
     * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
     * once defined in the constructor
     * @default {x:0,y:0}
     */
    center?: PointData | number[];
    /**
     * The inner radius of zoom. The part in inner circle won't apply zoom blur effect
     * @default 0
     */
    innerRadius?: number;
    /**
     * Outer radius of the effect. less than `0` equates to infinity
     * @default -1
     */
    radius?: number;
    /**
     * On older iOS devices, it's better to not go above `13.0`.
     * Decreasing this value will produce a lower-quality blur effect with more dithering
     * @default 32
     */
    maxKernelSize?: number;
}
/**
 * The ZoomFilter applies a Zoom blur to an object.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/zoom-blur.png)
 *
 * @class
 * @extends Filter
 */
export declare class ZoomBlurFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: ZoomBlurFilterOptions;
    uniforms: {
        uStrength: number;
        uCenter: PointData;
        uRadii: Float32Array;
    };
    /**
     * @param options - Options for the ZoomBlurFilter constructor.
     */
    constructor(options?: ZoomBlurFilterOptions);
    /**
     * Sets the strength of the zoom blur effect
     * @default 0.1
     */
    get strength(): number;
    set strength(value: number);
    /**
     * The center of the zoom
     * @default [0,0]
     */
    get center(): PointData;
    set center(value: PointData | number[]);
    /**
     * Sets the center of the effect in normalized screen coords on the `x` axis
     * @default 0
     */
    get centerX(): number;
    set centerX(value: number);
    /**
     * Sets the center of the effect in normalized screen coords on the `y` axis
     * @default 0
     */
    get centerY(): number;
    set centerY(value: number);
    /**
     * The inner radius of zoom. The part in inner circle won't apply zoom blur effect
     * @default 0
     */
    get innerRadius(): number;
    set innerRadius(value: number);
    /**
     * Outer radius of the effect. less than `0` equates to infinity
     * @default -1
     */
    get radius(): number;
    set radius(value: number);
}
