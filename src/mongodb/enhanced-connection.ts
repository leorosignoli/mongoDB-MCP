import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { MongoConnectionConfig } from '../types/index.js';
import { QueryCache, createQueryCache } from '../cache/index.js';
import { PerformanceMonitor, createPerformanceMonitor } from '../performance/metrics.js';
import { ToolRateLimiter, createRateLimiter } from '../rate-limit/index.js';
import { Logger, createLogger } from '../logging/index.js';
import { AuditLogger, createAuditLogger } from '../logging/audit.js';
import { withTimeout } from '../performance/timeout.js';
import { withReadTransaction, withSession } from '../transactions/readonly.js';

export class EnhancedMongoDBConnection {
  private client: MongoClient | null = null;
  private isConnected = false;
  private connectionConfig: MongoConnectionConfig;
  private cache: QueryCache;
  private performanceMonitor: PerformanceMonitor;
  private rateLimiter: ToolRateLimiter;
  private logger: Logger;
  private auditLogger: AuditLogger;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: MongoConnectionConfig) {
    this.connectionConfig = config;
    
    const enhanced = config.enhanced || {};
    
    this.cache = createQueryCache(enhanced.cache);
    this.performanceMonitor = createPerformanceMonitor(enhanced.performance);
    this.rateLimiter = createRateLimiter(enhanced.rateLimit);
    this.logger = createLogger(enhanced.logging);
    this.auditLogger = createAuditLogger(this.logger);

    this.startHealthCheck();
  }

  private startHealthCheck(): void {
    const interval = this.connectionConfig.enhanced?.performance?.connectionHealthCheckInterval || 60000;
    
    this.healthCheckInterval = setInterval(async () => {
      if (this.isConnected) {
        try {
          const isHealthy = await this.ping();
          if (!isHealthy) {
            this.logger.warn('Health check failed, attempting reconnection');
            await this.reconnect();
          }
        } catch (error) {
          this.logger.error('Health check error', error as Error);
        }
      }
    }, interval);
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    const operationId = this.performanceMonitor.startOperation('connect', 'system', 'connection');

    try {
      const options: MongoClientOptions = {
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

    } catch (error) {
      this.isConnected = false;
      this.performanceMonitor.endOperation(operationId, false, { 
        error: (error as Error).message 
      });
      
      this.logger.error('Failed to connect to MongoDB', error as Error, { operationId });
      throw new Error(`Failed to connect to MongoDB: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
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

  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  getDatabase(databaseName?: string): Db {
    if (!this.client || !this.isConnected) {
      throw new Error('MongoDB client is not connected');
    }

    const dbName = databaseName || this.connectionConfig.database;
    if (!dbName) {
      throw new Error('Database name is required');
    }

    return this.client.db(dbName);
  }

  getClient(): MongoClient {
    if (!this.client || !this.isConnected) {
      throw new Error('MongoDB client is not connected');
    }
    return this.client;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.client !== null;
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }
      await this.client.db('admin').command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async ensureConnection(): Promise<void> {
    if (!this.isConnectionActive()) {
      await this.connect();
    }

    const isAlive = await this.ping();
    if (!isAlive) {
      await this.reconnect();
    }
  }

  async checkRateLimit(toolName: string): Promise<void> {
    await this.rateLimiter.checkLimit(toolName);
  }

  getCache(): QueryCache {
    return this.cache;
  }

  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  getRateLimiter(): ToolRateLimiter {
    return this.rateLimiter;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getAuditLogger(): AuditLogger {
    return this.auditLogger;
  }

  async withReadTransaction<T>(
    operation: (transaction: any) => Promise<T>
  ): Promise<T> {
    if (!this.client) {
      throw new Error('MongoDB client is not connected');
    }
    
    return withReadTransaction(this.client, operation);
  }

  async withSession<T>(
    operation: (session: any) => Promise<T>
  ): Promise<T> {
    if (!this.client) {
      throw new Error('MongoDB client is not connected');
    }
    
    return withSession(this.client, operation);
  }

  getConnectionStats(): {
    isConnected: boolean;
    database: string | undefined;
    cacheStats: any;
    performanceStats: any;
    rateLimitStats: any;
    auditStats: any;
  } {
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