import { Filter, FilterSystem, PointData, RenderSurface, Texture } from 'pixi.js';
/** Options for the ShockwaveFilter constructor. */
export interface ShockwaveFilterOptions {
    /**
     * The `x` and `y` center coordinates to change the position of the center of the circle of effect.
     * @default {x:0,y:0}
     */
    center?: PointData;
    /**
     * The speed about the shockwave ripples out. The unit is `pixel-per-second`
     * @default 500
     */
    speed?: number;
    /**
     * The amplitude of the shockwave
     * @default 30
     */
    amplitude?: number;
    /**
     * The wavelength of the shockwave
     * @default 160
     */
    wavelength?: number;
    /**
     * The brightness of the shockwave
     * @default 1
     */
    brightness?: number;
    /**
     * The maximum radius of shockwave. less than `0` means the max is an infinite distance
     * @default -1
     */
    radius?: number;
    /**
     * Sets the elapsed time of the shockwave.
     * @default 0
     */
    time?: number;
}
/**
 * Create a visual wrinkle effect by like a pond or blast wave.<br />
 * ![original](../screenshots/original.png)![filter](../screenshots/shockwave.gif)
 *
 * {@link https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js original filter}
 * @author Vico @vicocotea
 */
export declare class ShockwaveFilter extends Filter {
    /** Default shockwave filter options */
    static readonly DEFAULT_OPTIONS: ShockwaveFilterOptions;
    uniforms: {
        uTime: number;
        uCenter: PointData;
        uSpeed: number;
        uWave: Float32Array;
    };
    /** Sets the elapsed time of the shockwave. It could control the current size of shockwave. */
    time: number;
    /**
     * @param options - Options for the ShockwaveFilter constructor.
     */
    constructor(options?: ShockwaveFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {PIXI.PointData|number[]} [center=[0.5, 0.5]] - See `center` property.
     * @param {object} [options] - The optional parameters of shockwave filter.
     * @param {number} [options.amplitude=0.5] - See `amplitude`` property.
     * @param {number} [options.wavelength=1.0] - See `wavelength` property.
     * @param {number} [options.speed=500.0] - See `speed` property.
     * @param {number} [options.brightness=8] - See `brightness` property.
     * @param {number} [options.radius=4] - See `radius` property.
     * @param {number} [time=0] - See `time` property.
     */
    constructor(center?: PointData | number[], options?: Omit<ShockwaveFilterOptions, 'time' | 'center'>, time?: number);
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /**
     * The `x` and `y` center coordinates to change the position of the center of the circle of effect.
     * @default [0,0]
     */
    get center(): PointData;
    set center(value: PointData | number[]);
    /**
     * Sets the center of the effect in normalized screen coords on the `x` axis
     * @default 0
     */
    get centerX(): number;
    set centerX(value: number);
    /**
     * Sets the center of the effect in normalized screen coords on the `y` axis
     * @default 0
     */
    get centerY(): number;
    set centerY(value: number);
    /**
     * The speed about the shockwave ripples out. The unit is `pixel-per-second`
     * @default 500
     */
    get speed(): number;
    set speed(value: number);
    /**
     * The amplitude of the shockwave
     * @default 30
     */
    get amplitude(): number;
    set amplitude(value: number);
    /**
     * The wavelength of the shockwave
     * @default 160
     */
    get wavelength(): number;
    set wavelength(value: number);
    /**
     * The brightness of the shockwave
     * @default 1
     */
    get brightness(): number;
    set brightness(value: number);
    /**
     * The maximum radius of shockwave. less than `0` means the max is an infinite distance
     * @default -1
     */
    get radius(): number;
    set radius(value: number);
}
