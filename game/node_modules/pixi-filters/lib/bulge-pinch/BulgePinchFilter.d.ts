import { Filter } from 'pixi.js';
import type { FilterSystem, PointData, RenderSurface, Texture } from 'pixi.js';
/** Options for the BulgePinchFilter constructor. */
export interface BulgePinchFilterOptions {
    /**
     * Offset coordinates to change the position of the center of the circle of effect.
     * @default {x:0,y:0}
     */
    center?: PointData | number[] | number;
    /**
     * The radius of the circle of effect
     * @default 100
     */
    radius?: number;
    /**
     * A value between -1 and 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
     * @default 1
     */
    strength?: number;
}
/**
 * Bulges or pinches the image in a circle.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/bulge-pinch.gif)
 *
 * @class
 * @extends Filter
 */
export declare class BulgePinchFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: BulgePinchFilterOptions;
    uniforms: {
        uDimensions: Float32Array;
        uCenter: PointData;
        uRadius: number;
        uStrength: number;
    };
    /**
     * @param options - Options for the BulgePinchFilter constructor.
     */
    constructor(options?: BulgePinchFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * Sets the center of the effect in normalized screen coords.
     * { x: 0, y: 0 } means top-left and { x: 1, y: 1 } mean bottom-right
     * @default {x:0.5,y:0.5}
     */
    get center(): PointData;
    set center(value: PointData | number[] | number);
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
     * The radius of the circle of effect
     * @default 100
     */
    get radius(): number;
    set radius(value: number);
    /**
     * A value between -1 and 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
     * @default 1
     */
    get strength(): number;
    set strength(value: number);
}
