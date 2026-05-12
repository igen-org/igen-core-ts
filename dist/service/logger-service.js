const LEVEL_ORDER = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
const defaultAdapterFactory = (name, level) => {
    const shouldLog = (target) => LEVEL_ORDER[target] >= LEVEL_ORDER[level];
    return {
        debug: (...args) => {
            if (shouldLog('debug')) {
                console.debug(`[${name}]`, ...args);
            }
        },
        info: (...args) => {
            if (shouldLog('info')) {
                console.info(`[${name}]`, ...args);
            }
        },
        warn: (...args) => {
            if (shouldLog('warn')) {
                console.warn(`[${name}]`, ...args);
            }
        },
        error: (...args) => {
            if (shouldLog('error')) {
                console.error(`[${name}]`, ...args);
            }
        },
    };
};
export class LoggerService {
    static instances = new Map();
    logger;
    name;
    level;
    constructor(options = {}) {
        const name = options.name ?? 'app';
        const existing = LoggerService.instances.get(name);
        if (existing) {
            return existing;
        }
        this.name = name;
        this.level = options.level ?? 'info';
        this.logger = (options.adapterFactory ?? defaultAdapterFactory)(this.name, this.level);
        LoggerService.instances.set(name, this);
    }
    getLogger() {
        return this.logger;
    }
}
//# sourceMappingURL=logger-service.js.map