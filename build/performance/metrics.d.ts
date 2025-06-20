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
export declare class PerformanceMonitor {
    private config;
    private metrics;
    private readonly maxMetricsHistory;
    constructor(config: PerformanceConfig);
    startOperation(operationName: string, database: string, collection: string): string;
    endOperation(operationId: string, success: boolean, options?: {
        error?: string;
        documentsReturned?: number;
        bytesReturned?: number;
        cacheHit?: boolean;
    }): void;
    isSlowQuery(duration: number): boolean;
    getStats(since?: number): PerformanceStats;
    getSlowQueries(limit?: number): OperationMetrics[];
    getRecentErrors(limit?: number): OperationMetrics[];
    clearMetrics(): void;
    isEnabled(): boolean;
}
export declare function createPerformanceMonitor(config?: PerformanceConfig): PerformanceMonitor;
//# sourceMappingURL=metrics.d.ts.map