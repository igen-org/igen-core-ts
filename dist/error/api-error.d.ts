export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly cause: unknown;
    constructor(message: string, statusCode?: number, fromException?: unknown);
    toString(): string;
}
//# sourceMappingURL=api-error.d.ts.map