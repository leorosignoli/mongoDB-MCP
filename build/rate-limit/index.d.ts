import { RateLimitConfig } from '../types/index.js';
export declare class RateLimitError extends Error {
    readonly retryAfter: number;
    constructor(message: string, retryAfter: number);
}
export declare class ToolRateLimiter {
    private limiters;
    private config;
    constructor(config: RateLimitConfig);
    private getLimiter;
    checkLimit(toolName: string): Promise<void>;
    private getRetryAfterSeconds;
    getRemainingTokens(toolName: string): number;
    getStats(): Record<string, {
        remainingTokens: number;
        interval: string;
        tokensPerInterval: number;
    }>;
    reset(toolName?: string): void;
    isEnabled(): boolean;
}
export declare function createRateLimiter(config?: RateLimitConfig): ToolRateLimiter;
//# sourceMappingURL=index.d.ts.map