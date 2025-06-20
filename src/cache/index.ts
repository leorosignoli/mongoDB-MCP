import NodeCache from 'node-cache';
import { CacheConfig } from '../types/index.js';

export class QueryCache {
  private cache: NodeCache;
  private config: CacheConfig;
  private hitCount = 0;
  private missCount = 0;

  constructor(config: CacheConfig) {
    this.config = config;
    this.cache = new NodeCache({
      stdTTL: config.ttl,
      maxKeys: config.maxKeys,
      checkperiod: config.checkPeriod,
      useClones: false,
    });

    this.cache.on('set', () => {
      this.onCacheEvent('set');
    });

    this.cache.on('del', () => {
      this.onCacheEvent('delete');
    });

    this.cache.on('expired', () => {
      this.onCacheEvent('expired');
    });
  }

  private onCacheEvent(_event: string): void {
  }

  generateKey(operation: string, database: string, collection: string, query: any, options?: any): string {
    const keyData = {
      operation,
      database,
      collection,
      query,
      options: options || {},
    };
    
    const keyString = JSON.stringify(keyData, Object.keys(keyData).sort());
    return Buffer.from(keyString).toString('base64').substring(0, 64);
  }

  get<T>(key: string): T | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.hitCount++;
      return value;
    } else {
      this.missCount++;
      return undefined;
    }
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (!this.config.enabled) {
      return false;
    }

    return this.cache.set(key, value, ttl || this.config.ttl);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats(): {
    keys: number;
    hits: number;
    misses: number;
    hitRate: number;
    missRate: number;
  } {
    const keys = this.cache.keys().length;
    const total = this.hitCount + this.missCount;
    
    return {
      keys,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      missRate: total > 0 ? this.missCount / total : 0,
    };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  close(): void {
    this.cache.close();
  }
}

export function createQueryCache(config?: CacheConfig): QueryCache {
  const defaultConfig: CacheConfig = {
    enabled: true,
    ttl: 300,
    maxKeys: 1000,
    checkPeriod: 120,
  };

  return new QueryCache(config || defaultConfig);
}