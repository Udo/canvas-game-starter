import { ColorSource, Filter } from 'pixi.js';
/** Options for AsciiFilter constructor. */
export interface AsciiFilterOptions {
    /**
     * The pixel size used by the filter
     * @default 8
     */
    size?: number;
    /**
     * A color to set the ascii characters to. If not set, the color will be taken from the source.
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0x000000
     */
    color?: ColorSource;
    /**
     * Determine whether or not to replace the source colors with the provided.
     *
     * Will automatically be assigned to `true` if `color` is provided.
     * Set `replaceColor` to `false` to prevent that.
     * @default false
     */
    replaceColor?: boolean;
}
/**
 * An ASCII filter.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/ascii.png)
 *
 * @class
 * @extends Filter
 */
export declare class AsciiFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: AsciiFilterOptions;
    uniforms: {
        uSize: number;
        uColor: Float32Array;
        uReplaceColor: number;
    };
    private _color;
    /**
     * Constructor.
     * @param {AsciiFilterOptions} options - The options of the ASCII filter.
     */
    constructor(options?: AsciiFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number} [size=8] - Size of the font
     */
    constructor(size: number);
    /**
     * The pixel size used by the filter.
     * @default 8
     */
    get size(): number;
    set size(value: number);
    /**
     * The resulting color of the ascii characters, as a 3 component RGB or numerical hex
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0xffffff
     */
    get color(): ColorSource;
    set color(value: ColorSource);
    /**
     * Determine whether or not to replace the source colors with the provided.
     */
    get replaceColor(): boolean;
    set replaceColor(value: boolean);
}
