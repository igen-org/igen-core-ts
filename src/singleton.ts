type ConstructorKey = abstract new (...args: never[]) => unknown;

export abstract class Singleton {
    private static readonly instances = new Map<ConstructorKey, unknown>();

    protected constructor() {
        const ctor = this.constructor as ConstructorKey;
        const existing = Singleton.instances.get(ctor);
        if (existing !== undefined) {
            return existing as Singleton;
        }

        Singleton.instances.set(ctor, this);
    }
}
