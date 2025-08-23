import { ColorSource, Filter } from 'pixi.js';
/**
 * This WebGPU filter has been ported from the WebGL renderer that was originally created by mishaa, updated by timetocode
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 */
type DeprecatedColor = number | number[] | Float32Array;
/** Options for the ColorReplaceFilter constructor. */
export interface ColorReplaceFilterOptions {
    /**
     * The color that will be changed.
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0xff0000
     */
    originalColor?: ColorSource;
    /**
     * The resulting color.
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0x000000
     */
    targetColor?: ColorSource;
    /**
     * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
     * @default 0.4
     */
    tolerance?: number;
}
/**
 * ColorReplaceFilter, originally by mishaa, updated by timetocode
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/color-replace.png)
 *
 * @class
 * @extends Filter
 *
 * @example
 *  // replaces true red with true blue
 *  someSprite.filters = [new ColorReplaceFilter({
 *   originalColor: [1, 0, 0],
 *   targetColor: [0, 0, 1],
 *   tolerance: 0.001
 *   })];
 *  // replaces the RGB color 220, 220, 220 with the RGB color 225, 200, 215
 *  someOtherSprite.filters = [new ColorReplaceFilter({
 *   originalColor: [220/255.0, 220/255.0, 220/255.0],
 *   targetColor: [225/255.0, 200/255.0, 215/255.0],
 *   tolerance: 0.001
 *   })];
 *  // replaces the RGB color 220, 220, 220 with the RGB color 225, 200, 215
 *  someOtherSprite.filters = [new ColorReplaceFilter({ originalColor: 0xdcdcdc, targetColor: 0xe1c8d7, tolerance: 0.001 })];
 *
 */
export declare class ColorReplaceFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: ColorReplaceFilterOptions;
    uniforms: {
        uOriginalColor: Float32Array;
        uTargetColor: Float32Array;
        uTolerance: number;
    };
    private _originalColor;
    private _targetColor;
    /**
     * @param options - Options for the ColorReplaceFilter constructor.
     */
    constructor(options?: ColorReplaceFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number|Array<number>|Float32Array} [originalColor=0xFF0000] - The color that will be changed,
     *        as a 3 component RGB e.g. `[1.0, 1.0, 1.0]`
     * @param {number|Array<number>|Float32Array} [newColor=0x000000] - The resulting color, as a 3 component
     *        RGB e.g. `[1.0, 0.5, 1.0]`
     * @param {number} [epsilon=0.4] - Tolerance/sensitivity of the floating-point comparison between colors
     *        (lower = more exact, higher = more inclusive)
     */
    constructor(originalColor?: number, newColor?: number, epsilon?: number);
    /**
     * The color that will be changed.
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0xff0000
     */
    get originalColor(): ColorSource;
    set originalColor(value: ColorSource);
    /**
      * The resulting color.
      * @example [1.0, 1.0, 1.0] = 0xffffff
      * @default 0x000000
      */
    get targetColor(): ColorSource;
    set targetColor(value: ColorSource);
    /**
      * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
      * @default 0.4
      */
    get tolerance(): number;
    set tolerance(value: number);
    /**
     * @deprecated since 6.0.0
     *
     * The resulting color, as a 3 component RGB e.g. [1.0, 0.5, 1.0]
     * @member {number|Array<number>|Float32Array}
     * @default 0x000000
     * @see ColorReplaceFilter#targetColor
     */
    set newColor(value: DeprecatedColor);
    get newColor(): DeprecatedColor;
    /**
     * @deprecated since 6.0.0
     *
     * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
     * @default 0.4
     * @see ColorReplaceFilter#tolerance
     */
    set epsilon(value: number);
    get epsilon(): number;
}
export {};
