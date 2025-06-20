import { Logger } from './index.js';
export interface AuditEvent {
    action: string;
    resource: {
        type: 'database' | 'collection' | 'query' | 'aggregation';
        database?: string;
        collection?: string;
    };
    metadata: {
        operationId: string;
        toolName: string;
        userId?: string;
        sessionId?: string;
        timestamp: string;
        duration?: number;
        success: boolean;
        error?: string;
        query?: any;
        options?: any;
        resultCount?: number;
        cacheHit?: boolean;
    };
}
export declare class AuditLogger {
    private logger;
    private events;
    private readonly maxEvents;
    constructor(logger: Logger);
    logToolExecution(event: Omit<AuditEvent, 'metadata'> & {
        metadata: Omit<AuditEvent['metadata'], 'timestamp'>;
    }): void;
    logSecurityEvent(event: 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_QUERY' | 'RATE_LIMIT_EXCEEDED' | 'BLOCKED_OPERATION', details: {
        toolName?: string;
        database?: string;
        collection?: string;
        query?: any;
        reason: string;
        userId?: string;
    }): void;
    logPerformanceEvent(operationId: string, toolName: string, duration: number, metadata: {
        database?: string;
        collection?: string;
        resultCount?: number;
        cacheHit?: boolean;
        slow?: boolean;
    }): void;
    getEvents(filter?: {
        action?: string;
        toolName?: string;
        database?: string;
        collection?: string;
        success?: boolean;
        since?: Date;
        limit?: number;
    }): AuditEvent[];
    getStats(since?: Date): {
        totalEvents: number;
        successfulOperations: number;
        failedOperations: number;
        toolCounts: Record<string, number>;
        errorCounts: Record<string, number>;
        databaseCounts: Record<string, number>;
    };
    clearEvents(): void;
}
export declare function createAuditLogger(logger: Logger): AuditLogger;
//# sourceMappingURL=audit.d.ts.map