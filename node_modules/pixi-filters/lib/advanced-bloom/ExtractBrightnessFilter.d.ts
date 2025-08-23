import { Filter } from 'pixi.js';
export interface ExtractBrightnessFilterOptions {
    /**
     * Defines how bright a color needs to be extracted.
     */
    threshold?: number;
}
/**
 * Internal filter for retrieving the brightness of the source image.
 * @class
 * @private
 */
export declare class ExtractBrightnessFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: ExtractBrightnessFilterOptions;
    uniforms: {
        uThreshold: number;
    };
    constructor(options?: ExtractBrightnessFilterOptions);
    /**
     * Defines how bright a color needs to be extracted.
     * @default 0.5
     */
    get threshold(): number;
    set threshold(value: number);
}
