import { MongoClient } from 'mongodb';
import { createQueryCache } from '../cache/index.js';
import { createPerformanceMonitor } from '../performance/metrics.js';
import { createRateLimiter } from '../rate-limit/index.js';
import { createLogger } from '../logging/index.js';
import { createAuditLogger } from '../logging/audit.js';
import { withTimeout } from '../performance/timeout.js';
import { withReadTransaction, withSession } from '../transactions/readonly.js';
export class EnhancedMongoDBConnection {
    client = null;
    isConnected = false;
    connectionConfig;
    cache;
    performanceMonitor;
    rateLimiter;
    logger;
    auditLogger;
    healthCheckInterval = null;
    constructor(config) {
        this.connectionConfig = config;
        const enhanced = config.enhanced || {};
        this.cache = createQueryCache(enhanced.cache);
        this.performanceMonitor = createPerformanceMonitor(enhanced.performance);
        this.rateLimiter = createRateLimiter(enhanced.rateLimit);
        this.logger = createLogger(enhanced.logging);
        this.auditLogger = createAuditLogger(this.logger);
        this.startHealthCheck();
    }
    startHealthCheck() {
        const interval = this.connectionConfig.enhanced?.performance?.connectionHealthCheckInterval || 60000;
        this.healthCheckInterval = setInterval(async () => {
            if (this.isConnected) {
                try {
                    const isHealthy = await this.ping();
                    if (!isHealthy) {
                        this.logger.warn('Health check failed, attempting reconnection');
                        await this.reconnect();
                    }
                }
                catch (error) {
                    this.logger.error('Health check error', error);
                }
            }
        }, interval);
    }
    async connect() {
        if (this.isConnected && this.client) {
            return;
        }
        const operationId = this.performanceMonitor.startOperation('connect', 'system', 'connection');
        try {
            const options = {
                maxPoolSize: 10,
                minPoolSize: 2,
                maxIdleTimeMS: 30000,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4,
                ...this.connectionConfig.options,
            };
            this.client = new MongoClient(this.connectionConfig.uri, options);
            const timeout = this.connectionConfig.enhanced?.performance?.defaultTimeout || 30000;
            await withTimeout(this.client.connect(), timeout, 'Connection timeout');
            this.isConnected = true;
            this.logger.info('MongoDB connection established', {
                operationId,
                database: this.connectionConfig.database || undefined,
            });
            this.performanceMonitor.endOperation(operationId, true);
            this.auditLogger.logToolExecution({
                action: 'CONNECT',
                resource: {
                    type: 'database',
                    database: this.connectionConfig.database || undefined
                },
                metadata: {
                    operationId,
                    toolName: 'connection',
                    success: true,
                },
            });
        }
        catch (error) {
            this.isConnected = false;
            this.performanceMonitor.endOperation(operationId, false, {
                error: error.message
            });
            this.logger.error('Failed to connect to MongoDB', error, { operationId });
            throw new Error(`Failed to connect to MongoDB: ${error}`);
        }
    }
    async disconnect() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.isConnected = false;
        }
        this.cache.close();
        this.logger.close();
    }
    async reconnect() {
        await this.disconnect();
        await this.connect();
    }
    getDatabase(databaseName) {
        if (!this.client || !this.isConnected) {
            throw new Error('MongoDB client is not connected');
        }
        const dbName = databaseName || this.connectionConfig.database;
        if (!dbName) {
            throw new Error('Database name is required');
        }
        return this.client.db(dbName);
    }
    getClient() {
        if (!this.client || !this.isConnected) {
            throw new Error('MongoDB client is not connected');
        }
        return this.client;
    }
    isConnectionActive() {
        return this.isConnected && this.client !== null;
    }
    async ping() {
        try {
            if (!this.client || !this.isConnected) {
                return false;
            }
            await this.client.db('admin').command({ ping: 1 });
            return true;
        }
        catch {
            return false;
        }
    }
    async ensureConnection() {
        if (!this.isConnectionActive()) {
            await this.connect();
        }
        const isAlive = await this.ping();
        if (!isAlive) {
            await this.reconnect();
        }
    }
    async checkRateLimit(toolName) {
        await this.rateLimiter.checkLimit(toolName);
    }
    getCache() {
        return this.cache;
    }
    getPerformanceMonitor() {
        return this.performanceMonitor;
    }
    getRateLimiter() {
        return this.rateLimiter;
    }
    getLogger() {
        return this.logger;
    }
    getAuditLogger() {
        return this.auditLogger;
    }
    async withReadTransaction(operation) {
        if (!this.client) {
            throw new Error('MongoDB client is not connected');
        }
        return withReadTransaction(this.client, operation);
    }
    async withSession(operation) {
        if (!this.client) {
            throw new Error('MongoDB client is not connected');
        }
        return withSession(this.client, operation);
    }
    getConnectionStats() {
        return {
            isConnected: this.isConnected,
            database: this.connectionConfig.database,
            cacheStats: this.cache.getStats(),
            performanceStats: this.performanceMonitor.getStats(),
            rateLimitStats: this.rateLimiter.getStats(),
            auditStats: this.auditLogger.getStats(),
        };
    }
}
//# sourceMappingURL=enhanced-connection.js.map