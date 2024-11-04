import { Filter } from 'pixi.js';
/** Options for the DotFilter constructor. */
export interface DotFilterOptions {
    /**
     * The scale of the effect
     * @default 1
     */
    scale?: number;
    /**
     * The angle of the effect
     * @default 5
     */
    angle?: number;
    /**
     * Whether to rendering it in gray scale
     * @default true
     */
    grayscale?: boolean;
}
/**
 * This filter applies a dotscreen effect making display objects appear to be made out of
 * black and white halftone dots like an old printer.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/dot.png)
 *
 * {@link https://github.com/evanw/glfx.js/blob/master/src/filters/fun/dotscreen.js Original filter}
 *
 * @class
 * @extends Filter
 */
export declare class DotFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: DotFilterOptions;
    /**
     * @param options - Options for the DotFilter constructor.
     */
    constructor(options?: DotFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number} [scale=1] - The scale of the effect.
     * @param {number} [angle=5] - The radius of the effect.
     * @param {boolean} [grayscale=true] - Render as grayscale.
     */
    constructor(scale?: number, angle?: number, grayscale?: boolean);
    /**
     * The scale of the effect.
     * @default 1
     */
    get scale(): number;
    set scale(value: number);
    /**
    * The radius of the effect.
    * @default 5
    */
    get angle(): number;
    set angle(value: number);
    /**
    * Whether to rendering it in gray scale.
    * @default true
    */
    get grayscale(): boolean;
    set grayscale(value: boolean);
}
