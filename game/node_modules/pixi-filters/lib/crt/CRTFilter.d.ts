import { Filter } from 'pixi.js';
import type { FilterSystem, RenderSurface, Texture } from 'pixi.js';
/** Options for the CRTFilter constructor. */
export interface CRTFilterOptions {
    /**
     * Bend of interlaced lines, higher value means more bend
     * @default 1
     */
    curvature?: number;
    /**
     * Width of the interlaced lines
     * @default 1
     */
    lineWidth?: number;
    /**
     * Contrast of interlaced lines
     * @default 0.25
     */
    lineContrast?: number;
    /**
     * The orientation of the line:
     *
     * `true` create vertical lines, `false` creates horizontal lines
     * @default false
     */
    verticalLine?: boolean;
    /**
     * For animating interlaced lines
     * @default 0
     */
    time?: number;
    /**
     * Opacity/intensity of the noise effect between `0` and `1`
     * @default 0.3
     */
    noise?: number;
    /**
     * The size of the noise particles
     * @default 1
     */
    noiseSize?: number;
    /**
     * A seed value to apply to the random noise generation
     * @default 0
     */
    seed?: number;
    /**
     * The radius of the vignette effect, smaller values produces a smaller vignette
     * @default 0.3
     */
    vignetting?: number;
    /**
     * Amount of opacity on the vignette
     * @default 1
     */
    vignettingAlpha?: number;
    /**
     * Blur intensity of the vignette
     * @default 0.3
     */
    vignettingBlur?: number;
}
/**
 * The CRTFilter applies a CRT effect to an object.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/crt.png)
 *
 * @class
 * @extends Filter
 */
export declare class CRTFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: CRTFilterOptions;
    uniforms: {
        uLine: Float32Array;
        uNoise: Float32Array;
        uVignette: Float32Array;
        uSeed: number;
        uTime: number;
        uDimensions: Float32Array;
    };
    /**
     * A seed value to apply to the random noise generation
     * @default 0
     */
    seed: number;
    /**
     * Opacity/intensity of the noise effect between `0` and `1`
     * @default 0.3
     */
    time: number;
    /**
     * @param options - Options for the CRTFilter constructor.
     */
    constructor(options?: CRTFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * Bend of interlaced lines, higher value means more bend
     * @default 1
     */
    get curvature(): number;
    set curvature(value: number);
    /**
     * Width of interlaced lines
     * @default 1
     */
    get lineWidth(): number;
    set lineWidth(value: number);
    /**
     * Contrast of interlaced lines
     * @default 0.25
     */
    get lineContrast(): number;
    set lineContrast(value: number);
    /**
     * The orientation of the line:
     *
     * `true` create vertical lines, `false` creates horizontal lines
     * @default false
     */
    get verticalLine(): boolean;
    set verticalLine(value: boolean);
    /**
     * Opacity/intensity of the noise effect between `0` and `1`
     * @default 0.3
     */
    get noise(): number;
    set noise(value: number);
    /**
     * The size of the noise particles
     * @default 0
     */
    get noiseSize(): number;
    set noiseSize(value: number);
    /**
     * The radius of the vignette effect, smaller values produces a smaller vignette
     * @default 0.3
     */
    get vignetting(): number;
    set vignetting(value: number);
    /**
     * Amount of opacity of vignette
     * @default 1
     */
    get vignettingAlpha(): number;
    set vignettingAlpha(value: number);
    /**
     * Blur intensity of the vignette
     * @default 0.3
     */
    get vignettingBlur(): number;
    set vignettingBlur(value: number);
}
