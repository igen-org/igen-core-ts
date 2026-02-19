export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerAdapter {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
}

export interface LoggerServiceOptions {
    name?: string;
    level?: LogLevel;
    adapterFactory?: LoggerAdapterFactory;
}

export type LoggerAdapterFactory = (name: string, level: LogLevel) => LoggerAdapter;

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const defaultAdapterFactory: LoggerAdapterFactory = (name: string, level: LogLevel): LoggerAdapter => {
    const shouldLog = (target: LogLevel): boolean => LEVEL_ORDER[target] >= LEVEL_ORDER[level];
    return {
        debug: (...args: unknown[]): void => {
            if (shouldLog('debug')) {
                console.debug(`[${name}]`, ...args);
            }
        },
        info: (...args: unknown[]): void => {
            if (shouldLog('info')) {
                console.info(`[${name}]`, ...args);
            }
        },
        warn: (...args: unknown[]): void => {
            if (shouldLog('warn')) {
                console.warn(`[${name}]`, ...args);
            }
        },
        error: (...args: unknown[]): void => {
            if (shouldLog('error')) {
                console.error(`[${name}]`, ...args);
            }
        },
    };
};

export class LoggerService {
    private static readonly instances = new Map<string, LoggerService>();

    private readonly logger!: LoggerAdapter;
    public readonly name!: string;
    public readonly level!: LogLevel;

    public constructor(options: LoggerServiceOptions = {}) {
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

    public getLogger(): LoggerAdapter {
        return this.logger;
    }
}
