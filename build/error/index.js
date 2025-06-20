export class MongoDBMCPError extends Error {
    code;
    operation;
    database;
    collection;
    originalError;
    constructor(message, code, operation, database, collection, originalError) {
        super(message);
        this.code = code;
        this.operation = operation;
        this.database = database;
        this.collection = collection;
        this.originalError = originalError;
        this.name = 'MongoDBMCPError';
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            operation: this.operation,
            database: this.database,
            collection: this.collection,
            originalError: this.originalError?.message,
            stack: this.stack,
        };
    }
}
export class ConnectionError extends MongoDBMCPError {
    constructor(message, originalError) {
        super(message, 'CONNECTION_ERROR', 'connect', undefined, undefined, originalError);
        this.name = 'ConnectionError';
    }
}
export class ValidationError extends MongoDBMCPError {
    constructor(message, operation, originalError) {
        super(message, 'VALIDATION_ERROR', operation, undefined, undefined, originalError);
        this.name = 'ValidationError';
    }
}
export class QueryError extends MongoDBMCPError {
    constructor(message, database, collection, originalError) {
        super(message, 'QUERY_ERROR', 'query', database, collection, originalError);
        this.name = 'QueryError';
    }
}
export class TimeoutError extends MongoDBMCPError {
    constructor(message, operation, database, collection, originalError) {
        super(message, 'TIMEOUT_ERROR', operation, database, collection, originalError);
        this.name = 'TimeoutError';
    }
}
export class RateLimitError extends MongoDBMCPError {
    retryAfter;
    constructor(message, retryAfter, operation) {
        super(message, 'RATE_LIMIT_ERROR', operation);
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
    }
}
export class SecurityError extends MongoDBMCPError {
    constructor(message, operation, database, collection) {
        super(message, 'SECURITY_ERROR', operation, database, collection);
        this.name = 'SecurityError';
    }
}
export function isRetryableError(error) {
    const retryablePatterns = [
        'connection',
        'timeout',
        'network',
        'server selection',
        'socket',
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'MongoNetworkError',
        'MongoServerSelectionError',
    ];
    const errorMessage = error.message.toLowerCase();
    return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}
export async function withRetry(operation, maxRetries = 3, delayMs = 1000, backoffMultiplier = 2) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries || !isRetryableError(lastError)) {
                throw lastError;
            }
            const delay = delayMs * Math.pow(backoffMultiplier, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
export function createErrorContext(operation, database, collection, metadata) {
    return {
        operation,
        database,
        collection,
        timestamp: new Date().toISOString(),
        ...metadata,
    };
}
export function handleMongoError(error, operation, database, collection) {
    if (error instanceof MongoDBMCPError) {
        return error;
    }
    const message = error.message.toLowerCase();
    if (message.includes('connection') || message.includes('network')) {
        return new ConnectionError(`Connection failed: ${error.message}`, error);
    }
    if (message.includes('timeout')) {
        return new TimeoutError(`Operation timed out: ${error.message}`, operation, database, collection, error);
    }
    if (message.includes('validation') || message.includes('invalid')) {
        return new ValidationError(`Validation failed: ${error.message}`, operation, error);
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
        return new SecurityError(`Authentication failed: ${error.message}`, operation, database, collection);
    }
    return new QueryError(`Query execution failed: ${error.message}`, database, collection, error);
}
//# sourceMappingURL=index.js.map