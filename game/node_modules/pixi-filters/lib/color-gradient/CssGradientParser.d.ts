import { AngularNode, ColorStop as CssColorStop, DefaultRadialNode, DirectionalNode, ExtentKeywordNode, ShapeNode } from 'gradient-parser';
import { ColorStop } from './ColorGradientFilter';
export type ParseResult = {
    type: number;
    stops: ColorStop[];
    angle: number;
};
export declare function parseCssGradient(cssGradient: string): ParseResult;
export declare function typeFromCssType(type: string): number;
export declare function stopsFromCssStops(stops: CssColorStop[]): ColorStop[];
export declare function colorAsStringFromCssStop(stop: CssColorStop): string;
export declare function offsetsFromCssColorStops(stops: CssColorStop[]): number[];
type CssOrientation = DirectionalNode | AngularNode | (ShapeNode | DefaultRadialNode | ExtentKeywordNode)[] | undefined;
export declare function angleFromCssOrientation(orientation: CssOrientation): number;
export declare function angleFromDirectionalValue(value: string): number;
export declare function trimCssGradient(value: string): string;
export {};
