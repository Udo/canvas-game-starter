import { ColorSource, Filter } from 'pixi.js';
/**
 * Options for the GlowFilter constructor.
 */
export interface GlowFilterOptions {
    /**
     * The distance of the glow
     * @default 10
     */
    distance?: number;
    /**
     * The strength of the glow outward from the edge of the sprite
     * @default 4
     */
    outerStrength?: number;
    /**
     * The strength of the glow inward from the edge of the sprite
     * @default 0
     */
    innerStrength?: number;
    /**
     * The color of the glow
     * @default 0xffffff
     */
    color?: ColorSource;
    /**
     * The alpha of the glow
     * @default 1
     */
    alpha?: number;
    /**
     * A number between 0 and 1 that describes the quality of the glow. The higher the number the less performant
     * @default 0.1
     */
    quality?: number;
    /**
     * Toggle to hide the contents and only show glow
     * @default false
     */
    knockout?: boolean;
}
/**
 * GlowFilter, originally by mishaa
 * [codepen]{@link http://codepen.io/mishaa/pen/raKzrm}.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/glow.png)
 * @class
 *
 * @extends Filter
 *
 * @example
 *  someSprite.filters = [
 *      new GlowFilter({ distance: 15, outerStrength: 2 })
 *  ];
 */
export declare class GlowFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: GlowFilterOptions;
    uniforms: {
        uDistance: number;
        uStrength: Float32Array;
        uColor: Float32Array;
        uAlpha: number;
        uQuality: number;
        uKnockout: number;
    };
    private _color;
    /**
     * @param options - Options for the GlowFilter constructor.
     */
    constructor(options?: GlowFilterOptions);
    /**
     * Only draw the glow, not the texture itself
     * @default false
     */
    get distance(): number;
    set distance(value: number);
    /**
    * The strength of the glow inward from the edge of the sprite.
    * @default 0
    */
    get innerStrength(): number;
    set innerStrength(value: number);
    /**
    * The strength of the glow outward from the edge of the sprite.
    * @default 4
    */
    get outerStrength(): number;
    set outerStrength(value: number);
    /**
    * The color of the glow.
    * @default 0xFFFFFF
    */
    get color(): ColorSource;
    set color(value: ColorSource);
    /**
    * The alpha of the glow
    * @default 1
    */
    get alpha(): number;
    set alpha(value: number);
    /**
    * A number between 0 and 1 that describes the quality of the glow. The higher the number the less performant
    * @default 0.1
    */
    get quality(): number;
    set quality(value: number);
    /**
    * Only draw the glow, not the texture itself
    * @default false
    */
    get knockout(): boolean;
    set knockout(value: boolean);
}
