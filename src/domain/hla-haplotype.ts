import { ok, type Result } from '@igen/shared';
import type { HlaLocusEnum } from '../enum/hla-locus.js';
import { HlaLocus } from '../enum/hla-locus.js';
import { HlaAllele } from './hla-allele.js';
import type { HlaAlleleLike } from './hla-allele.js';

export type AlleleInput = Iterable<HlaAlleleLike> | HlaHaplotype | string;
export type LocusInput = HlaLocus | string;

const normalizeLocus = (locus: HlaLocus): HlaLocus => (locus.isDrb345 ? HlaLocus.DRB345 : locus);

const coerceLocus = (locus: LocusInput): Result<HlaLocus, Error> => {
    if (locus instanceof HlaLocus) {
        return ok(locus);
    }

    return HlaLocus.fromValue(locus);
};

export class HlaHaplotype {
    private readonly alleleMap: Map<HlaLocusEnum, HlaAlleleLike>;

    public constructor(alleles: Iterable<HlaAlleleLike>) {
        this.alleleMap = new Map<HlaLocusEnum, HlaAlleleLike>();
        for (const allele of alleles) {
            const locus = normalizeLocus(allele.locus).value;
            this.alleleMap.set(locus, allele);
        }
    }

    public static create(alleles: AlleleInput): Result<HlaHaplotype, Error> {
        if (alleles instanceof HlaHaplotype) {
            return ok(alleles.clone());
        }

        if (typeof alleles === 'string') {
            const parsedAlleles: HlaAlleleLike[] = [];
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

    public get(locus: LocusInput, exact: boolean = false): HlaAlleleLike | null {
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

    public set(locus: LocusInput, allele: HlaAlleleLike): HlaHaplotype {
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

    public has(locus: LocusInput, exact: boolean = false): boolean {
        return this.get(locus, exact) !== null;
    }

    public swap(haplotype: HlaHaplotype, locus: LocusInput): [HlaHaplotype, HlaHaplotype] {
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

    public swapAll(haplotype: HlaHaplotype, loci: LocusInput[]): [HlaHaplotype, HlaHaplotype] {
        let pair: [HlaHaplotype, HlaHaplotype] = [this, haplotype];
        for (const locus of loci) {
            pair = pair[0].swap(pair[1], locus);
        }
        return pair;
    }

    public clone(): HlaHaplotype {
        return new HlaHaplotype(this.alleles);
    }

    public concat(haplotype: HlaHaplotype): HlaHaplotype {
        return new HlaHaplotype([...this.alleles, ...haplotype.alleles]);
    }

    public toString(): string {
        return this.alleles.map((allele) => allele.allele).join('+');
    }

    public [Symbol.iterator](): Iterator<HlaAlleleLike> {
        return this.alleles[Symbol.iterator]();
    }

    get alleles(): HlaAlleleLike[] {
        return Array.from(this.alleleMap.values());
    }
}
