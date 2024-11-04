import { Filter } from 'pixi.js';
import type { PointData } from 'pixi.js';
/** Options for the RadialBlurFilter constructor. */
export interface RadialBlurFilterOptions {
    /**
     * Sets the angle of the motion for blur effect
     * @default 0
     */
    angle?: number;
    /**
     * The `x` and `y` offset coordinates to change the position of the center of the circle of effect.
     * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
     * once defined in the constructor
     * @default {x:0,y:0}
     */
    center?: PointData | number[];
    /**
     * The kernelSize of the blur filter. Must be odd number >= 3
     * @default 5
     */
    kernelSize?: number;
    /**
     * The maximum size of the blur radius, less than `0` equates to infinity
     * @default -1
     */
    radius?: number;
}
/**
 * The RadialBlurFilter applies a Motion blur to an object.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/radial-blur.png)
 *
 * @class
 * @extends Filter
 */
export declare class RadialBlurFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: RadialBlurFilterOptions;
    uniforms: {
        uRadian: number;
        uCenter: PointData;
        uKernelSize: number;
        uRadius: number;
    };
    private _angle;
    private _kernelSize;
    /**
     * @param options - Options for the RadialBlurFilter constructor.
     */
    constructor(options?: RadialBlurFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number} [angle=0] - Sets the angle of the motion for blur effect.
     * @param {PIXI.Point|number[]} [center=[0,0]] - The center of the radial.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter. Must be odd number >= 3
     * @param {number} [radius=-1] - The maximum size of the blur radius, `-1` is infinite
     */
    constructor(angle?: number, center?: PointData | number[], kernelSize?: number, radius?: number);
    private _updateKernelSize;
    /**
     * Sets the angle in degrees of the motion for blur effect.
     * @default 0
     */
    get angle(): number;
    set angle(value: number);
    /**
     * The `x` and `y` offset coordinates to change the position of the center of the circle of effect.
     * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
     * once defined in the constructor
     * @default {x:0,y:0}
     */
    get center(): PointData;
    set center(value: PointData | number[]);
    /**
     * Sets the velocity of the motion for blur effect on the `x` axis
     * @default 0
     */
    get centerX(): number;
    set centerX(value: number);
    /**
     * Sets the velocity of the motion for blur effect on the `x` axis
     * @default 0
     */
    get centerY(): number;
    set centerY(value: number);
    /**
     * The kernelSize of the blur filter. Must be odd number >= 3
     * @default 5
     */
    get kernelSize(): number;
    set kernelSize(value: number);
    /**
     * The maximum size of the blur radius, less than `0` equates to infinity
     * @default -1
     */
    get radius(): number;
    set radius(value: number);
}
