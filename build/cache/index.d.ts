import { CacheConfig } from '../types/index.js';
export declare class QueryCache {
    private cache;
    private config;
    private hitCount;
    private missCount;
    constructor(config: CacheConfig);
    private onCacheEvent;
    generateKey(operation: string, database: string, collection: string, query: any, options?: any): string;
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttl?: number): boolean;
    del(key: string): number;
    flush(): void;
    getStats(): {
        keys: number;
        hits: number;
        misses: number;
        hitRate: number;
        missRate: number;
    };
    isEnabled(): boolean;
    close(): void;
}
export declare function createQueryCache(config?: CacheConfig): QueryCache;
//# sourceMappingURL=index.d.ts.map