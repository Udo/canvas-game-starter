import { ColorSource, Filter } from 'pixi.js';
type DeprecatedColor = number | number[] | Float32Array;
/** Options for the ColorOverlayFilter constructor. */
export interface ColorOverlayFilterOptions {
    /**
     * The color of the overlay
     * @default 0x000000
     */
    color?: ColorSource;
    /**
     * The alpha of the overlay
     * @default 1
     */
    alpha?: number;
}
/**
 * Overlay a source graphic with a color.<br>
 *
 * @class
 * @extends Filter
 */
export declare class ColorOverlayFilter extends Filter {
    /** Default shockwave filter options */
    static readonly DEFAULT_OPTIONS: ColorOverlayFilterOptions;
    uniforms: {
        uColor: Float32Array;
        uAlpha: number;
    };
    private _color;
    /**
     * @param options - Options for the ColorOverlayFilter constructor.
     */
    constructor(options?: ColorOverlayFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number|Array<number>} [color=0x000000] - The resulting color, as a 3 component RGB e.g. [1.0, 0.5, 1.0]
     * @param {number} [alpha=1] - The alpha value of the color
     */
    constructor(color?: DeprecatedColor, alpha?: number);
    /**
     * The over color source
     * @member {number|Array<number>|Float32Array}
     * @default 0x000000
     */
    get color(): ColorSource;
    set color(value: ColorSource);
    /**
     * The alpha value of the color
     * @default 1
     */
    get alpha(): number;
    set alpha(value: number);
}
export {};
