import { Filter } from 'pixi.js';
import type { FilterSystem, PointData, RenderSurface, Texture } from 'pixi.js';
/** Options for the GodrayFilter constructor. */
export interface GodrayFilterOptions {
    /**
     * The angle/light-source of the rays in degrees. For instance,
     * a value of 0 is vertical rays, values of 90 or -90 produce horizontal rays.
     * @default 30
     */
    angle?: number;
    /**
     * `true` if light rays are parallel (uses angle), `false` to use the focal `center` point
     * @default true
     */
    parallel?: boolean;
    /**
     * Focal point for non-parallel rays, to use this `parallel` must be set to `false`.
     * This should be a size 2 array or an object containing `x` and `y` values, you cannot change types
     * once defined in the constructor
     * @default {x:0,y:0}
     */
    center?: PointData | number[];
    /**
     * General intensity of the effect. A value closer to 1 will produce a more intense effect,
     * where a value closer to 0 will produce a subtler effect.
     * @default 0.5
     */
    gain?: number;
    /**
     * The density of the fractal noise
     * @default 2.5
     */
    lacunarity?: number;
    /**
     * The current time position
     * @default 0
     */
    time?: number;
    /**
     * The alpha (opacity) of the rays.  0 is fully transparent, 1 is fully opaque.
     * @default 1
     */
    alpha?: number;
}
/**
 * GordayFilter, {@link https://codepen.io/alaingalvan originally} by Alain Galvan
 *
 *
 *
 * ![original](../screenshots/original.png)![filter](../screenshots/godray.gif)
 * @class
 * @extends Filter
 *
 * @example
 *  displayObject.filters = [new GodrayFilter()];
 */
export declare class GodrayFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: GodrayFilterOptions;
    uniforms: {
        uLight: Float32Array;
        uParallel: number;
        uAspect: number;
        uTime: number;
        uRay: Float32Array;
        uDimensions: Float32Array;
    };
    /**
     * The current time position
     * @default 0
     */
    time: number;
    private _angleLight;
    private _angle;
    private _center;
    /**
     * @param options - Options for the GodrayFilter constructor.
     */
    constructor(options?: GodrayFilterOptions);
    /**
     * Override existing apply method in Filter
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * The angle/light-source of the rays in degrees. For instance,
     * a value of 0 is vertical rays, values of 90 or -90 produce horizontal rays
     * @default 30
     */
    get angle(): number;
    set angle(value: number);
    /**
     * `true` if light rays are parallel (uses angle), `false` to use the focal `center` point
     * @default true
     */
    get parallel(): boolean;
    set parallel(value: boolean);
    /**
     * Focal point for non-parallel rays, to use this `parallel` must be set to `false`.
     * @default {x:0,y:0}
     */
    get center(): PointData;
    set center(value: PointData | number[]);
    /**
     * Focal point for non-parallel rays on the `x` axis, to use this `parallel` must be set to `false`.
     * @default 0
     */
    get centerX(): number;
    set centerX(value: number);
    /**
     * Focal point for non-parallel rays on the `y` axis, to use this `parallel` must be set to `false`.
     * @default 0
     */
    get centerY(): number;
    set centerY(value: number);
    /**
     * General intensity of the effect. A value closer to 1 will produce a more intense effect,
     * where a value closer to 0 will produce a subtler effect
     * @default 0.5
     */
    get gain(): number;
    set gain(value: number);
    /**
     * The density of the fractal noise.
     * A higher amount produces more rays and a smaller amount produces fewer waves
     * @default 2.5
     */
    get lacunarity(): number;
    set lacunarity(value: number);
    /**
     * The alpha (opacity) of the rays.  0 is fully transparent, 1 is fully opaque.
     * @default 1
     */
    get alpha(): number;
    set alpha(value: number);
}
