import { ColorSource, Filter } from 'pixi.js';
type DeprecatedColor = number | number[] | Float32Array;
/** Options for the MultiColorReplaceFilter constructor. */
export interface MultiColorReplaceFilterOptions {
    /**
     * The collection of replacement items. Each item is color-pair
     * (an array length is 2). In the pair, the first value is original color , the second value is target color
     *
     * _If you wish to change individual elements on the replacement array after instantiation,
     * use the `refresh` function to update the uniforms once you've made the changes_
     */
    replacements: Array<[ColorSource, ColorSource]>;
    /**
     * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
     * @default 0.05
     */
    tolerance?: number;
    /**
     * The maximum number of replacements filter is able to use.
     * Because the fragment is only compiled once, this cannot be changed after construction.
     * If omitted, the default value is the length of `replacements`
     */
    maxColors?: number;
}
/**
 * Filter for replacing a color with another color. Similar to ColorReplaceFilter, but support multiple
 * colors.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/multi-color-replace.png)
 * @class
 * @extends Filter
 *
 * @example
 *  // replaces pure red with pure blue, and replaces pure green with pure white
 *  someSprite.filters = [new MultiColorReplaceFilter({
 *    replacements: [
 *      [0xFF0000, 0x0000FF],
 *      [0x00FF00, 0xFFFFFF]
 *    ],
 *    tolerance: 0.001
 *  })];
 *
 *  You also could use [R, G, B] as the color
 *  someOtherSprite.filters = [new MultiColorReplaceFilter({
 *    replacements: [
 *      [ [1,0,0], [0,0,1] ],
 *      [ [0,1,0], [1,1,1] ]
 *    ],
 *    tolerance: 0.001
 *  })];
 *
 */
export declare class MultiColorReplaceFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: MultiColorReplaceFilterOptions;
    uniforms: {
        uOriginalColors: Float32Array;
        uTargetColors: Float32Array;
        uTolerance: number;
    };
    private _replacements;
    private _maxColors;
    /**
     * @param options - Options for the MultiColorReplaceFilter constructor.
     */
    constructor(options?: MultiColorReplaceFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {Array<Array>} replacements - The collection of replacement items. Each item is color-pair
     *        (an array length is 2). In the pair, the first value is original color , the second value
     *        is target color.
     * @param {number} [epsilon=0.05] - Tolerance of the floating-point comparison between colors
     *        (lower = more exact, higher = more inclusive)
     * @param {number} [maxColors] - The maximum number of replacements filter is able to use. Because the
     *        fragment is only compiled once, this cannot be changed after construction.
     *        If omitted, the default value is the length of `replacements`.
     */
    constructor(replacements: Array<[DeprecatedColor, DeprecatedColor]>, epsilon?: number, maxColors?: number);
    /**
     * The collection of replacement items. Each item is color-pair
     * (an array length is 2). In the pair, the first value is original color , the second value is target color
     */
    set replacements(replacements: Array<[ColorSource, ColorSource]>);
    get replacements(): Array<[ColorSource, ColorSource]>;
    /**
      * Should be called after changing any of the contents of the replacements.
      * This is a convenience method for resetting the `replacements`.
      * @todo implement nested proxy to remove the need for this function
      */
    refresh(): void;
    /**
      * The maximum number of color replacements supported by this filter. Can be changed
      * _only_ during construction.
      * @readonly
      */
    get maxColors(): number;
    /**
      * Tolerance of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
      * @default 0.05
      */
    get tolerance(): number;
    set tolerance(value: number);
    /**
     * @deprecated since 6.0.0
     *
     * Tolerance of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
     * @default 0.05
     */
    set epsilon(value: number);
    get epsilon(): number;
}
export {};
