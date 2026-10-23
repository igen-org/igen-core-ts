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

    it('accepts short NEG/AUS sentinels for the DRB345 family', () => {
        const bareNeg = expectOk(HlaAllele.fromString('NEG'));
        const bareAus = expectOk(HlaAllele.fromString('aus'));
        expect(bareNeg.locus).toBe(HlaLocus.DRB345);
        expect(bareNeg.isNegative).toBe(true);
        expect(bareAus.locus).toBe(HlaLocus.DRB345);
        expect(bareAus.isMissing).toBe(true);

        const drb345 = expectOk(HlaAllele.fromString('DRB345*NEG'));
        const drb3 = expectOk(HlaAllele.fromString('DRB3*neg'));
        const b4 = expectOk(HlaAllele.fromString('B4*NEG'));
        const b5 = expectOk(HlaAllele.fromString('B5*AUS'));
        expect(drb345.locus).toBe(HlaLocus.DRB345);
        expect(drb3.locus).toBe(HlaLocus.DRB3);
        expect(b4.locus).toBe(HlaLocus.DRB4);
        expect(b4.isNegative).toBe(true);
        expect(b5.locus).toBe(HlaLocus.DRB5);
        expect(b5.isMissing).toBe(true);
        expect(HlaAllele.isValidAllele('DRB345*NEG')).toBe(true);
    });

    it('rejects short NEG/AUS sentinels outside the DRB345 family', () => {
        expect(HlaAllele.fromString('A*NEG').ok).toBe(false);
        expect(HlaAllele.fromString('DRB1*AUS').ok).toBe(false);
        expect(HlaAllele.isValidAllele('A*NEG')).toBe(false);
        expect(() => new HlaAllele(HlaLocus.A, 'NEG', 1, null)).toThrow('Invalid specificity: NEG');
    });

    it('does not treat sentinels as MAC codes', () => {
        for (const value of ['DRB345*NEGATIVO', 'NEGATIVE', 'MISSING', 'DRB345*NEG', 'B3*AUS']) {
            const allele = expectOk(HlaAllele.fromString(value));
            expect(allele.macCode).toBeNull();
            expect(allele.hasMacCode).toBe(false);
        }
        expect(HlaAllele.getMacCode('AUSENTE')).toBeNull();
        expect(HlaAllele.getMacCode('01:AB')).toBe('AB');
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

    it('truncates to the requested field count regardless of display field count', () => {
        const allele = expectOk(HlaAllele.fromString('A*01:01:01:01'));
        const oneField = expectOk(allele.asResolution(1));
        const threeFields = expectOk(allele.asResolution(3));
        expect(oneField.allele).toBe('A*01');
        expect(oneField.fieldCount).toBe(1);
        expect(oneField.isLowResolution).toBe(true);
        expect(threeFields.allele).toBe('A*01:01:01');
        expect(threeFields.fieldCount).toBe(3);
    });

    it('keeps or drops the suffix when reducing resolution', () => {
        const allele = expectOk(HlaAllele.fromString('A*01:01:01N'));
        const kept = expectOk(allele.asResolution(2));
        const dropped = expectOk(allele.asResolution(2, false));
        expect(kept.allele).toBe('A*01:01N');
        expect(kept.isNull).toBe(true);
        expect(kept.withoutSuffix().allele).toBe('A*01:01');
        expect(dropped.allele).toBe('A*01:01');
        expect(dropped.hasSuffix).toBe(false);
    });

    it('returns a clone when the requested resolution exceeds the field count', () => {
        const allele = expectOk(HlaAllele.fromString('A*01:01'));
        const resolution = expectOk(allele.asResolution(4));
        expect(resolution).not.toBe(allele);
        expect(resolution.allele).toBe('A*01:01');
    });

    it('rejects resolutions below one field', () => {
        const allele = expectOk(HlaAllele.fromString('A*01:01'));
        expect(allele.asResolution(0).ok).toBe(false);
    });
});
