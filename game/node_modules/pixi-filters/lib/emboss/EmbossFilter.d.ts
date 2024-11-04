import { Filter } from 'pixi.js';
/**
 * An RGB Split Filter.<br>
 * ![original](../screenshots/original.png)![filter](../screenshots/emboss.png)
 *
 * @class
 * @extends Filter
 */
export declare class EmbossFilter extends Filter {
    uniforms: {
        uStrength: number;
    };
    /**
     * @param {number} [strength=5] - Strength of the emboss.
     */
    constructor(strength?: number);
    /**
     * Strength of the emboss
     * @default 5
     */
    get strength(): number;
    set strength(value: number);
}
