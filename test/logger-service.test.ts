import { describe, expect, it, vi } from 'vitest';
import { LoggerService, type LoggerAdapter } from '../src/index.js';

describe('LoggerService', () => {
    it('reuses the same instance for the same logger name', () => {
        const first = new LoggerService({ name: 'same' });
        const second = new LoggerService({ name: 'same' });
        expect(first).toBe(second);
    });

    it('uses injected adapter factory', () => {
        const debug = vi.fn();
        const info = vi.fn();
        const warn = vi.fn();
        const error = vi.fn();

        const adapter: LoggerAdapter = { debug, info, warn, error };
        const service = new LoggerService({
            name: 'injected',
            adapterFactory: () => adapter,
        });

        service.getLogger().info('hello');
        expect(info).toHaveBeenCalledWith('hello');
    });
});
