import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';

export async function getSystemStatus(
  connection: EnhancedMongoDBConnection
): Promise<{
  connection: any;
  cache: any;
  performance: any;
  rateLimit: any;
  audit: any;
  health: any;
}> {
  try {
    const connectionStats = connection.getConnectionStats();
    const healthCheck = await connection.ping();
    
    const performanceMonitor = connection.getPerformanceMonitor();
    const slowQueries = performanceMonitor.getSlowQueries(5);
    const recentErrors = performanceMonitor.getRecentErrors(5);

    return {
      connection: {
        isConnected: connectionStats.isConnected,
        database: connectionStats.database,
      },
      cache: connectionStats.cacheStats,
      performance: {
        ...connectionStats.performanceStats,
        slowQueries,
        recentErrors,
      },
      rateLimit: connectionStats.rateLimitStats,
      audit: connectionStats.auditStats,
      health: {
        ping: healthCheck,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new Error(`System status check failed: ${error}`);
  }
}

export async function getDetailedMetrics(
  connection: EnhancedMongoDBConnection,
  since?: number
): Promise<{
  performance: any;
  audit: any;
  cache: any;
  errors: any[];
}> {
  try {
    const performanceMonitor = connection.getPerformanceMonitor();
    const auditLogger = connection.getAuditLogger();
    const cache = connection.getCache();

    const sinceTime = since || (Date.now() - 3600000);
    
    return {
      performance: performanceMonitor.getStats(sinceTime),
      audit: auditLogger.getStats(new Date(sinceTime)),
      cache: cache.getStats(),
      errors: performanceMonitor.getRecentErrors(10),
    };
  } catch (error) {
    throw new Error(`Metrics collection failed: ${error}`);
  }
}

export async function clearCache(connection: EnhancedMongoDBConnection): Promise<{ cleared: boolean }> {
  try {
    const cache = connection.getCache();
    cache.flush();
    
    connection.getLogger().info('Cache cleared manually');
    
    return { cleared: true };
  } catch (error) {
    throw new Error(`Cache clear failed: ${error}`);
  }
}

export async function resetMetrics(connection: EnhancedMongoDBConnection): Promise<{ reset: boolean }> {
  try {
    const performanceMonitor = connection.getPerformanceMonitor();
    const auditLogger = connection.getAuditLogger();
    
    performanceMonitor.clearMetrics();
    auditLogger.clearEvents();
    
    connection.getLogger().info('Metrics reset manually');
    
    return { reset: true };
  } catch (error) {
    throw new Error(`Metrics reset failed: ${error}`);
  }
}