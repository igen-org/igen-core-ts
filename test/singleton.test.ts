import { describe, expect, it } from 'vitest';
import { Singleton } from '../src/index.js';

class DemoSingleton extends Singleton {}
class OtherSingleton extends Singleton {}

describe('Singleton', () => {
    it('returns one instance per subclass', () => {
        const a = new DemoSingleton();
        const b = new DemoSingleton();
        const c = new OtherSingleton();
        expect(a).toBe(b);
        expect(a).not.toBe(c);
    });
});
