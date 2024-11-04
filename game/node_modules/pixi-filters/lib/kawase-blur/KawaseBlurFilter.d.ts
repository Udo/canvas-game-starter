import { Filter } from 'pixi.js';
import type { FilterSystem, PointData, RenderSurface, Texture } from 'pixi.js';
/** Options for the KawaseBlurFilter constructor. */
export interface KawaseBlurFilterOptions {
    /**
     * The blur of the filter. Should be greater than `0`.
     * If value is an Array, setting kernels.
     * @default 4
     */
    strength?: number | [number, number];
    /**
     * The quality of the filter. Should be an integer greater than `1`
     * @default 3
     */
    quality?: number;
    /**
     * Clamp edges, useful for removing dark edges from fullscreen filters or bleeding to the edge of filterArea.
     * @default false
     */
    clamp?: boolean;
    /**
     * Sets the pixel size of the filter. Large size is blurrier. For advanced usage.
     * @default {x:1,y:1}
     */
    pixelSize?: PointData | number[] | number;
}
/**
 * A much faster blur than Gaussian blur, but more complicated to use.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/kawase-blur.png)
 *
 * @see https://software.intel.com/en-us/blogs/2014/07/15/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms
 * @class
 * @extends Filter
 */
export declare class KawaseBlurFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: KawaseBlurFilterOptions;
    uniforms: {
        uOffset: Float32Array;
    };
    private _pixelSize;
    private _clamp;
    private _kernels;
    private _blur;
    private _quality;
    /**
     * @param options - Options for the KawaseBlurFilter constructor.
     */
    constructor(options?: KawaseBlurFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number|number[]} [blur=4] - The blur of the filter. Should be greater than `0`. If
     *        value is an Array, setting kernels.
     * @param {number} [quality=3] - The quality of the filter. Should be an integer greater than `1`.
     * @param {boolean} [clamp=false] - Clamp edges, useful for removing dark edges
     *        from fullscreen filters or bleeding to the edge of filterArea.
     */
    constructor(blur?: number | number[], quality?: number, clamp?: boolean);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
      * The amount of blur, value greater than `0`.
      * @default 4
      */
    get strength(): number;
    set strength(value: number);
    /**
      * The quality of the filter, integer greater than `1`.
      * @default 3
      */
    get quality(): number;
    set quality(value: number);
    /**
      * The kernel size of the blur filter, for advanced usage
      * @default [0]
      */
    get kernels(): number[];
    set kernels(value: number[]);
    /**
      * The size of the pixels. Large size is blurrier. For advanced usage.
      * @default {x:1,y:1}
      */
    get pixelSize(): PointData;
    set pixelSize(value: PointData | number[] | number);
    /**
      * The size of the pixels on the `x` axis. Large size is blurrier. For advanced usage.
      * @default 1
      */
    get pixelSizeX(): number;
    set pixelSizeX(value: number);
    /**
      * The size of the pixels on the `y` axis. Large size is blurrier. For advanced usage.
      * @default 1
      */
    get pixelSizeY(): number;
    set pixelSizeY(value: number);
    /**
      * Get the if the filter is clamped
      * @default false
      */
    get clamp(): boolean;
    /** Update padding based on kernel data */
    private _updatePadding;
    /** Auto generate kernels by blur & quality */
    private _generateKernels;
}
