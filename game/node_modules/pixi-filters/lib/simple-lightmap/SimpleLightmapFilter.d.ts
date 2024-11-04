import { ColorSource, Filter, FilterSystem, RenderSurface, Texture } from 'pixi.js';
type DeprecatedColor = number | number[];
/** Options for the SimpleLightmapFilter constructor. */
export interface SimpleLightmapFilterOptions {
    /** A texture where your lightmap is rendered */
    lightMap: Texture;
    /**
     * The color value of the ambient color
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0x000000
     */
    color?: ColorSource;
    /**
     * Coefficient for alpha multiplication
     * @default 1
     */
    alpha?: number;
}
/**
* SimpleLightmap, originally by Oza94
* {@link http://www.html5gamedevs.com/topic/20027-pixijs-simple-lightmapping/}
* {@link http://codepen.io/Oza94/pen/EPoRxj}
*
* You have to specify filterArea, or suffer consequences.
* You may have to use it with `filter.dontFit = true`,
*  until we rewrite this using same approach as for DisplacementFilter.
*
* ![original](../screenshots/original.png)![filter](../screenshots/simple-lightmap.png)
* @class
* @extends Filter
* @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
*
* @example
*  displayObject.filters = [new SimpleLightmapFilter(texture, 0x666666)];
*/
export declare class SimpleLightmapFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: SimpleLightmapFilterOptions;
    uniforms: {
        uColor: Float32Array;
        uAlpha: number;
        uDimensions: Float32Array;
    };
    private _color;
    private _lightMap;
    /**
     * @param options - Options for the SimpleLightmapFilter constructor.
     */
    constructor(options: SimpleLightmapFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {PIXI.Texture} texture - a texture where your lightmap is rendered
     * @param {Array<number>|number} [color=0x000000] - An RGBA array of the ambient color
     * @param {number} [alpha=1] - Default alpha set independent of color (if it's a number, not array).
     */
    constructor(texture: Texture, color?: DeprecatedColor, alpha?: number);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /** A sprite where your lightmap is rendered */
    get lightMap(): Texture;
    set lightMap(value: Texture);
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
}
export {};
