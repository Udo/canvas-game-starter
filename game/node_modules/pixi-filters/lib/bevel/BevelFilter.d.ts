import { ColorSource, Filter } from 'pixi.js';
/** Options for the BevelFilter constructor. */
export interface BevelFilterOptions {
    /**
     * The angle of the light in degrees
     * @default 45
     */
    rotation?: number;
    /**
     * The thickness of the bevel
     * @default 2
     */
    thickness?: number;
    /**
     * The color value of the left & top bevel.
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0xffffff
     */
    lightColor?: ColorSource;
    /**
     * The alpha value of the left & top bevel.
     * @default 0.7
     */
    lightAlpha?: number;
    /**
     * The color value of the right & bottom bevel.
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0x000000
     */
    shadowColor?: ColorSource;
    /**
     * The alpha value of the right & bottom bevel.
     * @default 0.7
     */
    shadowAlpha?: number;
}
/**
 * Bevel Filter.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/bevel.png)
 *
 * @class
 * @extends Filter
 */
export declare class BevelFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: BevelFilterOptions;
    uniforms: {
        uLightColor: Float32Array;
        uLightAlpha: number;
        uShadowColor: Float32Array;
        uShadowAlpha: number;
        uTransform: Float32Array;
    };
    private _thickness;
    private _rotation;
    private _lightColor;
    private _shadowColor;
    /**
     * @param options - Options for the BevelFilter constructor.
     */
    constructor(options?: BevelFilterOptions);
    /**
     * The angle of the light in degrees
     * @default 45
     */
    get rotation(): number;
    set rotation(value: number);
    /**
     * The thickness of the bevel
     * @default 2
     */
    get thickness(): number;
    set thickness(value: number);
    /**
     * The color value of the left & top bevel.
     * @example [1.0, 1.0, 1.0] = 0xffffff
     * @default 0xffffff
     */
    get lightColor(): ColorSource;
    set lightColor(value: ColorSource);
    /**
     * The alpha value of the left & top bevel.
     * @default 0.7
     */
    get lightAlpha(): number;
    set lightAlpha(value: number);
    /**
     * The color value of the right & bottom bevel.
     * @default 0xffffff
     */
    get shadowColor(): ColorSource;
    set shadowColor(value: ColorSource);
    /**
     * The alpha value of the right & bottom bevel.
     * @default 0.7
     */
    get shadowAlpha(): number;
    set shadowAlpha(value: number);
    /**
     * Update the transform matrix of offset angle.
     * @private
     */
    private _updateTransform;
}
