import { Filter, PointData } from 'pixi.js';
/**
 * Options for creating filter.
 */
interface TiltShiftAxisFilterOptions {
    /** The strength of the blur. */
    blur?: number;
    /** The strength of the blur gradient */
    gradientBlur?: number;
    /** The position to start the effect at. */
    start?: PointData;
    /** The position to end the effect at. */
    end?: PointData;
    /** The axis that the filter is calculating for. */
    axis?: 'vertical' | 'horizontal';
}
/**
 * A TiltShiftAxisFilter.
 *
 * @class
 * @extends Filter
 * @private
 */
export declare class TiltShiftAxisFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: TiltShiftAxisFilterOptions;
    uniforms: {
        uBlur: Float32Array;
        uStart: PointData;
        uEnd: PointData;
        uDelta: Float32Array;
    };
    private _tiltAxis;
    constructor(options?: TiltShiftAxisFilterOptions);
    /**
     * Updates the filter delta values.
     * @ignore
     */
    updateDelta(): void;
}
export {};
