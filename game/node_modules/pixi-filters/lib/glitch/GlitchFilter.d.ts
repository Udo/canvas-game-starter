import { Filter, Texture } from 'pixi.js';
import type { FilterSystem, PointData, RenderSurface } from 'pixi.js';
declare enum FILL_MODES {
    TRANSPARENT = 0,
    ORIGINAL = 1,
    LOOP = 2,
    CLAMP = 3,
    MIRROR = 4
}
/** Options for the GlitchFilter constructor. */
export interface GlitchFilterOptions {
    /**
     * The count of glitch slices.
     * @default 5
     */
    slices?: number;
    /**
     * The maximum offset amount of slices.
     * @default 100
     */
    offset?: number;
    /**
     * The angle in degree of the offset of slices.
     * @default 0
     */
    direction?: number;
    /**
     * The fill mode of the space after the offset.
     * @default FILL_MODES.TRANSPARENT
     */
    fillMode?: number;
    /**
     * A seed value for randomizing glitch effect.
     * @default 0
     */
    seed?: number;
    /**
     * `true` will divide the bands roughly based on equal amounts
     * where as setting to `false` will vary the band sizes dramatically (more random looking).
     * @default false
     */
    average?: boolean;
    /**
     * Minimum size of slices as a portion of the `sampleSize`
     * @default 8
     */
    minSize?: number;
    /**
     * Height of the displacement map canvas.
     * @default 512
     */
    sampleSize?: number;
    /**
     * Red channel offset.
     * @default {x:0,y:0}
     */
    red?: PointData | number[];
    /**
     * Green channel offset.
     * @default {x:0,y:0}
     */
    green?: PointData | number[];
    /**
     * Blue offset.
     * @default {x:0,y:0}
     */
    blue?: PointData | number[];
}
/**
 * The GlitchFilter applies a glitch effect to an object.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/glitch.png)
 *
 * @class
 * @extends Filter
 */
export declare class GlitchFilter extends Filter {
    /** Default constructor options. */
    static readonly defaults: GlitchFilterOptions;
    uniforms: {
        uSeed: number;
        uDimensions: Float32Array;
        uAspect: number;
        uFillMode: number;
        uOffset: number;
        uDirection: number;
        uRed: PointData;
        uGreen: PointData;
        uBlue: PointData;
    };
    /**
     * `true` will divide the bands roughly based on equal amounts
     * where as setting to `false` will vary the band sizes dramatically (more random looking).
     */
    average: boolean;
    /** Minimum size of slices as a portion of the `sampleSize` */
    minSize: number;
    /** Height of the displacement map canvas. */
    sampleSize: number;
    /** Internally generated canvas. */
    private _canvas;
    /**
     * The displacement map is used to generate the bands.
     * If using your own texture, `slices` will be ignored.
     *
     * @member {Texture}
     * @readonly
     */
    texture: Texture;
    /** Internal number of slices */
    private _slices;
    private _sizes;
    private _offsets;
    /**
     * @param options - Options for the GlitchFilter constructor.
     */
    constructor(options?: GlitchFilterOptions);
    /**
     * Override existing apply method in Filter
     * @private
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * Randomize the slices size (heights).
     *
     * @private
     */
    private _randomizeSizes;
    /**
     * Shuffle the sizes of the slices, advanced usage.
     */
    shuffle(): void;
    /**
     * Randomize the values for offset from -1 to 1
     *
     * @private
     */
    private _randomizeOffsets;
    /**
     * Regenerating random size, offsets for slices.
     */
    refresh(): void;
    /**
     * Redraw displacement bitmap texture, advanced usage.
     */
    redraw(): void;
    /**
     * Manually custom slices size (height) of displacement bitmap
     *
     * @member {number[]|Float32Array}
     */
    set sizes(sizes: Float32Array);
    get sizes(): Float32Array;
    /**
     * Manually set custom slices offset of displacement bitmap, this is
     * a collection of values from -1 to 1. To change the max offset value
     * set `offset`.
     *
     * @member {number[]|Float32Array}
     */
    set offsets(offsets: Float32Array);
    get offsets(): Float32Array;
    /**
     * The count of slices.
     * @default 5
     */
    get slices(): number;
    set slices(value: number);
    /**
     * The maximum offset amount of slices.
     * @default 100
     */
    get offset(): number;
    set offset(value: number);
    /**
     * A seed value for randomizing glitch effect.
     * @default 0
     */
    get seed(): number;
    set seed(value: number);
    /**
     * The fill mode of the space after the offset.
     * @default FILL_MODES.TRANSPARENT
     */
    get fillMode(): FILL_MODES;
    set fillMode(value: FILL_MODES);
    /**
     * The angle in degree of the offset of slices.
     * @default 0
     */
    get direction(): number;
    set direction(value: number);
    /**
     * Red channel offset.
     * @default {x:0,y:0}
     */
    get red(): PointData;
    set red(value: PointData | number[]);
    /**
     * Green channel offset.
     * @default {x:0,y:0}
     */
    get green(): PointData;
    set green(value: PointData | number[]);
    /**
     * Blue offset.
     * @default {x:0,y:0}
     */
    get blue(): PointData;
    set blue(value: PointData | number[]);
    /**
     * Removes all references
     */
    destroy(): void;
}
export {};
