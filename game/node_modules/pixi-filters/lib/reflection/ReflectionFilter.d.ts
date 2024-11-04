import { Filter } from 'pixi.js';
import type { FilterSystem, RenderSurface, Texture } from 'pixi.js';
/** [MIN, MAX] */
type Range = [number, number] | Float32Array;
/** Options for the ReflectionFilter constructor. */
export interface ReflectionFilterOptions {
    /**
     * `true` to reflect the image, `false` for waves-only
     * @default true
     */
    mirror?: boolean;
    /**
     * Vertical position of the reflection point, `0.5` equates to the middle
     * smaller numbers produce a larger reflection, larger numbers produce a smaller reflection
     * @default 0.5
     */
    boundary?: number;
    /**
     * Starting and ending amplitude of waves
     * @default [0,20]
     */
    amplitude?: Range;
    /**
     * Starting and ending length of waves
     * @default [30,100]
     */
    waveLength?: Range;
    /**
     * Starting and ending alpha values
     * @default [1,1]
     */
    alpha?: Range;
    /**
     * Time for animating position of waves
     * @default 0
     */
    time?: number;
}
/**
 * Applies a reflection effect to simulate the reflection on water with waves.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/reflection.png)
 *
 * @class
 * @extends Filter
 */
export declare class ReflectionFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: ReflectionFilterOptions;
    uniforms: {
        uMirror: number;
        uBoundary: number;
        uAmplitude: Float32Array;
        uWavelength: Float32Array;
        uAlpha: Float32Array;
        uTime: number;
        uDimensions: Float32Array;
    };
    /**
     * Time for animating position of waves
     * @default 0
     */
    time: number;
    /**
     * @param options - Options for the ReflectionFilter constructor.
     */
    constructor(options?: ReflectionFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * `true` to reflect the image, `false` for waves-only
     * @default true
     */
    get mirror(): boolean;
    set mirror(value: boolean);
    /**
     * Vertical position of the reflection point, default is 50% (middle)
     * smaller numbers produce a larger reflection, larger numbers produce a smaller reflection.
     * @default 0.5
     */
    get boundary(): number;
    set boundary(value: number);
    /**
     * Starting and ending amplitude of waves
     * @default [0,20]
     */
    get amplitude(): Range;
    set amplitude(value: Range);
    /**
     * Starting amplitude of waves
     * @default 0
     */
    get amplitudeStart(): number;
    set amplitudeStart(value: number);
    /**
     * Starting amplitude of waves
     * @default 20
     */
    get amplitudeEnd(): number;
    set amplitudeEnd(value: number);
    /**
     * Starting and ending length of waves
     * @default [30,100]
     */
    get waveLength(): Range;
    set waveLength(value: Range);
    /**
     * Starting wavelength of waves
     * @default 30
     */
    get wavelengthStart(): number;
    set wavelengthStart(value: number);
    /**
     * Starting wavelength of waves
     * @default 100
     */
    get wavelengthEnd(): number;
    set wavelengthEnd(value: number);
    /**
     * Starting and ending alpha values
     * @default [1,1]
     */
    get alpha(): Range;
    set alpha(value: Range);
    /**
     * Starting wavelength of waves
     * @default 1
     */
    get alphaStart(): number;
    set alphaStart(value: number);
    /**
     * Starting wavelength of waves
     * @default 1
     */
    get alphaEnd(): number;
    set alphaEnd(value: number);
}
export {};
