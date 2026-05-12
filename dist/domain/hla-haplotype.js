import { ok } from '@igen/shared';
import { HlaLocus } from '../enum/hla-locus.js';
import { HlaAllele } from './hla-allele.js';
const normalizeLocus = (locus) => (locus.isDrb345 ? HlaLocus.DRB345 : locus);
const coerceLocus = (locus) => {
    if (locus instanceof HlaLocus) {
        return ok(locus);
    }
    return HlaLocus.fromValue(locus);
};
export class HlaHaplotype {
    alleleMap;
    constructor(alleles) {
        this.alleleMap = new Map();
        for (const allele of alleles) {
            const locus = normalizeLocus(allele.locus).value;
            this.alleleMap.set(locus, allele);
        }
    }
    static create(alleles) {
        if (alleles instanceof HlaHaplotype) {
            return ok(alleles.clone());
        }
        if (typeof alleles === 'string') {
            const parsedAlleles = [];
            for (const token of alleles
                .split('+')
                .map((value) => value.trim())
                .filter(Boolean)) {
                const alleleResult = HlaAllele.fromString(token);
                if (!alleleResult.ok) {
                    return alleleResult;
                }
                parsedAlleles.push(alleleResult.value);
            }
            return ok(new HlaHaplotype(parsedAlleles));
        }
        return ok(new HlaHaplotype(alleles));
    }
    get(locus, exact = false) {
        const locusResult = coerceLocus(locus);
        if (!locusResult.ok) {
            throw locusResult.error;
        }
        const resolved = locusResult.value;
        if (resolved.isDrb345) {
            const candidate = this.alleleMap.get(HlaLocus.DRB345.value);
            if (!candidate) {
                return null;
            }
            if (exact && candidate.locus !== resolved) {
                return null;
            }
            return candidate;
        }
        return this.alleleMap.get(resolved.value) ?? null;
    }
    set(locus, allele) {
        const locusResult = coerceLocus(locus);
        if (!locusResult.ok) {
            throw locusResult.error;
        }
        const normalizedLocus = normalizeLocus(locusResult.value);
        if (normalizedLocus.value !== normalizeLocus(allele.locus).value) {
            return this;
        }
        const mapping = new Map(this.alleleMap);
        mapping.set(normalizedLocus.value, allele);
        return new HlaHaplotype(mapping.values());
    }
    has(locus, exact = false) {
        return this.get(locus, exact) !== null;
    }
    swap(haplotype, locus) {
        let first = this.clone();
        let second = haplotype.clone();
        const allele1 = first.get(locus);
        const allele2 = second.get(locus);
        if (!allele1 || !allele2) {
            return [first, second];
        }
        first = first.set(locus, allele2);
        second = second.set(locus, allele1);
        return [first, second];
    }
    swapAll(haplotype, loci) {
        let pair = [this, haplotype];
        for (const locus of loci) {
            pair = pair[0].swap(pair[1], locus);
        }
        return pair;
    }
    clone() {
        return new HlaHaplotype(this.alleles);
    }
    concat(haplotype) {
        return new HlaHaplotype([...this.alleles, ...haplotype.alleles]);
    }
    toString() {
        return this.alleles.map((allele) => allele.allele).join('+');
    }
    [Symbol.iterator]() {
        return this.alleles[Symbol.iterator]();
    }
    get alleles() {
        return Array.from(this.alleleMap.values());
    }
}
//# sourceMappingURL=hla-haplotype.js.map