import { Filter } from 'pixi.js';
import type { ColorSource, FilterSystem, RenderSurface, Texture } from 'pixi.js';
/** Options for the OutlineFilter constructor. */
export interface OutlineFilterOptions {
    /**
     * The thickness of the outline
     * @default 1
     */
    thickness?: number;
    /**
     * The color of the outline
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0x000000
     */
    color?: ColorSource;
    /**
     * The alpha of the outline
     * @default 1
     */
    alpha?: number;
    /**
     * The quality of the outline from `0` to `1`.
     * Using a higher quality setting will result in more accuracy but slower performance
     * @default 0.1
     */
    quality?: number;
    /**
     * Whether to only render outline, not the contents.
     * @default false
     */
    knockout?: boolean;
}
/**
 * OutlineFilter, originally by mishaa
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 * http://codepen.io/mishaa/pen/emGNRB<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/outline.png)
 *
 * @class
 * @extends Filter *
 * @example
 *  someSprite.filters = [new OutlineFilter(2, 0x99ff99)];
 */
export declare class OutlineFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: OutlineFilterOptions;
    /** The minimum number of samples for rendering outline. */
    static MIN_SAMPLES: number;
    /** The maximum number of samples for rendering outline. */
    static MAX_SAMPLES: number;
    uniforms: {
        uThickness: Float32Array;
        uColor: Float32Array;
        uAlpha: number;
        uAngleStep: number;
        uKnockout: number;
    };
    private _thickness;
    private _quality;
    private _color;
    /**
     * @param options - Options for the OutlineFilter constructor.
     */
    constructor(options?: OutlineFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number} [thickness=1] - The tickness of the outline. Make it 2 times more for resolution 2
     * @param {number} [color=0x000000] - The color of the outline.
     * @param {number} [quality=0.1] - The quality of the outline from `0` to `1`, using a higher quality
     *        setting will result in slower performance and more accuracy.
     * @param {number} [alpha=1.0] - The alpha of the outline.
     * @param {boolean} [knockout=false] - Only render outline, not the contents.
     */
    constructor(thickness?: number, color?: number, quality?: number, alpha?: number, knockout?: boolean);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * Get the angleStep by quality
     * @param quality
     */
    private static getAngleStep;
    /**
     * The thickness of the outline
     * @default 1
     */
    get thickness(): number;
    set thickness(value: number);
    /**
     * The color value of the ambient color
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0x000000
     */
    get color(): ColorSource;
    set color(value: ColorSource);
    /**
     * Coefficient for alpha multiplication
     * @default 1
     */
    get alpha(): number;
    set alpha(value: number);
    /**
     * The quality of the outline from `0` to `1`.
     * Using a higher quality setting will result in more accuracy but slower performance
     * @default 0.1
     */
    get quality(): number;
    set quality(value: number);
    /**
     * Whether to only render outline, not the contents.
     * @default false
     */
    get knockout(): boolean;
    set knockout(value: boolean);
}
