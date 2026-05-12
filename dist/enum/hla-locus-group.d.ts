import { type Result, type ValueOf } from '@igen/shared';
import { HlaLocusClass } from './hla-locus-class.js';
export declare const HlaLocusGroupEnum: {
    readonly A: "A";
    readonly B: "B";
    readonly C: "C";
    readonly DR: "DR";
    readonly DRB345: "DRB345";
    readonly DQ: "DQ";
    readonly DP: "DP";
};
export type HlaLocusGroupEnum = ValueOf<typeof HlaLocusGroupEnum>;
export declare class HlaLocusGroup {
    readonly value: HlaLocusGroupEnum;
    readonly hasAlpha: boolean;
    readonly hasBeta: boolean;
    readonly classification: HlaLocusClass;
    static readonly A: HlaLocusGroup;
    static readonly B: HlaLocusGroup;
    static readonly C: HlaLocusGroup;
    static readonly DR: HlaLocusGroup;
    static readonly DRB345: HlaLocusGroup;
    static readonly DQ: HlaLocusGroup;
    static readonly DP: HlaLocusGroup;
    private static readonly valueMap;
    static readonly values: HlaLocusGroup[];
    private constructor();
    static fromValue(value: HlaLocusGroupEnum): Result<HlaLocusGroup, Error>;
    get isClassI(): boolean;
    get isClassII(): boolean;
}
//# sourceMappingURL=hla-locus-group.d.ts.map