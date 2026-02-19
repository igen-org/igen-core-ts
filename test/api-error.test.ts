import { describe, expect, it } from 'vitest';
import { ApiError } from '../src/index.js';

describe('ApiError', () => {
    it('includes status and causes in string output', () => {
        const cause = new Error('inner');
        const error = new ApiError('top', 400, cause);
        expect(error.toString()).toContain('top');
        expect(error.toString()).toContain('Status Code: 400');
        expect(error.toString()).toContain('Caused by: inner');
    });
});
