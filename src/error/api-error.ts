const stringifyCause = (cause: unknown): string => {
    if (cause instanceof Error) {
        return cause.message;
    }

    return String(cause);
};

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly cause: unknown;

    public constructor(message: string, statusCode: number = 500, fromException?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.cause = fromException;
    }

    public override toString(): string {
        let fullMessage = `${this.message}\nStatus Code: ${this.statusCode}`;

        let currentCause = this.cause;
        while (currentCause !== undefined && currentCause !== null) {
            fullMessage += `\nCaused by: ${stringifyCause(currentCause)}`;

            if (currentCause instanceof Error && 'cause' in currentCause) {
                currentCause = currentCause.cause;
                continue;
            }

            break;
        }

        return fullMessage;
    }
}
