import { AlphaFilter, FilterSystem, PointData, RenderSurface, Texture } from 'pixi.js';
type DeprecatedBlurValue = number | PointData | number[];
/** Options for the BloomFilter constructor. */
export interface BloomFilterOptions {
    /**
     * Sets the strength of the blur. If only a number is provided, it will assign to both x and y.
     * @default {x:2,y:2}
     */
    strength?: PointData | number;
    /**
     * The quality of the blur.
     * @default 4
     */
    quality?: number;
    /**
     * The resolution of the blurX & blurY filter.
     * @default 1
     */
    resolution?: number;
    /**
     * The kernel size of the blur filter. Must be an odd number between 5 and 15 (inclusive).
     * @default 5
     */
    kernelSize?: number;
}
/**
 * The BloomFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/bloom.png)
 *
 * @class
 * @extends Filter
 */
export declare class BloomFilter extends AlphaFilter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: BloomFilterOptions;
    private _blurXFilter;
    private _blurYFilter;
    private _strength;
    /**
     * @param {BloomFilterOptions} options - Options for the BloomFilter constructor.
     */
    constructor(options?: BloomFilterOptions);
    /**
    * @deprecated since 6.0.0
    *
    * @param {number|PIXI.PointData|number[]} [blur=2] - Sets the strength of both the blurX and blurY properties simultaneously
    * @param {number} [quality=4] - The quality of the blurX & blurY filter.
    * @param {number} [resolution=1] - The resolution of the blurX & blurY filter.
    * @param {number} [kernelSize=5] - The kernelSize of the blurX & blurY filter.Options: 5, 7, 9, 11, 13, 15.
    */
    constructor(blur?: DeprecatedBlurValue, quality?: number, resolution?: number, kernelSize?: number);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clear: boolean): void;
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     * @default 2
     */
    get strength(): PointData;
    set strength(value: PointData | number);
    /**
     * Sets the strength of the blur on the `x` axis
     * @default 2
     */
    get strengthX(): number;
    set strengthX(value: number);
    /**
     * Sets the strength of the blur on the `y` axis
     * @default 2
     */
    get strengthY(): number;
    set strengthY(value: number);
    private _updateStrength;
    /**
     * @deprecated since 6.0.0
     *
     * The strength of both the blurX and blurY properties simultaneously
     * @default 2
     * @see BloomFilter#strength
     */
    get blur(): number;
    set blur(value: number);
    /**
     * @deprecated since 6.0.0
     *
     * The strength of the blurX property
     * @default 2
     * @see BloomFilter#strengthX
     */
    get blurX(): number;
    set blurX(value: number);
    /**
     * @deprecated since 6.0.0
     *
     * The strength of the blurY property
     * @default 2
     * @see BloomFilter#strengthY
     */
    get blurY(): number;
    set blurY(value: number);
}
export {};
