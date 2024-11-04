import { BlurFilter, BlurFilterOptions, FilterSystem, RenderSurface, Texture } from 'pixi.js';
/**
 * The BackdropBlurFilter applies a Gaussian blur to everything behind an object, and then draws the object on top of it.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/backdrop-blur.png)
 *
 * @class
 * @extends BlurFilter
 */
export declare class BackdropBlurFilter extends BlurFilter {
    private _blendPass;
    /**
     * @param options - The options of the blur filter.
     */
    constructor(options?: BlurFilterOptions);
    /**
     * Override existing apply method in `Filter`
     * @override
     * @ignore
     */
    apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean): void;
    protected updatePadding(): void;
}
