import { ColorSource, Filter } from 'pixi.js';
/** Color stop object. */
export interface ColorStop {
    offset: number;
    color: ColorSource;
    alpha: number;
}
/** Options for ColorGradientFilter constructor. */
export interface ColorGradientFilterOptions {
    /**
     * Linear = 0, Radial = 1, Conic = 2
     * @default ColorGradientFilter.LINEAR
     */
    type: number;
    /** Collection of stops, must be 2+ */
    stops: ColorStop[];
    /**
     * Angle for linear gradients, in degrees.
     * @default 90
     */
    angle?: number;
    /**
     * Alpha value for the gradient.
     * @default 1
     */
    alpha?: number;
    /**
     * Maximum number of colors to render (0 = no limit)
     * @default 0
     */
    maxColors?: number;
    /**
     * If true, the gradient will replace the existing color, otherwise it will be multiplied with it
     * @default false
     */
    replace?: boolean;
}
/** Options for CSS-style gradient for use with constructor. */
export interface ColorGradientFilterCSSOptions {
    /** CSS-style gradient string */
    css: string;
    /**
     * Alpha value for the gradient.
     * @default 1
     */
    alpha?: number;
    /**
     * Maximum number of colors to render (0 = no limit)
     * @default 0
     */
    maxColors?: number;
}
/**
 * Render a colored gradient.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/color-gradient.png)
 *
 * @class
 * @extends Filter
 */
export declare class ColorGradientFilter extends Filter {
    /** Gradient types */
    static readonly LINEAR = 0;
    static readonly RADIAL = 1;
    static readonly CONIC = 2;
    /** Default constructor options */
    static readonly defaults: ColorGradientFilterOptions;
    baseUniforms: {
        uOptions: Float32Array;
        uCounts: Float32Array;
    };
    stopsUniforms: {
        uColors: Float32Array;
        uStops: Float32Array;
    };
    private _stops;
    /**
     * @param options - Options for the ColorGradientFilter constructor.
     */
    constructor(options?: ColorGradientFilterOptions | ColorGradientFilterCSSOptions);
    get stops(): ColorStop[];
    set stops(stops: ColorStop[]);
    /**
   * The type of gradient
   * @default ColorGradientFilter.LINEAR
   */
    get type(): number;
    set type(value: number);
    /**
   * The angle of the gradient in degrees
   * @default 90
   */
    get angle(): number;
    set angle(value: number);
    /**
   * The alpha value of the gradient (0-1)
   * @default 1
   */
    get alpha(): number;
    set alpha(value: number);
    /**
   * The maximum number of colors to render (0 = no limit)
   * @default 0
   */
    get maxColors(): number;
    set maxColors(value: number);
    /**
     * If true, the gradient will replace the existing color, otherwise it
     * will be multiplied with it
     * @default false
     */
    get replace(): boolean;
    set replace(value: boolean);
}
