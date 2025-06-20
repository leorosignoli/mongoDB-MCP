import { RateLimiter } from 'limiter';
export class RateLimitError extends Error {
    retryAfter;
    constructor(message, retryAfter) {
        super(message);
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
    }
}
export class ToolRateLimiter {
    limiters = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    getLimiter(toolName) {
        if (!this.limiters.has(toolName)) {
            const limiter = new RateLimiter({
                tokensPerInterval: this.config.tokensPerInterval,
                interval: this.config.interval,
                fireImmediately: this.config.fireImmediately,
            });
            this.limiters.set(toolName, limiter);
        }
        return this.limiters.get(toolName);
    }
    async checkLimit(toolName) {
        if (!this.config.enabled) {
            return;
        }
        const limiter = this.getLimiter(toolName);
        const remainingRequests = await limiter.removeTokens(1);
        if (remainingRequests < 0) {
            const retryAfter = this.getRetryAfterSeconds();
            throw new RateLimitError(`Rate limit exceeded for tool '${toolName}'. Retry after ${retryAfter} seconds.`, retryAfter);
        }
    }
    getRetryAfterSeconds() {
        switch (this.config.interval) {
            case 'second':
                return 1;
            case 'minute':
                return 60;
            case 'hour':
                return 3600;
            case 'day':
                return 86400;
            default:
                return 60;
        }
    }
    getRemainingTokens(toolName) {
        if (!this.config.enabled) {
            return this.config.tokensPerInterval;
        }
        const limiter = this.getLimiter(toolName);
        return limiter.getTokensRemaining();
    }
    getStats() {
        const stats = {};
        for (const [toolName, limiter] of this.limiters.entries()) {
            stats[toolName] = {
                remainingTokens: limiter.getTokensRemaining(),
                interval: this.config.interval,
                tokensPerInterval: this.config.tokensPerInterval,
            };
        }
        return stats;
    }
    reset(toolName) {
        if (toolName) {
            this.limiters.delete(toolName);
        }
        else {
            this.limiters.clear();
        }
    }
    isEnabled() {
        return this.config.enabled;
    }
}
export function createRateLimiter(config) {
    const defaultConfig = {
        enabled: true,
        tokensPerInterval: 100,
        interval: 'hour',
        fireImmediately: false,
    };
    return new ToolRateLimiter(config || defaultConfig);
}
//# sourceMappingURL=index.js.map