import { type Result, type ValueOf } from '@igen/shared';
import { HlaLocusChain } from './hla-locus-chain.js';
import { HlaLocusGroup } from './hla-locus-group.js';
export declare const HlaLocusEnum: {
    readonly A: "A";
    readonly B: "B";
    readonly C: "C";
    readonly DRB1: "DRB1";
    readonly DRB3: "DRB3";
    readonly DRB4: "DRB4";
    readonly DRB5: "DRB5";
    readonly DRB345: "DRB345";
    readonly DQB1: "DQB1";
    readonly DQA1: "DQA1";
    readonly DPB1: "DPB1";
    readonly DPA1: "DPA1";
};
export type HlaLocusEnum = ValueOf<typeof HlaLocusEnum>;
export declare class HlaLocus {
    readonly value: HlaLocusEnum;
    readonly groups: HlaLocusGroup[];
    readonly chainType: HlaLocusChain;
    static readonly A: HlaLocus;
    static readonly B: HlaLocus;
    static readonly C: HlaLocus;
    static readonly DRB1: HlaLocus;
    static readonly DRB3: HlaLocus;
    static readonly DRB4: HlaLocus;
    static readonly DRB5: HlaLocus;
    static readonly DRB345: HlaLocus;
    static readonly DQB1: HlaLocus;
    static readonly DQA1: HlaLocus;
    static readonly DPB1: HlaLocus;
    static readonly DPA1: HlaLocus;
    private static readonly valueMap;
    static readonly values: HlaLocus[];
    private constructor();
    static fromValue(value: string): Result<HlaLocus, Error>;
    toString(): string;
    get isDrb345(): boolean;
    get isAlpha(): boolean;
    get isBeta(): boolean;
    get isClassI(): boolean;
    get isClassII(): boolean;
}
//# sourceMappingURL=hla-locus.d.ts.map