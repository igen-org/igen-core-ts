import { err, ok, type Result, type ValueOf } from '@igen/shared';
import { HlaLocusClass } from './hla-locus-class.js';

export const HlaLocusGroupEnum = {
    A: 'A',
    B: 'B',
    C: 'C',
    DR: 'DR',
    DRB345: 'DRB345',
    DQ: 'DQ',
    DP: 'DP',
} as const;

export type HlaLocusGroupEnum = ValueOf<typeof HlaLocusGroupEnum>;

export class HlaLocusGroup {
    public readonly value: HlaLocusGroupEnum;
    public readonly hasAlpha: boolean;
    public readonly hasBeta: boolean;
    public readonly classification: HlaLocusClass;

    public static readonly A = new HlaLocusGroup(HlaLocusGroupEnum.A, true, false, HlaLocusClass.I);
    public static readonly B = new HlaLocusGroup(HlaLocusGroupEnum.B, true, false, HlaLocusClass.I);
    public static readonly C = new HlaLocusGroup(HlaLocusGroupEnum.C, true, false, HlaLocusClass.I);
    public static readonly DR = new HlaLocusGroup(HlaLocusGroupEnum.DR, false, true, HlaLocusClass.II);
    public static readonly DRB345 = new HlaLocusGroup(HlaLocusGroupEnum.DRB345, false, true, HlaLocusClass.II);
    public static readonly DQ = new HlaLocusGroup(HlaLocusGroupEnum.DQ, true, true, HlaLocusClass.II);
    public static readonly DP = new HlaLocusGroup(HlaLocusGroupEnum.DP, true, true, HlaLocusClass.II);

    private static readonly valueMap = new Map<HlaLocusGroupEnum, HlaLocusGroup>([
        [HlaLocusGroupEnum.A, HlaLocusGroup.A],
        [HlaLocusGroupEnum.B, HlaLocusGroup.B],
        [HlaLocusGroupEnum.C, HlaLocusGroup.C],
        [HlaLocusGroupEnum.DR, HlaLocusGroup.DR],
        [HlaLocusGroupEnum.DRB345, HlaLocusGroup.DRB345],
        [HlaLocusGroupEnum.DQ, HlaLocusGroup.DQ],
        [HlaLocusGroupEnum.DP, HlaLocusGroup.DP],
    ]);

    public static readonly values = Array.from(HlaLocusGroup.valueMap.values());

    private constructor(value: HlaLocusGroupEnum, hasAlpha: boolean, hasBeta: boolean, classification: HlaLocusClass) {
        this.value = value;
        this.hasAlpha = hasAlpha;
        this.hasBeta = hasBeta;
        this.classification = classification;
    }

    public static fromValue(value: HlaLocusGroupEnum): Result<HlaLocusGroup, Error> {
        const group = HlaLocusGroup.valueMap.get(value);
        if (!group) {
            return err(new Error(`Unsupported HLA locus group: ${value}`));
        }
        return ok(group);
    }

    get isClassI(): boolean {
        return this.classification === HlaLocusClass.I;
    }

    get isClassII(): boolean {
        return this.classification === HlaLocusClass.II;
    }
}
