import { err, ok } from '@igen/shared';
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
};
export class HlaLocus {
    value;
    groups;
    chainType;
    static A = new HlaLocus(HlaLocusEnum.A, HlaLocusGroup.A, HlaLocusChain.ALPHA);
    static B = new HlaLocus(HlaLocusEnum.B, HlaLocusGroup.B, HlaLocusChain.ALPHA);
    static C = new HlaLocus(HlaLocusEnum.C, HlaLocusGroup.C, HlaLocusChain.ALPHA);
    static DRB1 = new HlaLocus(HlaLocusEnum.DRB1, HlaLocusGroup.DR, HlaLocusChain.BETA);
    static DRB3 = new HlaLocus(HlaLocusEnum.DRB3, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    static DRB4 = new HlaLocus(HlaLocusEnum.DRB4, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    static DRB5 = new HlaLocus(HlaLocusEnum.DRB5, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    static DRB345 = new HlaLocus(HlaLocusEnum.DRB345, [HlaLocusGroup.DR, HlaLocusGroup.DRB345], HlaLocusChain.BETA);
    static DQB1 = new HlaLocus(HlaLocusEnum.DQB1, HlaLocusGroup.DQ, HlaLocusChain.BETA);
    static DQA1 = new HlaLocus(HlaLocusEnum.DQA1, HlaLocusGroup.DQ, HlaLocusChain.ALPHA);
    static DPB1 = new HlaLocus(HlaLocusEnum.DPB1, HlaLocusGroup.DP, HlaLocusChain.BETA);
    static DPA1 = new HlaLocus(HlaLocusEnum.DPA1, HlaLocusGroup.DP, HlaLocusChain.ALPHA);
    static valueMap = new Map([
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
    static values = Array.from(HlaLocus.valueMap.values());
    constructor(value, groups, chainType) {
        this.value = value;
        this.groups = Array.isArray(groups) ? groups : [groups];
        this.chainType = chainType;
    }
    static fromValue(value) {
        const normalized = value.toUpperCase();
        const locus = HlaLocus.valueMap.get(normalized);
        if (!locus) {
            return err(new Error(`Unsupported HLA locus: ${value}`));
        }
        return ok(locus);
    }
    toString() {
        return this.value;
    }
    get isDrb345() {
        return this.groups.includes(HlaLocusGroup.DRB345);
    }
    get isAlpha() {
        return this.chainType === HlaLocusChain.ALPHA;
    }
    get isBeta() {
        return this.chainType === HlaLocusChain.BETA;
    }
    get isClassI() {
        return this.groups.some((group) => group.isClassI);
    }
    get isClassII() {
        return this.groups.some((group) => group.isClassII);
    }
}
//# sourceMappingURL=hla-locus.js.map