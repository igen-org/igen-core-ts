import { describe, expect, it } from 'vitest';
import * as core from '../src/index.js';

describe('index exports', () => {
    it('exposes main public symbols', () => {
        expect(core.HlaAllele).toBeDefined();
        expect(core.HlaHaplotype).toBeDefined();
        expect(core.HlaLocus).toBeDefined();
        expect(core.ApiError).toBeDefined();
        expect(core.LoggerService).toBeDefined();
        expect(core.Singleton).toBeDefined();
    });
});
