import { describe, expect, it } from 'vitest';
import { HlaAllele, HlaLocus } from '../src/index.js';

const expectOk = <T>(result: { ok: boolean; value?: T; error?: Error }): T => {
    expect(result.ok).toBe(true);
    return result.value as T;
};

describe('HlaAllele', () => {
    it('parses valid allele strings', () => {
        const allele = expectOk(HlaAllele.fromString('A*01:01:01'));
        expect(allele.locus).toBe(HlaLocus.A);
        expect(allele.specificity).toBe('01:01:01');
        expect(allele.fieldCount).toBe(3);
    });

    it('maps B3/B4/B5 aliases into DRB loci', () => {
        const allele = expectOk(HlaAllele.fromString('B3*02:01'));
        expect(allele.locus).toBe(HlaLocus.DRB3);
        expect(allele.displaySpecificity()).toBe('B3*02:01');
    });

    it('handles negative and missing specificities', () => {
        const negative = expectOk(HlaAllele.fromString('NEGATIVE'));
        const missing = expectOk(HlaAllele.fromString('MISSING'));
        expect(negative.isNegative).toBe(true);
        expect(missing.isMissing).toBe(true);
        expect(negative.locus).toBe(HlaLocus.DRB345);
        expect(missing.locus).toBe(HlaLocus.DRB345);
    });

    it('rejects malformed alleles', () => {
        const result = HlaAllele.fromString('A0101');
        expect(result.ok).toBe(false);
    });

    it('detects MAC codes and suffixes', () => {
        const mac = expectOk(HlaAllele.fromString('A*01:AB'));
        const suffix = expectOk(HlaAllele.fromString('A*01:01N'));
        expect(mac.hasMacCode).toBe(true);
        expect(suffix.hasSuffix).toBe(true);
        expect(suffix.isNull).toBe(true);
    });

    it('compares allele containment', () => {
        const high = expectOk(HlaAllele.fromString('A*01:01:01'));
        const low = expectOk(HlaAllele.fromString('A*01:01'));
        expect(high.contains(low)).toBe(true);
        expect(low.contains(high)).toBe(false);
    });

    it('returns resolution variants', () => {
        const allele = expectOk(HlaAllele.fromString('A*01:01:01'));
        const resolution = expectOk(allele.asResolution(2));
        expect(resolution.fieldCount).toBe(2);
        expect(resolution.isHighResolution).toBe(true);
    });
});
