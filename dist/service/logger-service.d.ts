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
export declare class LoggerService {
    private static readonly instances;
    private readonly logger;
    readonly name: string;
    readonly level: LogLevel;
    constructor(options?: LoggerServiceOptions);
    getLogger(): LoggerAdapter;
}
//# sourceMappingURL=logger-service.d.ts.map