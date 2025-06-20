import { MongoClient, Db } from 'mongodb';
import { MongoConnectionConfig } from '../types/index.js';
import { QueryCache } from '../cache/index.js';
import { PerformanceMonitor } from '../performance/metrics.js';
import { ToolRateLimiter } from '../rate-limit/index.js';
import { Logger } from '../logging/index.js';
import { AuditLogger } from '../logging/audit.js';
export declare class EnhancedMongoDBConnection {
    private client;
    private isConnected;
    private connectionConfig;
    private cache;
    private performanceMonitor;
    private rateLimiter;
    private logger;
    private auditLogger;
    private healthCheckInterval;
    constructor(config: MongoConnectionConfig);
    private startHealthCheck;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    reconnect(): Promise<void>;
    getDatabase(databaseName?: string): Db;
    getClient(): MongoClient;
    isConnectionActive(): boolean;
    ping(): Promise<boolean>;
    ensureConnection(): Promise<void>;
    checkRateLimit(toolName: string): Promise<void>;
    getCache(): QueryCache;
    getPerformanceMonitor(): PerformanceMonitor;
    getRateLimiter(): ToolRateLimiter;
    getLogger(): Logger;
    getAuditLogger(): AuditLogger;
    withReadTransaction<T>(operation: (transaction: any) => Promise<T>): Promise<T>;
    withSession<T>(operation: (session: any) => Promise<T>): Promise<T>;
    getConnectionStats(): {
        isConnected: boolean;
        database: string | undefined;
        cacheStats: any;
        performanceStats: any;
        rateLimitStats: any;
        auditStats: any;
    };
}
//# sourceMappingURL=enhanced-connection.d.ts.map