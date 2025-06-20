import { z } from 'zod';
export declare const CacheConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    ttl: z.ZodDefault<z.ZodNumber>;
    maxKeys: z.ZodDefault<z.ZodNumber>;
    checkPeriod: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    ttl: number;
    maxKeys: number;
    checkPeriod: number;
}, {
    enabled?: boolean | undefined;
    ttl?: number | undefined;
    maxKeys?: number | undefined;
    checkPeriod?: number | undefined;
}>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export declare const RateLimitConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    tokensPerInterval: z.ZodDefault<z.ZodNumber>;
    interval: z.ZodDefault<z.ZodString>;
    fireImmediately: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    tokensPerInterval: number;
    interval: string;
    fireImmediately: boolean;
}, {
    enabled?: boolean | undefined;
    tokensPerInterval?: number | undefined;
    interval?: string | undefined;
    fireImmediately?: boolean | undefined;
}>;
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;
export declare const LoggingConfigSchema: z.ZodObject<{
    level: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    format: z.ZodDefault<z.ZodEnum<["json", "simple"]>>;
    auditEnabled: z.ZodDefault<z.ZodBoolean>;
    performanceLogging: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    level: "error" | "warn" | "info" | "debug";
    format: "json" | "simple";
    auditEnabled: boolean;
    performanceLogging: boolean;
}, {
    level?: "error" | "warn" | "info" | "debug" | undefined;
    format?: "json" | "simple" | undefined;
    auditEnabled?: boolean | undefined;
    performanceLogging?: boolean | undefined;
}>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export declare const PerformanceConfigSchema: z.ZodObject<{
    metricsEnabled: z.ZodDefault<z.ZodBoolean>;
    defaultTimeout: z.ZodDefault<z.ZodNumber>;
    slowQueryThreshold: z.ZodDefault<z.ZodNumber>;
    connectionHealthCheckInterval: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    metricsEnabled: boolean;
    defaultTimeout: number;
    slowQueryThreshold: number;
    connectionHealthCheckInterval: number;
}, {
    metricsEnabled?: boolean | undefined;
    defaultTimeout?: number | undefined;
    slowQueryThreshold?: number | undefined;
    connectionHealthCheckInterval?: number | undefined;
}>;
export type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;
export declare const EnhancedConfigSchema: z.ZodObject<{
    cache: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        ttl: z.ZodDefault<z.ZodNumber>;
        maxKeys: z.ZodDefault<z.ZodNumber>;
        checkPeriod: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        ttl: number;
        maxKeys: number;
        checkPeriod: number;
    }, {
        enabled?: boolean | undefined;
        ttl?: number | undefined;
        maxKeys?: number | undefined;
        checkPeriod?: number | undefined;
    }>>;
    rateLimit: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        tokensPerInterval: z.ZodDefault<z.ZodNumber>;
        interval: z.ZodDefault<z.ZodString>;
        fireImmediately: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        tokensPerInterval: number;
        interval: string;
        fireImmediately: boolean;
    }, {
        enabled?: boolean | undefined;
        tokensPerInterval?: number | undefined;
        interval?: string | undefined;
        fireImmediately?: boolean | undefined;
    }>>;
    logging: z.ZodOptional<z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
        format: z.ZodDefault<z.ZodEnum<["json", "simple"]>>;
        auditEnabled: z.ZodDefault<z.ZodBoolean>;
        performanceLogging: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        auditEnabled: boolean;
        performanceLogging: boolean;
    }, {
        level?: "error" | "warn" | "info" | "debug" | undefined;
        format?: "json" | "simple" | undefined;
        auditEnabled?: boolean | undefined;
        performanceLogging?: boolean | undefined;
    }>>;
    performance: z.ZodOptional<z.ZodObject<{
        metricsEnabled: z.ZodDefault<z.ZodBoolean>;
        defaultTimeout: z.ZodDefault<z.ZodNumber>;
        slowQueryThreshold: z.ZodDefault<z.ZodNumber>;
        connectionHealthCheckInterval: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        metricsEnabled: boolean;
        defaultTimeout: number;
        slowQueryThreshold: number;
        connectionHealthCheckInterval: number;
    }, {
        metricsEnabled?: boolean | undefined;
        defaultTimeout?: number | undefined;
        slowQueryThreshold?: number | undefined;
        connectionHealthCheckInterval?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    cache?: {
        enabled: boolean;
        ttl: number;
        maxKeys: number;
        checkPeriod: number;
    } | undefined;
    rateLimit?: {
        enabled: boolean;
        tokensPerInterval: number;
        interval: string;
        fireImmediately: boolean;
    } | undefined;
    logging?: {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        auditEnabled: boolean;
        performanceLogging: boolean;
    } | undefined;
    performance?: {
        metricsEnabled: boolean;
        defaultTimeout: number;
        slowQueryThreshold: number;
        connectionHealthCheckInterval: number;
    } | undefined;
}, {
    cache?: {
        enabled?: boolean | undefined;
        ttl?: number | undefined;
        maxKeys?: number | undefined;
        checkPeriod?: number | undefined;
    } | undefined;
    rateLimit?: {
        enabled?: boolean | undefined;
        tokensPerInterval?: number | undefined;
        interval?: string | undefined;
        fireImmediately?: boolean | undefined;
    } | undefined;
    logging?: {
        level?: "error" | "warn" | "info" | "debug" | undefined;
        format?: "json" | "simple" | undefined;
        auditEnabled?: boolean | undefined;
        performanceLogging?: boolean | undefined;
    } | undefined;
    performance?: {
        metricsEnabled?: boolean | undefined;
        defaultTimeout?: number | undefined;
        slowQueryThreshold?: number | undefined;
        connectionHealthCheckInterval?: number | undefined;
    } | undefined;
}>;
export type EnhancedConfig = z.infer<typeof EnhancedConfigSchema>;
export declare const MongoConnectionConfigSchema: z.ZodObject<{
    uri: z.ZodString;
    database: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    enhanced: z.ZodOptional<z.ZodObject<{
        cache: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            ttl: z.ZodDefault<z.ZodNumber>;
            maxKeys: z.ZodDefault<z.ZodNumber>;
            checkPeriod: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            ttl: number;
            maxKeys: number;
            checkPeriod: number;
        }, {
            enabled?: boolean | undefined;
            ttl?: number | undefined;
            maxKeys?: number | undefined;
            checkPeriod?: number | undefined;
        }>>;
        rateLimit: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            tokensPerInterval: z.ZodDefault<z.ZodNumber>;
            interval: z.ZodDefault<z.ZodString>;
            fireImmediately: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            tokensPerInterval: number;
            interval: string;
            fireImmediately: boolean;
        }, {
            enabled?: boolean | undefined;
            tokensPerInterval?: number | undefined;
            interval?: string | undefined;
            fireImmediately?: boolean | undefined;
        }>>;
        logging: z.ZodOptional<z.ZodObject<{
            level: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
            format: z.ZodDefault<z.ZodEnum<["json", "simple"]>>;
            auditEnabled: z.ZodDefault<z.ZodBoolean>;
            performanceLogging: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            level: "error" | "warn" | "info" | "debug";
            format: "json" | "simple";
            auditEnabled: boolean;
            performanceLogging: boolean;
        }, {
            level?: "error" | "warn" | "info" | "debug" | undefined;
            format?: "json" | "simple" | undefined;
            auditEnabled?: boolean | undefined;
            performanceLogging?: boolean | undefined;
        }>>;
        performance: z.ZodOptional<z.ZodObject<{
            metricsEnabled: z.ZodDefault<z.ZodBoolean>;
            defaultTimeout: z.ZodDefault<z.ZodNumber>;
            slowQueryThreshold: z.ZodDefault<z.ZodNumber>;
            connectionHealthCheckInterval: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            metricsEnabled: boolean;
            defaultTimeout: number;
            slowQueryThreshold: number;
            connectionHealthCheckInterval: number;
        }, {
            metricsEnabled?: boolean | undefined;
            defaultTimeout?: number | undefined;
            slowQueryThreshold?: number | undefined;
            connectionHealthCheckInterval?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        cache?: {
            enabled: boolean;
            ttl: number;
            maxKeys: number;
            checkPeriod: number;
        } | undefined;
        rateLimit?: {
            enabled: boolean;
            tokensPerInterval: number;
            interval: string;
            fireImmediately: boolean;
        } | undefined;
        logging?: {
            level: "error" | "warn" | "info" | "debug";
            format: "json" | "simple";
            auditEnabled: boolean;
            performanceLogging: boolean;
        } | undefined;
        performance?: {
            metricsEnabled: boolean;
            defaultTimeout: number;
            slowQueryThreshold: number;
            connectionHealthCheckInterval: number;
        } | undefined;
    }, {
        cache?: {
            enabled?: boolean | undefined;
            ttl?: number | undefined;
            maxKeys?: number | undefined;
            checkPeriod?: number | undefined;
        } | undefined;
        rateLimit?: {
            enabled?: boolean | undefined;
            tokensPerInterval?: number | undefined;
            interval?: string | undefined;
            fireImmediately?: boolean | undefined;
        } | undefined;
        logging?: {
            level?: "error" | "warn" | "info" | "debug" | undefined;
            format?: "json" | "simple" | undefined;
            auditEnabled?: boolean | undefined;
            performanceLogging?: boolean | undefined;
        } | undefined;
        performance?: {
            metricsEnabled?: boolean | undefined;
            defaultTimeout?: number | undefined;
            slowQueryThreshold?: number | undefined;
            connectionHealthCheckInterval?: number | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    options?: Record<string, any> | undefined;
    database?: string | undefined;
    enhanced?: {
        cache?: {
            enabled: boolean;
            ttl: number;
            maxKeys: number;
            checkPeriod: number;
        } | undefined;
        rateLimit?: {
            enabled: boolean;
            tokensPerInterval: number;
            interval: string;
            fireImmediately: boolean;
        } | undefined;
        logging?: {
            level: "error" | "warn" | "info" | "debug";
            format: "json" | "simple";
            auditEnabled: boolean;
            performanceLogging: boolean;
        } | undefined;
        performance?: {
            metricsEnabled: boolean;
            defaultTimeout: number;
            slowQueryThreshold: number;
            connectionHealthCheckInterval: number;
        } | undefined;
    } | undefined;
}, {
    uri: string;
    options?: Record<string, any> | undefined;
    database?: string | undefined;
    enhanced?: {
        cache?: {
            enabled?: boolean | undefined;
            ttl?: number | undefined;
            maxKeys?: number | undefined;
            checkPeriod?: number | undefined;
        } | undefined;
        rateLimit?: {
            enabled?: boolean | undefined;
            tokensPerInterval?: number | undefined;
            interval?: string | undefined;
            fireImmediately?: boolean | undefined;
        } | undefined;
        logging?: {
            level?: "error" | "warn" | "info" | "debug" | undefined;
            format?: "json" | "simple" | undefined;
            auditEnabled?: boolean | undefined;
            performanceLogging?: boolean | undefined;
        } | undefined;
        performance?: {
            metricsEnabled?: boolean | undefined;
            defaultTimeout?: number | undefined;
            slowQueryThreshold?: number | undefined;
            connectionHealthCheckInterval?: number | undefined;
        } | undefined;
    } | undefined;
}>;
export type MongoConnectionConfig = z.infer<typeof MongoConnectionConfigSchema>;
export declare const QueryArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
    query: z.ZodRecord<z.ZodString, z.ZodAny>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}>;
export type QueryArgs = z.infer<typeof QueryArgsSchema>;
export declare const AggregateArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
    pipeline: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
    pipeline: Record<string, any>[];
    options?: Record<string, any> | undefined;
}, {
    database: string;
    collection: string;
    pipeline: Record<string, any>[];
    options?: Record<string, any> | undefined;
}>;
export type AggregateArgs = z.infer<typeof AggregateArgsSchema>;
export declare const ListCollectionsArgsSchema: z.ZodObject<{
    database: z.ZodString;
}, "strip", z.ZodTypeAny, {
    database: string;
}, {
    database: string;
}>;
export type ListCollectionsArgs = z.infer<typeof ListCollectionsArgsSchema>;
export declare const GetIndexesArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
}, {
    database: string;
    collection: string;
}>;
export type GetIndexesArgs = z.infer<typeof GetIndexesArgsSchema>;
export declare const ExplainArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
    query: z.ZodRecord<z.ZodString, z.ZodAny>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}>;
export type ExplainArgs = z.infer<typeof ExplainArgsSchema>;
export declare const StatsArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection?: string | undefined;
}, {
    database: string;
    collection?: string | undefined;
}>;
export type StatsArgs = z.infer<typeof StatsArgsSchema>;
//# sourceMappingURL=index.d.ts.map