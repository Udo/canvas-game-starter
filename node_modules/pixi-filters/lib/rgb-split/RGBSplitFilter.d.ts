import { Filter, PointData } from 'pixi.js';
type OffsetType = PointData | [number, number];
/** Options for the RGBSplitFilter constructor. */
export interface RGBSplitFilterOptions {
    /**
     * The amount of offset for the red channel.
     * @default {x:-10,y:0}
     */
    red?: OffsetType;
    /**
     * The amount of offset for the green channel.
     * @default {x:0,y:10}
     */
    green?: OffsetType;
    /**
     * The amount of offset for the blue channel.
     * @default {x:0,y:0}
     */
    blue?: OffsetType;
}
/**
 * An RGB Split Filter.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/rgb.png)
 *
 * @class
 * @extends Filter
 */
export declare class RGBSplitFilter extends Filter {
    /** Default values for options. */
    static readonly DEFAULT_OPTIONS: RGBSplitFilterOptions;
    uniforms: {
        uRed: PointData;
        uGreen: PointData;
        uBlue: PointData;
    };
    /**
     * @param options - Options for the RGBSplitFilter constructor.
     */
    constructor(options?: RGBSplitFilterOptions);
    /**
     * @deprecated since 6.0.0
     *
     * @param {PIXI.PointData | number[]} [red=[-10,0]] - Red channel offset
     * @param {PIXI.PointData | number[]} [green=[0, 10]] - Green channel offset
     * @param {PIXI.PointData | number[]} [blue=[0, 0]] - Blue channel offset
     */
    constructor(red?: OffsetType, green?: OffsetType, blue?: OffsetType);
    /**
     * Red channel offset.
     * @default {x:-10,y:0}
     */
    get red(): PointData;
    set red(value: OffsetType);
    /**
     * Amount of x-axis offset for the red channel.
     * @default -10
     */
    get redX(): number;
    set redX(value: number);
    /**
     * Amount of y-axis offset for the red channel.
     * @default 0
     */
    get redY(): number;
    set redY(value: number);
    /**
     * Green channel offset.
     * @default {x:0,y:10}
     */
    get green(): PointData;
    set green(value: OffsetType);
    /**
     * Amount of x-axis offset for the green channel.
     * @default 0
     */
    get greenX(): number;
    set greenX(value: number);
    /**
     * Amount of y-axis offset for the green channel.
     * @default 10
     */
    get greenY(): number;
    set greenY(value: number);
    /**
     * Blue channel offset.
     * @default {x:0,y:0}
     */
    get blue(): PointData;
    set blue(value: OffsetType);
    /**
     * Amount of x-axis offset for the blue channel.
     * @default 0
     */
    get blueX(): number;
    set blueX(value: number);
    /**
     * Amount of y-axis offset for the blue channel.
     * @default 0
     */
    get blueY(): number;
    set blueY(value: number);
}
export {};
