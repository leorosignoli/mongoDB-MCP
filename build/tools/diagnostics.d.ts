import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
export declare function getSystemStatus(connection: EnhancedMongoDBConnection): Promise<{
    connection: any;
    cache: any;
    performance: any;
    rateLimit: any;
    audit: any;
    health: any;
}>;
export declare function getDetailedMetrics(connection: EnhancedMongoDBConnection, since?: number): Promise<{
    performance: any;
    audit: any;
    cache: any;
    errors: any[];
}>;
export declare function clearCache(connection: EnhancedMongoDBConnection): Promise<{
    cleared: boolean;
}>;
export declare function resetMetrics(connection: EnhancedMongoDBConnection): Promise<{
    reset: boolean;
}>;
//# sourceMappingURL=diagnostics.d.ts.map