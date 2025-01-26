import { Filter, Texture, TextureSource } from 'pixi.js';
type ColorMapTexture = TextureSource | Texture;
/** Options for the ColorMapFilter constructor. */
export interface ColorMapFilterOptions {
    /** The colorMap texture of the filter. */
    colorMap: ColorMapTexture;
    /**
     *  The mix from 0 to 1, where 0 is the original image and 1 is the color mapped image.
     * @default 1
     */
    mix?: number;
    /**
     * Whether use NEAREST scale mode for `colorMap` texture.
     * @default false
     */
    nearest?: boolean;
}
/**
 * The ColorMapFilter applies a color-map effect to an object.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/color-map.png)
 *
 * @class
 * @extends Filter
 */
export declare class ColorMapFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: ColorMapFilterOptions;
    uniforms: {
        uMix: number;
        uSize: number;
        uSliceSize: number;
        uSlicePixelSize: number;
        uSliceInnerSize: number;
    };
    private _size;
    private _sliceSize;
    private _slicePixelSize;
    private _sliceInnerSize;
    private _nearest;
    private _scaleMode;
    private _colorMap;
    /**
     * @param options - Options for the ColorMapFilter constructor.
     */
    constructor(options: ColorMapFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {HTMLImageElement|HTMLCanvasElement|PIXI.BaseTexture|PIXI.Texture} [colorMap] - The
     *        colorMap texture of the filter.
     * @param {boolean} [nearest=false] - Whether use NEAREST for colorMap texture.
     * @param {number} [mix=1] - The mix from 0 to 1, where 0 is the original image and 1 is the color mapped image.
     */
    constructor(colorMap: ColorMapTexture, nearest?: boolean, mix?: number);
    /** The mix from 0 to 1, where 0 is the original image and 1 is the color mapped image. */
    get mix(): number;
    set mix(value: number);
    /**
     * The size of one color slice.
     * @readonly
     */
    get colorSize(): number;
    /** The colorMap texture. */
    get colorMap(): ColorMapTexture;
    set colorMap(value: ColorMapTexture);
    /** Whether use NEAREST for colorMap texture. */
    get nearest(): boolean;
    set nearest(nearest: boolean);
    /**
     * If the colorMap is based on canvas,
     * and the content of canvas has changed, then call `updateColorMap` for update texture.
     */
    updateColorMap(): void;
    /**
     * Destroys this filter
     * @default false
     */
    destroy(): void;
}
export {};
