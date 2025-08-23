import { ColorSource, Filter, FilterSystem, PointData, RenderSurface, Texture } from 'pixi.js';
/** Options for the DropShadowFilter constructor. */
export interface DropShadowFilterOptions {
    /**
     * The offset position of the drop-shadow relative to the original image.
     * @default {x:4,y:4}
     */
    offset?: PointData;
    /**
     * The color value of shadow.
     * @example [0.0, 0.0, 0.0] = 0x000000
     * @default 0x000000
     */
    color?: ColorSource;
    /**
     * Coefficient for alpha multiplication.
     * @default 1
     */
    alpha?: number;
    /**
     * Hide the contents, only show the shadow.
     * @default false
     */
    shadowOnly?: boolean;
    /**
     * The strength of the shadow's blur.
     * @default 2
     */
    blur?: number;
    /**
     * The quality of the Blur Filter.
     * @default 4
     */
    quality?: number;
    /**
     * The kernel size of the blur filter.
     * @default null
     */
    kernels?: number[];
    /**
     * The pixelSize of the Kawase Blur filter
     * @default {x:1,y:1}
     */
    pixelSize?: PointData | number[] | number;
    /**
     * The resolution of the Kawase Blur filter
     * @default 1
     */
    resolution?: number;
}
/**
 * Drop shadow filter.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/drop-shadow.png)
 * @class
 * @extends Filter
 */
export declare class DropShadowFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: DropShadowFilterOptions;
    uniforms: {
        uAlpha: number;
        uColor: Float32Array;
        uOffset: PointData;
    };
    /**
     * Hide the contents, only show the shadow.
     * @default false
     */
    shadowOnly: boolean;
    private _color;
    private _blurFilter;
    private _basePass;
    /**
     * @param options - Options for the DropShadowFilter constructor.
     */
    constructor(options?: DropShadowFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * Set the offset position of the drop-shadow relative to the original image.
     * @default [4,4]
     */
    get offset(): PointData;
    set offset(value: PointData);
    /**
     * Set the offset position of the drop-shadow relative to the original image on the `x` axis
     * @default 4
     */
    get offsetX(): number;
    set offsetX(value: number);
    /**
     * Set the offset position of the drop-shadow relative to the original image on the `y` axis
     * @default 4
     */
    get offsetY(): number;
    set offsetY(value: number);
    /**
     * The color value of shadow.
     * @example [0.0, 0.0, 0.0] = 0x000000
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
     * The strength of the shadow's blur.
     * @default 2
     */
    get blur(): number;
    set blur(value: number);
    /**
     * Sets the quality of the Blur Filter
     * @default 4
     */
    get quality(): number;
    set quality(value: number);
    /** Sets the kernels of the Blur Filter */
    get kernels(): number[];
    set kernels(value: number[]);
    /**
     * Sets the pixelSize of the Kawase Blur filter
     * @default [1,1]
     */
    get pixelSize(): PointData;
    set pixelSize(value: PointData | number[] | number);
    /**
     * Sets the pixelSize of the Kawase Blur filter on the `x` axis
     * @default 1
     */
    get pixelSizeX(): number;
    set pixelSizeX(value: number);
    /**
     * Sets the pixelSize of the Kawase Blur filter on the `y` axis
     * @default 1
     */
    get pixelSizeY(): number;
    set pixelSizeY(value: number);
    /**
     * Recalculate the proper padding amount.
     * @private
     */
    private _updatePadding;
}
