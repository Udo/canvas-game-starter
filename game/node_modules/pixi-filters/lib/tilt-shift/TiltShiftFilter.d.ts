import { FilterSystem } from 'pixi.js';
import { TiltShiftAxisFilter } from './TiltShiftAxisFilter';
import type { PointData, RenderSurface, Texture } from 'pixi.js';
/** Options for the TiltShiftFilter constructor. */
export interface TiltShiftFilterOptions {
    /** The strength of the blur. */
    blur?: number;
    /** The strength of the blur gradient */
    gradientBlur?: number;
    /** The position to start the effect at. */
    start?: PointData;
    /** The position to end the effect at. */
    end?: PointData;
}
/**
 * A TiltShift Filter. Manages the pass of both a TiltShiftXFilter and TiltShiftYFilter.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/tilt-shift.png)
 *
 * author Vico @vicocotea
 * {@link https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js original filter }
 * by {@link http://madebyevan.com/ Evan Wallace }
 *
 * @class
 * @extends Filter
 */
export declare class TiltShiftFilter extends TiltShiftAxisFilter {
    private _tiltShiftYFilter;
    /**
     * @param options - Options for the TiltShiftFilter constructor.
     */
    constructor(options?: TiltShiftFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    /** @ignore */
    updateDelta(): void;
    /** The strength of the blur. */
    get blur(): number;
    set blur(value: number);
    /** The strength of the gradient blur. */
    get gradientBlur(): number;
    set gradientBlur(value: number);
    /** The position to start the effect at. */
    get start(): PointData;
    set start(value: PointData);
    /** The position to start the effect at on the `x` axis. */
    get startX(): number;
    set startX(value: number);
    /** The position to start the effect at on the `x` axis. */
    get startY(): number;
    set startY(value: number);
    /** The position to end the effect at. */
    get end(): PointData;
    set end(value: PointData);
    /** The position to end the effect at on the `x` axis. */
    get endX(): number;
    set endX(value: number);
    /** The position to end the effect at on the `y` axis. */
    get endY(): number;
    set endY(value: number);
}
