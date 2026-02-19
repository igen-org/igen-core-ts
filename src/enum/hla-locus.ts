import { err, ok, type MaybeArray, type Result, type ValueOf } from '@igen/shared';
import { HlaLocusChain } from './hla-locus-chain.js';
import { HlaLocusGroup } from './hla-locus-group.js';

export const HlaLocusEnum = {
    A: 'A',
    B: 'B',
    C: 'C',
    DRB1: 'DRB1',
    DRB3: 'DRB3',
    DRB4: 'DRB4',
    DRB5: 'DRB5',
    DRB345: 'DRB345',
    DQB1: 'DQB1',
    DQA1: 'DQA1',
    DPB1: 'DPB1',
    DPA1: 'DPA1',
} as const;

export type HlaLocusEnum = ValueOf<typeof HlaLocusEnum>;

export class HlaLocus {
    public readonly value: HlaLocusEnum;
    public readonly groups: HlaLocusGroup[];
    public readonly chainType: HlaLocusChain;

    public static readonly A = new HlaLocus(HlaLocusEnum.A, HlaLocusGroup.A, HlaLocusChain.ALPHA);
    public static readonly B = new HlaLocus(HlaLocusEnum.B, HlaLocusGroup.B, HlaLocusChain.ALPHA);
    public static readonly C = new HlaLocus(HlaLocusEnum.C, HlaLocusGroup.C, HlaLocusChain.ALPHA);
    public static readonly DRB1 = new HlaLocus(HlaLocusEnum.DRB1, HlaLocusGroup.DR, HlaLocusChain.BETA);
    public static readonly DRB3 = new HlaLocus(HlaLocusEnum.DRB3, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    public static readonly DRB4 = new HlaLocus(HlaLocusEnum.DRB4, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    public static readonly DRB5 = new HlaLocus(HlaLocusEnum.DRB5, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    public static readonly DRB345 = new HlaLocus(HlaLocusEnum.DRB345, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    public static readonly DQB1 = new HlaLocus(HlaLocusEnum.DQB1, HlaLocusGroup.DQ, HlaLocusChain.BETA);
    public static readonly DQA1 = new HlaLocus(HlaLocusEnum.DQA1, HlaLocusGroup.DQ, HlaLocusChain.ALPHA);
    public static readonly DPB1 = new HlaLocus(HlaLocusEnum.DPB1, HlaLocusGroup.DP, HlaLocusChain.BETA);
    public static readonly DPA1 = new HlaLocus(HlaLocusEnum.DPA1, HlaLocusGroup.DP, HlaLocusChain.ALPHA);

    private static readonly valueMap = new Map<HlaLocusEnum, HlaLocus>([
        [HlaLocusEnum.A, HlaLocus.A],
        [HlaLocusEnum.B, HlaLocus.B],
        [HlaLocusEnum.C, HlaLocus.C],
        [HlaLocusEnum.DRB1, HlaLocus.DRB1],
        [HlaLocusEnum.DRB3, HlaLocus.DRB3],
        [HlaLocusEnum.DRB4, HlaLocus.DRB4],
        [HlaLocusEnum.DRB5, HlaLocus.DRB5],
        [HlaLocusEnum.DRB345, HlaLocus.DRB345],
        [HlaLocusEnum.DQB1, HlaLocus.DQB1],
        [HlaLocusEnum.DQA1, HlaLocus.DQA1],
        [HlaLocusEnum.DPB1, HlaLocus.DPB1],
        [HlaLocusEnum.DPA1, HlaLocus.DPA1],
    ]);

    public static readonly values = Array.from(HlaLocus.valueMap.values());

    private constructor(value: HlaLocusEnum, groups: MaybeArray<HlaLocusGroup>, chainType: HlaLocusChain) {
        this.value = value;
        this.groups = Array.isArray(groups) ? groups : [groups];
        this.chainType = chainType;
    }

    public static fromValue(value: string): Result<HlaLocus, Error> {
        const normalized = value.toUpperCase() as HlaLocusEnum;
        const locus = HlaLocus.valueMap.get(normalized);
        if (!locus) {
            return err(new Error(`Unsupported HLA locus: ${value}`));
        }
        return ok(locus);
    }

    public toString(): string {
        return this.value;
    }

    get isDrb345(): boolean {
        return this.groups.includes(HlaLocusGroup.DRB345);
    }

    get isAlpha(): boolean {
        return this.chainType === HlaLocusChain.ALPHA;
    }

    get isBeta(): boolean {
        return this.chainType === HlaLocusChain.BETA;
    }

    get isClassI(): boolean {
        return this.groups.some((group) => group.isClassI);
    }

    get isClassII(): boolean {
        return this.groups.some((group) => group.isClassII);
    }
}
