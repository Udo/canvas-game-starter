import { Filter, FilterSystem, PointData, RenderSurface, Texture } from 'pixi.js';
/** Options for the AdvancedBloomFilter constructor. */
export interface AdvancedBloomFilterOptions {
    /**
     * Defines how bright a color needs to be to affect bloom.
     * @default 1
     */
    threshold?: number;
    /**
     * To adjust the strength of the bloom. Higher values is more intense brightness.
     * @default 1
     */
    bloomScale?: number;
    /**
     * The brightness, lower value is more subtle brightness, higher value is blown-out.
     * @default 1
     */
    brightness?: number;
    /** The strength of the Blur properties simultaneously */
    blur?: number;
    /**
     * The kernel size of the blur filter.
     */
    kernels?: number[];
    /** The quality of the Blur filter. */
    quality?: number;
    /**
     * The pixel size of the blur filter. Large size is blurrier. For advanced usage.
     * @default {x:1,y:1}
     */
    pixelSize?: PointData | number[] | number;
}
/**
 * The AdvancedBloomFilter applies a Bloom Effect to an object. Unlike the normal BloomFilter
 * this had some advanced controls for adjusting the look of the bloom. Note: this filter
 * is slower than normal BloomFilter.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/advanced-bloom.png)
 *
 * @class
 * @extends Filter
 */
export declare class AdvancedBloomFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: AdvancedBloomFilterOptions;
    uniforms: {
        uBloomScale: number;
        uBrightness: number;
    };
    /** To adjust the strength of the bloom. Higher values is more intense brightness. */
    bloomScale: number;
    /** The brightness, lower value is more subtle brightness, higher value is blown-out. */
    brightness: number;
    private _extractFilter;
    private _blurFilter;
    /**
     * @param options - Options for the AdvancedBloomFilter constructor.
     */
    constructor(options?: AdvancedBloomFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * Defines how bright a color needs to be extracted.
     * @default 0.5
     */
    get threshold(): number;
    set threshold(value: number);
    /** The kernels of the Blur Filter */
    get kernels(): number[];
    set kernels(value: number[]);
    /**
     * The strength of the Blur properties simultaneously
     * @default 2
     */
    get blur(): number;
    set blur(value: number);
    /**
     * The quality of the Blur Filter
     * @default 4
     */
    get quality(): number;
    set quality(value: number);
    /**
     * The pixel size of the Kawase Blur filter
     * @default {x:1,y:1}
     */
    get pixelSize(): PointData;
    set pixelSize(value: PointData | number[] | number);
    /**
     * The horizontal pixelSize of the Kawase Blur filter
     * @default 1
     */
    get pixelSizeX(): number;
    set pixelSizeX(value: number);
    /**
     * The vertical pixel size of the Kawase Blur filter
     * @default 1
     */
    get pixelSizeY(): number;
    set pixelSizeY(value: number);
}
