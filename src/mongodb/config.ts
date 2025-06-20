import { 
  MongoConnectionConfig, 
  EnhancedConfig,
  CacheConfigSchema,
  RateLimitConfigSchema,
  LoggingConfigSchema,
  PerformanceConfigSchema,
} from '../types/index.js';

export function parseConnectionString(uri: string): MongoConnectionConfig {
  try {
    const url = new URL(uri);
    
    const config: MongoConnectionConfig = {
      uri,
      database: url.pathname.substring(1) || undefined,
      options: {},
    };

    url.searchParams.forEach((value, key) => {
      if (config.options) {
        switch (key) {
          case 'maxPoolSize':
          case 'minPoolSize':
          case 'maxIdleTimeMS':
          case 'serverSelectionTimeoutMS':
          case 'socketTimeoutMS':
            config.options[key] = parseInt(value, 10);
            break;
          case 'ssl':
          case 'tls':
            config.options[key] = value === 'true';
            break;
          default:
            config.options[key] = value;
        }
      }
    });

    return config;
  } catch (error) {
    throw new Error(`Invalid MongoDB connection string: ${error}`);
  }
}

function getEnhancedConfig(): EnhancedConfig {
  const config: EnhancedConfig = {};

  if (process.env.CACHE_ENABLED !== undefined || 
      process.env.CACHE_TTL !== undefined ||
      process.env.CACHE_MAX_KEYS !== undefined ||
      process.env.CACHE_CHECK_PERIOD !== undefined) {
    config.cache = CacheConfigSchema.parse({
      enabled: process.env.CACHE_ENABLED === 'true',
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : undefined,
      maxKeys: process.env.CACHE_MAX_KEYS ? parseInt(process.env.CACHE_MAX_KEYS, 10) : undefined,
      checkPeriod: process.env.CACHE_CHECK_PERIOD ? parseInt(process.env.CACHE_CHECK_PERIOD, 10) : undefined,
    });
  }

  if (process.env.RATE_LIMIT_ENABLED !== undefined ||
      process.env.RATE_LIMIT_TOKENS !== undefined ||
      process.env.RATE_LIMIT_INTERVAL !== undefined) {
    config.rateLimit = RateLimitConfigSchema.parse({
      enabled: process.env.RATE_LIMIT_ENABLED === 'true',
      tokensPerInterval: process.env.RATE_LIMIT_TOKENS ? parseInt(process.env.RATE_LIMIT_TOKENS, 10) : undefined,
      interval: process.env.RATE_LIMIT_INTERVAL || undefined,
      fireImmediately: process.env.RATE_LIMIT_FIRE_IMMEDIATELY === 'true',
    });
  }

  if (process.env.LOG_LEVEL !== undefined ||
      process.env.LOG_FORMAT !== undefined ||
      process.env.AUDIT_ENABLED !== undefined ||
      process.env.PERFORMANCE_LOGGING !== undefined) {
    config.logging = LoggingConfigSchema.parse({
      level: process.env.LOG_LEVEL as any || undefined,
      format: process.env.LOG_FORMAT as any || undefined,
      auditEnabled: process.env.AUDIT_ENABLED === 'true',
      performanceLogging: process.env.PERFORMANCE_LOGGING === 'true',
    });
  }

  if (process.env.METRICS_ENABLED !== undefined ||
      process.env.DEFAULT_TIMEOUT !== undefined ||
      process.env.SLOW_QUERY_THRESHOLD !== undefined ||
      process.env.HEALTH_CHECK_INTERVAL !== undefined) {
    config.performance = PerformanceConfigSchema.parse({
      metricsEnabled: process.env.METRICS_ENABLED === 'true',
      defaultTimeout: process.env.DEFAULT_TIMEOUT ? parseInt(process.env.DEFAULT_TIMEOUT, 10) : undefined,
      slowQueryThreshold: process.env.SLOW_QUERY_THRESHOLD ? parseInt(process.env.SLOW_QUERY_THRESHOLD, 10) : undefined,
      connectionHealthCheckInterval: process.env.HEALTH_CHECK_INTERVAL ? parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) : undefined,
    });
  }

  return config;
}

export function getConnectionConfig(): MongoConnectionConfig {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const baseConfig = parseConnectionString(uri);
  const enhancedConfig = getEnhancedConfig();
  
  return {
    ...baseConfig,
    enhanced: enhancedConfig,
  };
}

export function validateConnectionConfig(config: MongoConnectionConfig): void {
  if (!config.uri) {
    throw new Error('MongoDB URI is required');
  }

  if (!config.uri.startsWith('mongodb://') && !config.uri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI format');
  }

  if (config.options) {
    if (config.options.maxPoolSize && config.options.maxPoolSize < 1) {
      throw new Error('maxPoolSize must be at least 1');
    }
    
    if (config.options.minPoolSize && config.options.minPoolSize < 0) {
      throw new Error('minPoolSize cannot be negative');
    }
    
    if (config.options.maxPoolSize && config.options.minPoolSize && 
        config.options.maxPoolSize < config.options.minPoolSize) {
      throw new Error('maxPoolSize must be greater than or equal to minPoolSize');
    }
  }
}