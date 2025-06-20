import { z } from 'zod';

export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  ttl: z.number().default(300),
  maxKeys: z.number().default(1000),
  checkPeriod: z.number().default(120),
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;

export const RateLimitConfigSchema = z.object({
  enabled: z.boolean().default(true),
  tokensPerInterval: z.number().default(100),
  interval: z.string().default('hour'),
  fireImmediately: z.boolean().default(false),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

export const LoggingConfigSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  format: z.enum(['json', 'simple']).default('json'),
  auditEnabled: z.boolean().default(true),
  performanceLogging: z.boolean().default(true),
});

export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;

export const PerformanceConfigSchema = z.object({
  metricsEnabled: z.boolean().default(true),
  defaultTimeout: z.number().default(30000),
  slowQueryThreshold: z.number().default(1000),
  connectionHealthCheckInterval: z.number().default(60000),
});

export type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;

export const EnhancedConfigSchema = z.object({
  cache: CacheConfigSchema.optional(),
  rateLimit: RateLimitConfigSchema.optional(),
  logging: LoggingConfigSchema.optional(),
  performance: PerformanceConfigSchema.optional(),
});

export type EnhancedConfig = z.infer<typeof EnhancedConfigSchema>;

export const MongoConnectionConfigSchema = z.object({
  uri: z.string(),
  database: z.string().optional(),
  options: z.record(z.any()).optional(),
  enhanced: EnhancedConfigSchema.optional(),
});

export type MongoConnectionConfig = z.infer<typeof MongoConnectionConfigSchema>;

export const QueryArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
  query: z.record(z.any()),
  options: z.record(z.any()).optional(),
});

export type QueryArgs = z.infer<typeof QueryArgsSchema>;

export const AggregateArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
  pipeline: z.array(z.record(z.any())),
  options: z.record(z.any()).optional(),
});

export type AggregateArgs = z.infer<typeof AggregateArgsSchema>;

export const ListCollectionsArgsSchema = z.object({
  database: z.string(),
});

export type ListCollectionsArgs = z.infer<typeof ListCollectionsArgsSchema>;

export const GetIndexesArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
});

export type GetIndexesArgs = z.infer<typeof GetIndexesArgsSchema>;

export const ExplainArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
  query: z.record(z.any()),
  options: z.record(z.any()).optional(),
});

export type ExplainArgs = z.infer<typeof ExplainArgsSchema>;

export const StatsArgsSchema = z.object({
  database: z.string(),
  collection: z.string().optional(),
});

export type StatsArgs = z.infer<typeof StatsArgsSchema>;
