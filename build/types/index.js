import { z } from 'zod';
export const CacheConfigSchema = z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().default(300),
    maxKeys: z.number().default(1000),
    checkPeriod: z.number().default(120),
});
export const RateLimitConfigSchema = z.object({
    enabled: z.boolean().default(true),
    tokensPerInterval: z.number().default(100),
    interval: z.string().default('hour'),
    fireImmediately: z.boolean().default(false),
});
export const LoggingConfigSchema = z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'simple']).default('json'),
    auditEnabled: z.boolean().default(true),
    performanceLogging: z.boolean().default(true),
});
export const PerformanceConfigSchema = z.object({
    metricsEnabled: z.boolean().default(true),
    defaultTimeout: z.number().default(30000),
    slowQueryThreshold: z.number().default(1000),
    connectionHealthCheckInterval: z.number().default(60000),
});
export const EnhancedConfigSchema = z.object({
    cache: CacheConfigSchema.optional(),
    rateLimit: RateLimitConfigSchema.optional(),
    logging: LoggingConfigSchema.optional(),
    performance: PerformanceConfigSchema.optional(),
});
export const MongoConnectionConfigSchema = z.object({
    uri: z.string(),
    database: z.string().optional(),
    options: z.record(z.any()).optional(),
    enhanced: EnhancedConfigSchema.optional(),
});
export const QueryArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
    query: z.record(z.any()),
    options: z.record(z.any()).optional(),
});
export const AggregateArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
    pipeline: z.array(z.record(z.any())),
    options: z.record(z.any()).optional(),
});
export const ListCollectionsArgsSchema = z.object({
    database: z.string(),
});
export const GetIndexesArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
});
export const ExplainArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
    query: z.record(z.any()),
    options: z.record(z.any()).optional(),
});
export const StatsArgsSchema = z.object({
    database: z.string(),
    collection: z.string().optional(),
});
//# sourceMappingURL=index.js.map