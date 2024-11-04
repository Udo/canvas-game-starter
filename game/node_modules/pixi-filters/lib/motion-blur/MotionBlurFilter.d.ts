import { Filter, ObservablePoint, PointData } from 'pixi.js';
/** Options for the MotionBlurFilter constructor. */
export interface MotionBlurFilterOptions {
    /**
     * Sets the velocity of the motion for blur effect
     * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
     * once defined in the constructor
     * @default {x:0,y:0}
     */
    velocity?: PointData | number[];
    /**
     * The kernelSize of the blur filter. Must be odd number >= 5
     * @default 5
     */
    kernelSize?: number;
    /**
     * The offset of the blur filter
     * @default 0
     */
    offset?: number;
}
/**
 * The MotionBlurFilter applies a Motion blur to an object.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/motion-blur.png)
 *
 * @class
 * @extends Filter
 */
export declare class MotionBlurFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: MotionBlurFilterOptions;
    uniforms: {
        uVelocity: PointData;
        uKernelSize: number;
        uOffset: number;
    };
    private _kernelSize;
    /**
     * @param options - Options for the MotionBlurFilter constructor.
     */
    constructor(options?: MotionBlurFilterOptions);
    /**
     * @deprecated since 8.0.0
     *
     * @param {PIXI.ObservablePoint|PIXI.PointData|number[]} [velocity=[0, 0]] - Sets the velocity of the motion for blur effect.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter. Must be odd number >= 5
     * @param {number} [offset=0] - The offset of the blur filter.
     */
    constructor(velocity?: number[] | PointData | ObservablePoint, kernelSize?: number, offset?: number);
    /**
     * Sets the velocity of the motion for blur effect
     * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
     * once defined in the constructor
     * @default {x:0,y:0}
     */
    get velocity(): PointData;
    set velocity(value: PointData | number[]);
    /**
     * Sets the velocity of the motion for blur effect on the `x` axis
     * @default 0
     */
    get velocityX(): number;
    set velocityX(value: number);
    /**
     * Sets the velocity of the motion for blur effect on the `x` axis
     * @default 0
     */
    get velocityY(): number;
    set velocityY(value: number);
    /**
     * The kernelSize of the blur filter. Must be odd number >= 5
     * @default 5
     */
    get kernelSize(): number;
    set kernelSize(value: number);
    /**
     * The offset of the blur filter
     * @default 0
     */
    get offset(): number;
    set offset(value: number);
    private _updateDirty;
}
