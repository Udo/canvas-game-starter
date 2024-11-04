import { Filter, PointData } from 'pixi.js';
type FixedArray<T, L extends number> = [T, ...Array<T>] & {
    length: L;
};
export type ConvolutionMatrix = Float32Array | FixedArray<number, 9>;
/** Options for the ConvolutionFilter constructor. */
export interface ConvolutionFilterOptions {
    /**
     * An array of values used for matrix transformation, specified as a 9 point Array
     * @example
     * const matrix = new Float32Array(9); // 9 elements of value 0
     * const matrix = [0,0.5,0,0.5,1,0.5,0,0.5,0];
     * @default [0,0,0,0,0,0,0,0,0]
     */
    matrix?: ConvolutionMatrix;
    /**
     * Width of the object you are transforming
     * @default 200
     */
    width?: number;
    /**
     * Height of the object you are transforming
     * @default 200
     */
    height?: number;
}
/**
 * The ConvolutionFilter class applies a matrix convolution filter effect.
 * A convolution combines pixels in the input image with neighboring pixels to produce a new image.
 * A wide variety of image effects can be achieved through convolutions, including blurring, edge
 * detection, sharpening, embossing, and beveling. The matrix should be specified as a 9 point Array.
 * See https://docs.gimp.org/2.10/en/gimp-filter-convolution-matrix.html for more info.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/convolution.png)
 *
 * @class
 * @extends Filter
 */
export declare class ConvolutionFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: ConvolutionFilterOptions;
    uniforms: {
        uMatrix: ConvolutionMatrix;
        uTexelSize: PointData;
    };
    /**
     * @param options - Options for the ConvolutionFilter constructor.
     */
    constructor(options?: ConvolutionFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {number[]} [matrix=[0,0,0,0,0,0,0,0,0]] - An array of values used for matrix transformation.
     *        Specified as a 9 point Array.
     * @param {number} [width=200] - Width of the object you are transforming
     * @param {number} [height=200] - Height of the object you are transforming
     */
    constructor(matrix: number[], width?: number, height?: number);
    /**
     * An array of values used for matrix transformation, specified as a 9 point Array
     * @example
     * const matrix = new Float32Array(9); // 9 elements of value 0
     * const matrix = [0,0.5,0,0.5,1,0.5,0,0.5,0];
     * @default [0,0,0,0,0,0,0,0,0]
     */
    get matrix(): ConvolutionMatrix;
    set matrix(matrix: ConvolutionMatrix);
    /**
     * Width of the object you are transforming
     * @default 200
     */
    get width(): number;
    set width(value: number);
    /**
     * Height of the object you are transforming
     * @default 200
     */
    get height(): number;
    set height(value: number);
}
export {};
