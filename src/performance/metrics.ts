import { PerformanceConfig } from '../types/index.js';

export interface OperationMetrics {
  operationName: string;
  database: string;
  collection: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  cacheHit?: boolean;
  error?: string;
  documentsReturned?: number;
  bytesReturned?: number;
}

export interface PerformanceStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  slowQueries: number;
  cacheHitRate: number;
  operationCounts: Record<string, number>;
  errorCounts: Record<string, number>;
}

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: OperationMetrics[] = [];
  private readonly maxMetricsHistory = 10000;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  startOperation(operationName: string, database: string, collection: string): string {
    if (!this.config.metricsEnabled) {
      return '';
    }

    const operationId = `${operationName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const metric: OperationMetrics = {
      operationName,
      database,
      collection,
      startTime: Date.now(),
      success: false,
    };

    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    return operationId;
  }

  endOperation(
    operationId: string, 
    success: boolean, 
    options?: {
      error?: string;
      documentsReturned?: number;
      bytesReturned?: number;
      cacheHit?: boolean;
    }
  ): void {
    if (!this.config.metricsEnabled || !operationId) {
      return;
    }

    const metric = this.metrics.find(m => 
      operationId.startsWith(`${m.operationName}-${m.startTime}`)
    );

    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = success;
      metric.cacheHit = options?.cacheHit || undefined;
      metric.error = options?.error || undefined;
      metric.documentsReturned = options?.documentsReturned || undefined;
      metric.bytesReturned = options?.bytesReturned || undefined;
    }
  }

  isSlowQuery(duration: number): boolean {
    return duration > this.config.slowQueryThreshold;
  }

  getStats(since?: number): PerformanceStats {
    const sinceTime = since || (Date.now() - 3600000);
    const recentMetrics = this.metrics.filter(m => 
      m.startTime >= sinceTime && m.endTime && m.duration !== undefined
    );

    const totalOperations = recentMetrics.length;
    const successfulOperations = recentMetrics.filter(m => m.success).length;
    const failedOperations = totalOperations - successfulOperations;

    const totalDuration = recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageResponseTime = totalOperations > 0 ? totalDuration / totalOperations : 0;

    const slowQueries = recentMetrics.filter(m => 
      m.duration && this.isSlowQuery(m.duration)
    ).length;

    const cacheHits = recentMetrics.filter(m => m.cacheHit === true).length;
    const cacheTotal = recentMetrics.filter(m => m.cacheHit !== undefined).length;
    const cacheHitRate = cacheTotal > 0 ? cacheHits / cacheTotal : 0;

    const operationCounts: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};

    for (const metric of recentMetrics) {
      operationCounts[metric.operationName] = (operationCounts[metric.operationName] || 0) + 1;
      
      if (!metric.success && metric.error) {
        errorCounts[metric.error] = (errorCounts[metric.error] || 0) + 1;
      }
    }

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageResponseTime,
      slowQueries,
      cacheHitRate,
      operationCounts,
      errorCounts,
    };
  }

  getSlowQueries(limit = 10): OperationMetrics[] {
    return this.metrics
      .filter(m => m.duration && this.isSlowQuery(m.duration))
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }

  getRecentErrors(limit = 10): OperationMetrics[] {
    return this.metrics
      .filter(m => !m.success && m.error)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  isEnabled(): boolean {
    return this.config.metricsEnabled;
  }
}

export function createPerformanceMonitor(config?: PerformanceConfig): PerformanceMonitor {
  const defaultConfig: PerformanceConfig = {
    metricsEnabled: true,
    defaultTimeout: 30000,
    slowQueryThreshold: 1000,
    connectionHealthCheckInterval: 60000,
  };

  return new PerformanceMonitor(config || defaultConfig);
}