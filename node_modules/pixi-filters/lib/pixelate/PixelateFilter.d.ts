import { Filter, Point } from 'pixi.js';
type Size = number | number[] | Point;
/**
 * This filter applies a pixelate effect making display objects appear 'blocky'.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/pixelate.png)
 *
 * @class
 * @extends Filter
 */
export declare class PixelateFilter extends Filter {
    /**
     * @param {Point|Array<number>|number} [size=10] - Either the width/height of the size of the pixels, or square size
     */
    constructor(size?: Size);
    /**
     * The size of the pixels
     * @default [10,10]
     */
    get size(): Size;
    set size(value: Size);
    /**
    * The size of the pixels on the `x` axis
    * @default 10
    */
    get sizeX(): number;
    set sizeX(value: number);
    /**
    * The size of the pixels on the `y` axis
    * @default 10
    */
    get sizeY(): number;
    set sizeY(value: number);
}
export {};
