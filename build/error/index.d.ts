export declare class MongoDBMCPError extends Error {
    readonly code: string;
    readonly operation?: string | undefined;
    readonly database?: string | undefined;
    readonly collection?: string | undefined;
    readonly originalError?: Error | undefined;
    constructor(message: string, code: string, operation?: string | undefined, database?: string | undefined, collection?: string | undefined, originalError?: Error | undefined);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        operation: string | undefined;
        database: string | undefined;
        collection: string | undefined;
        originalError: string | undefined;
        stack: string | undefined;
    };
}
export declare class ConnectionError extends MongoDBMCPError {
    constructor(message: string, originalError?: Error);
}
export declare class ValidationError extends MongoDBMCPError {
    constructor(message: string, operation?: string, originalError?: Error);
}
export declare class QueryError extends MongoDBMCPError {
    constructor(message: string, database?: string, collection?: string, originalError?: Error);
}
export declare class TimeoutError extends MongoDBMCPError {
    constructor(message: string, operation?: string, database?: string, collection?: string, originalError?: Error);
}
export declare class RateLimitError extends MongoDBMCPError {
    readonly retryAfter: number;
    constructor(message: string, retryAfter: number, operation?: string);
}
export declare class SecurityError extends MongoDBMCPError {
    constructor(message: string, operation?: string, database?: string, collection?: string);
}
export declare function isRetryableError(error: Error): boolean;
export declare function withRetry<T>(operation: () => Promise<T>, maxRetries?: number, delayMs?: number, backoffMultiplier?: number): Promise<T>;
export declare function createErrorContext(operation: string, database?: string, collection?: string, metadata?: Record<string, any>): Record<string, any>;
export declare function handleMongoError(error: Error, operation: string, database?: string, collection?: string): MongoDBMCPError;
//# sourceMappingURL=index.d.ts.map