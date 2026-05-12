export class Singleton {
    static instances = new Map();
    constructor() {
        const ctor = this.constructor;
        const existing = Singleton.instances.get(ctor);
        if (existing !== undefined) {
            return existing;
        }
        Singleton.instances.set(ctor, this);
    }
}
//# sourceMappingURL=singleton.js.map