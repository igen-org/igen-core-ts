import { err, ok } from '@igen/shared';
import { HlaLocusClass } from './hla-locus-class.js';
export const HlaLocusGroupEnum = {
    A: 'A',
    B: 'B',
    C: 'C',
    DR: 'DR',
    DRB345: 'DRB345',
    DQ: 'DQ',
    DP: 'DP',
};
export class HlaLocusGroup {
    value;
    hasAlpha;
    hasBeta;
    classification;
    static A = new HlaLocusGroup(HlaLocusGroupEnum.A, true, false, HlaLocusClass.I);
    static B = new HlaLocusGroup(HlaLocusGroupEnum.B, true, false, HlaLocusClass.I);
    static C = new HlaLocusGroup(HlaLocusGroupEnum.C, true, false, HlaLocusClass.I);
    static DR = new HlaLocusGroup(HlaLocusGroupEnum.DR, false, true, HlaLocusClass.II);
    static DRB345 = new HlaLocusGroup(HlaLocusGroupEnum.DRB345, false, true, HlaLocusClass.II);
    static DQ = new HlaLocusGroup(HlaLocusGroupEnum.DQ, true, true, HlaLocusClass.II);
    static DP = new HlaLocusGroup(HlaLocusGroupEnum.DP, true, true, HlaLocusClass.II);
    static valueMap = new Map([
        [HlaLocusGroupEnum.A, HlaLocusGroup.A],
        [HlaLocusGroupEnum.B, HlaLocusGroup.B],
        [HlaLocusGroupEnum.C, HlaLocusGroup.C],
        [HlaLocusGroupEnum.DR, HlaLocusGroup.DR],
        [HlaLocusGroupEnum.DRB345, HlaLocusGroup.DRB345],
        [HlaLocusGroupEnum.DQ, HlaLocusGroup.DQ],
        [HlaLocusGroupEnum.DP, HlaLocusGroup.DP],
    ]);
    static values = Array.from(HlaLocusGroup.valueMap.values());
    constructor(value, hasAlpha, hasBeta, classification) {
        this.value = value;
        this.hasAlpha = hasAlpha;
        this.hasBeta = hasBeta;
        this.classification = classification;
    }
    static fromValue(value) {
        const group = HlaLocusGroup.valueMap.get(value);
        if (!group) {
            return err(new Error(`Unsupported HLA locus group: ${value}`));
        }
        return ok(group);
    }
    get isClassI() {
        return this.classification === HlaLocusClass.I;
    }
    get isClassII() {
        return this.classification === HlaLocusClass.II;
    }
}
//# sourceMappingURL=hla-locus-group.js.map