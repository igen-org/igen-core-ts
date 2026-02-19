import { describe, expect, it } from 'vitest';
import { HlaAllele, HlaHaplotype, HlaLocus } from '../src/index.js';

const expectOk = <T>(result: { ok: boolean; value?: T }): T => {
    expect(result.ok).toBe(true);
    return result.value as T;
};

describe('HlaHaplotype', () => {
    it('creates from string', () => {
        const haplotype = expectOk(HlaHaplotype.create('A*01:01+B*08:01'));
        expect(haplotype.alleles).toHaveLength(2);
        expect(haplotype.toString()).toBe('A*01:01+B*08:01');
    });

    it('normalizes DRB3/4/5 under DRB345 key', () => {
        const haplotype = expectOk(HlaHaplotype.create('B3*01:01'));
        expect(haplotype.get(HlaLocus.DRB345)?.locus).toBe(HlaLocus.DRB3);
        expect(haplotype.get(HlaLocus.DRB4, true)).toBeNull();
    });

    it('set is immutable and no-op on mismatch', () => {
        const haplotype = expectOk(HlaHaplotype.create('A*01:01+B*08:01'));
        const dqb = expectOk(HlaAllele.fromString('DQB1*06:02'));
        const next = haplotype.set(HlaLocus.A, dqb);
        expect(next).toBe(haplotype);
    });

    it('swaps allele values between haplotypes', () => {
        const h1 = expectOk(HlaHaplotype.create('A*01:01+B*08:01'));
        const h2 = expectOk(HlaHaplotype.create('A*02:01+B*44:02'));

        const [n1, n2] = h1.swap(h2, HlaLocus.A);
        expect(n1.get(HlaLocus.A)?.allele).toBe('A*02:01');
        expect(n2.get(HlaLocus.A)?.allele).toBe('A*01:01');
    });
});
