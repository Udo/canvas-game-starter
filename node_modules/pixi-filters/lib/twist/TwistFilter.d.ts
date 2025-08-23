import { Filter, PointData } from 'pixi.js';
/** Options for the TwistFilter constructor. */
export interface TwistFilterOptions {
    /**
     * Padding for the filter area
     * @default 20
     */
    padding?: number;
    /**
     * The radius of the twist
     * @default 200
     */
    radius?: number;
    /**
     * The angle of the twist
     * @default 4
     */
    angle?: number;
    /**
     * The `x` and `y` offset coordinates to change the position of the center of the circle of effect.
     * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
     * once defined in the constructor
     * @default {x:0,y:0}
     */
    offset?: PointData;
}
/**
 * This filter applies a twist effect making display objects appear twisted in the given direction.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/twist.png)
 *
 * @class
 * @extends Filter
 */
export declare class TwistFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: TwistFilterOptions;
    uniforms: {
        uTwist: Float32Array;
        uOffset: PointData;
    };
    /**
     * @param options - Options for the TwistFilter constructor.
     */
    constructor(options?: Partial<TwistFilterOptions>);
    /**
     * The radius of the twist
     * @default 200
     */
    get radius(): number;
    set radius(value: number);
    /**
     * The angle of the twist
     * @default 4
     */
    get angle(): number;
    set angle(value: number);
    /**
     * The `x` offset coordinate to change the position of the center of the circle of effect
     * @default 0
     */
    get offset(): PointData;
    set offset(value: PointData);
    /**
     * The `x` offset coordinate to change the position of the center of the circle of effect
     * @default 0
     */
    get offsetX(): number;
    set offsetX(value: number);
    /**
     * The `y` offset coordinate to change the position of the center of the circle of effect
     * @default 0
     */
    get offsetY(): number;
    set offsetY(value: number);
}
