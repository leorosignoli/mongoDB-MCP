import NodeCache from 'node-cache';
export class QueryCache {
    cache;
    config;
    hitCount = 0;
    missCount = 0;
    constructor(config) {
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
    onCacheEvent(_event) {
    }
    generateKey(operation, database, collection, query, options) {
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
    get(key) {
        if (!this.config.enabled) {
            return undefined;
        }
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.hitCount++;
            return value;
        }
        else {
            this.missCount++;
            return undefined;
        }
    }
    set(key, value, ttl) {
        if (!this.config.enabled) {
            return false;
        }
        return this.cache.set(key, value, ttl || this.config.ttl);
    }
    del(key) {
        return this.cache.del(key);
    }
    flush() {
        this.cache.flushAll();
        this.hitCount = 0;
        this.missCount = 0;
    }
    getStats() {
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
    isEnabled() {
        return this.config.enabled;
    }
    close() {
        this.cache.close();
    }
}
export function createQueryCache(config) {
    const defaultConfig = {
        enabled: true,
        ttl: 300,
        maxKeys: 1000,
        checkPeriod: 120,
    };
    return new QueryCache(config || defaultConfig);
}
//# sourceMappingURL=index.js.map