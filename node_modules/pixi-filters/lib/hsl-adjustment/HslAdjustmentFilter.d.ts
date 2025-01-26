import { Filter } from 'pixi.js';
/**
 * Options for the HslAdjustmentFilter constructor.
 */
export interface HslAdjustmentFilterOptions {
    /**
     * The amount of hue in degrees (-180 to 180)
     * @default 0
     */
    hue: number;
    /**
     * The amount of color saturation (-1 to 1)
     * @default 0
     */
    saturation: number;
    /**
     * The amount of lightness (-1 to 1)
     * @default 0
     */
    lightness: number;
    /**
     * Whether to colorize the image
     * @default false
     */
    colorize: boolean;
    /**
     * The amount of alpha (0 to 1)
     * @default 1
     */
    alpha: number;
}
/**
 * ![original](../screenshots/original.png)![filter](../screenshots/hsl-adjustment.png)
 *
 * This WebGPU filter has been ported from the WebGL renderer that was originally created by Viktor Persson (@vikpe)
 *
 * @class
 * @extends Filter
 */
export declare class HslAdjustmentFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: HslAdjustmentFilterOptions;
    uniforms: {
        uHsl: Float32Array;
        uColorize: number;
        uAlpha: number;
    };
    private _hue;
    /**
     * @param options - Options for the HslAdjustmentFilter constructor.
     */
    constructor(options?: HslAdjustmentFilterOptions);
    /**
     * The amount of hue in degrees (-180 to 180)
     * @default 0
     */
    get hue(): number;
    set hue(value: number);
    /**
     * The amount of lightness (-1 to 1)
     * @default 0
     */
    get saturation(): number;
    set saturation(value: number);
    /**
     * The amount of lightness (-1 to 1)
     * @default 0
     */
    get lightness(): number;
    set lightness(value: number);
    /**
     * Whether to colorize the image
     * @default false
     */
    get colorize(): boolean;
    set colorize(value: boolean);
    /**
     * The amount of alpha (0 to 1)
     * @default 1
     */
    get alpha(): number;
    set alpha(value: number);
}
