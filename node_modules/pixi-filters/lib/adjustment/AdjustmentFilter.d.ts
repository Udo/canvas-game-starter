import { Filter } from 'pixi.js';
/** Options for the AdjustmentFilter constructor */
export interface AdjustmentFilterOptions {
    /**
     * The amount of luminance
     * @default 1
     */
    gamma?: number;
    /**
     * The amount of contrast
     * @default 1
     */
    contrast?: number;
    /**
     * The amount of color saturation
     * @default 1
     */
    saturation?: number;
    /**
     * The overall brightness
     * @default 1
     */
    brightness?: number;
    /**
     * The multiplied red channel
     * @default 1
     */
    red?: number;
    /**
     * The multiplied green channel
     * @default 1
     */
    green?: number;
    /**
     * The multiplied blue channel
     * @default 1
     */
    blue?: number;
    /**
     * The overall alpha channel
     * @default 1
     */
    alpha?: number;
}
/**
 * The ability to adjust gamma, contrast, saturation, brightness, alpha or color-channel shift.
 * This is a faster and much simpler to use than
 * {@link http://pixijs.download/release/docs/ColorMatrixFilter.html ColorMatrixFilter}
 * because it does not use a matrix.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/adjustment.png)
 *
 * @class
 * @extends Filter
 */
export declare class AdjustmentFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: AdjustmentFilterOptions;
    uniforms: {
        uGamma: number;
        uContrast: number;
        uSaturation: number;
        uBrightness: number;
        uColor: Float32Array;
    };
    /**
     * @param options - The options of the adjustment filter.
     */
    constructor(options?: AdjustmentFilterOptions);
    /**
     * Amount of luminance
     * @default 1
     */
    get gamma(): number;
    set gamma(value: number);
    /**
     * Amount of contrast
     * @default 1
     */
    get contrast(): number;
    set contrast(value: number);
    /**
     * Amount of color saturation
     * @default 1
     */
    get saturation(): number;
    set saturation(value: number);
    /**
     * The overall brightness
     * @default 1
     */
    get brightness(): number;
    set brightness(value: number);
    /**
     * The multiplied red channel
     * @default 1
     */
    get red(): number;
    set red(value: number);
    /**
     * The multiplied blue channel
     * @default 1
     */
    get green(): number;
    set green(value: number);
    /**
     * The multiplied green channel
     * @default 1
     */
    get blue(): number;
    set blue(value: number);
    /**
     * The overall alpha channel
     * @default 1
     */
    get alpha(): number;
    set alpha(value: number);
}
