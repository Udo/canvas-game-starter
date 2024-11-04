import { Filter } from 'pixi.js';
import type { FilterSystem, RenderSurface, Texture } from 'pixi.js';
/** Options for the OldFilmFilter constructor. */
export interface OldFilmFilterOptions {
    /**
     * The amount of saturation of sepia effect,
     * a value of `1` is more saturation and closer to `0` is less, and a value of `0` produces no sepia effect
     * @default 0.3
     */
    sepia?: number;
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
     * How often scratches appear
     * @default 0.5
     */
    scratch?: number;
    /**
     * The density of the number of scratches
     * @default 0.3
     */
    scratchDensity?: number;
    /**
     * The width of the scratches
     * @default 1
     */
    scratchWidth?: number;
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
     * @default 1
     */
    vignettingBlur?: number;
    /**
     * A seed value to apply to the random noise generation
     * @default 0
     */
    seed?: number;
}
/**
 * The OldFilmFilter applies a Old film effect to an object.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/old-film.gif)
 *
 * @class
 * @extends Filter
 */
export declare class OldFilmFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: OldFilmFilterOptions;
    uniforms: {
        uSepia: number;
        uNoise: Float32Array;
        uScratch: Float32Array;
        uVignetting: Float32Array;
        uSeed: number;
        uDimensions: Float32Array;
    };
    /**
     * A seed value to apply to the random noise generation
     * @default 0
     */
    seed: number;
    /**
     * @param options - Options for the OldFilmFilter constructor.
     */
    constructor(options?: OldFilmFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * The amount of saturation of sepia effect,
     * a value of `1` is more saturation and closer to `0` is less, and a value of `0` produces no sepia effect
     * @default 0.3
     */
    get sepia(): number;
    set sepia(value: number);
    /**
     * Opacity/intensity of the noise effect between `0` and `1`
     * @default 0.3
     */
    get noise(): number;
    set noise(value: number);
    /**
     * The size of the noise particles
     * @default 1
     */
    get noiseSize(): number;
    set noiseSize(value: number);
    /**
     * How often scratches appear
     * @default 0.5
     */
    get scratch(): number;
    set scratch(value: number);
    /**
     * The density of the number of scratches
     * @default 0.3
     */
    get scratchDensity(): number;
    set scratchDensity(value: number);
    /**
     * The width of the scratches
     * @default 1
     */
    get scratchWidth(): number;
    set scratchWidth(value: number);
    /**
     * The radius of the vignette effect, smaller values produces a smaller vignette
     * @default 0.3
     */
    get vignetting(): number;
    set vignetting(value: number);
    /**
     * Amount of opacity on the vignette
     * @default 1
     */
    get vignettingAlpha(): number;
    set vignettingAlpha(value: number);
    /**
     * Blur intensity of the vignette
     * @default 1
     */
    get vignettingBlur(): number;
    set vignettingBlur(value: number);
}
