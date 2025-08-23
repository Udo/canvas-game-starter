import { Filter } from 'pixi.js';
/** Options for the SimplexNoiseFilter constructor. */
export interface SimplexNoiseFilterOptions {
    /**
     * Noise map strength.
     * @default 0.5
     */
    strength?: number;
    /**
     * Noise map scale.
     * @default 10.0
     */
    noiseScale?: number;
    /**
     * Horizontal offset for the noise map.
     * @default 0
     */
    offsetX?: number;
    /**
     * Vertical offset for the noise map.
     * @default 0
     */
    offsetY?: number;
    /**
     * Depth offset for the noise map.
     * @default 0
     */
    offsetZ?: number;
    /**
     * The threshold used with the step function to create a blocky effect in the noise pattern.
     * When this is greater than 0, the step function is used to compare the noise value to this threshold.
     * @default -1
     */
    step?: number;
}
/**
 * The SimplexNoiseFilter multiplies simplex noise with the current texture data. <br>
 * ![original](../screenshots/original.png)![filter](../screenshots/simplex-noise.png)
 * @class
 * @extends Filter
 * @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
 */
export declare class SimplexNoiseFilter extends Filter {
    /** Default constructor options. */
    static readonly defaults: SimplexNoiseFilterOptions;
    /**
     * @param options - Options for the SimplexNoise constructor.
     */
    constructor(options?: SimplexNoiseFilterOptions);
    /**
     * Strength of the noise (color = (noiseMap + strength) * texture)
     * @default 0.5
     */
    get strength(): number;
    set strength(value: number);
    /**
     * Noise map scale.
     * @default 10
     */
    get noiseScale(): number;
    set noiseScale(value: number);
    /**
     * Horizontal offset for the noise map.
     * @default 0
     */
    get offsetX(): number;
    set offsetX(value: number);
    /**
     * Vertical offset for the noise map.
     * @default 0
     */
    get offsetY(): number;
    set offsetY(value: number);
    /**
     * Depth offset for the noise map.
     * @default 0
     */
    get offsetZ(): number;
    set offsetZ(value: number);
    /**
     * The threshold used with the step function to create a blocky effect in the noise pattern.
     * When this is greater than 0, the step function is used to compare the noise value to this threshold.
     * @default -1
     */
    get step(): number;
    set step(value: number);
}
