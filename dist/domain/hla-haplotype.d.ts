import { type Result } from '@igen/shared';
import { HlaLocus } from '../enum/hla-locus.js';
import type { HlaAlleleLike } from './hla-allele.js';
export type AlleleInput = Iterable<HlaAlleleLike> | HlaHaplotype | string;
export type LocusInput = HlaLocus | string;
export interface HlaHaplotypeLike {
    get(locus: LocusInput, exact?: boolean): HlaAlleleLike | null;
    set(locus: LocusInput, allele: HlaAlleleLike): HlaHaplotype;
    has(locus: LocusInput, exact?: boolean): boolean;
    swap(haplotype: HlaHaplotype, locus: LocusInput): [HlaHaplotype, HlaHaplotype];
    swapAll(haplotype: HlaHaplotype, loci: LocusInput[]): [HlaHaplotype, HlaHaplotype];
    clone(): HlaHaplotype;
    concat(haplotype: HlaHaplotype): HlaHaplotype;
    toString(): string;
    [Symbol.iterator](): Iterator<HlaAlleleLike>;
    readonly alleles: HlaAlleleLike[];
}
export declare class HlaHaplotype implements HlaHaplotypeLike {
    private readonly alleleMap;
    constructor(alleles: Iterable<HlaAlleleLike>);
    static create(alleles: AlleleInput): Result<HlaHaplotype, Error>;
    get(locus: LocusInput, exact?: boolean): HlaAlleleLike | null;
    set(locus: LocusInput, allele: HlaAlleleLike): HlaHaplotype;
    has(locus: LocusInput, exact?: boolean): boolean;
    swap(haplotype: HlaHaplotype, locus: LocusInput): [HlaHaplotype, HlaHaplotype];
    swapAll(haplotype: HlaHaplotype, loci: LocusInput[]): [HlaHaplotype, HlaHaplotype];
    clone(): HlaHaplotype;
    concat(haplotype: HlaHaplotype): HlaHaplotype;
    toString(): string;
    [Symbol.iterator](): Iterator<HlaAlleleLike>;
    get alleles(): HlaAlleleLike[];
}
export type HlaHaplotypeConstructor = typeof HlaHaplotype;
//# sourceMappingURL=hla-haplotype.d.ts.map