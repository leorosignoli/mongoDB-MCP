import { RateLimiter } from 'limiter';
import { RateLimitConfig } from '../types/index.js';

export class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ToolRateLimiter {
  private limiters: Map<string, RateLimiter> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getLimiter(toolName: string): RateLimiter {
    if (!this.limiters.has(toolName)) {
      const limiter = new RateLimiter({
        tokensPerInterval: this.config.tokensPerInterval,
        interval: this.config.interval as any,
        fireImmediately: this.config.fireImmediately,
      });
      this.limiters.set(toolName, limiter);
    }
    
    return this.limiters.get(toolName)!;
  }

  async checkLimit(toolName: string): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const limiter = this.getLimiter(toolName);
    const remainingRequests = await limiter.removeTokens(1);
    
    if (remainingRequests < 0) {
      const retryAfter = this.getRetryAfterSeconds();
      throw new RateLimitError(
        `Rate limit exceeded for tool '${toolName}'. Retry after ${retryAfter} seconds.`,
        retryAfter
      );
    }
  }

  private getRetryAfterSeconds(): number {
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

  getRemainingTokens(toolName: string): number {
    if (!this.config.enabled) {
      return this.config.tokensPerInterval;
    }

    const limiter = this.getLimiter(toolName);
    return limiter.getTokensRemaining();
  }

  getStats(): Record<string, { remainingTokens: number; interval: string; tokensPerInterval: number }> {
    const stats: Record<string, any> = {};
    
    for (const [toolName, limiter] of this.limiters.entries()) {
      stats[toolName] = {
        remainingTokens: limiter.getTokensRemaining(),
        interval: this.config.interval,
        tokensPerInterval: this.config.tokensPerInterval,
      };
    }
    
    return stats;
  }

  reset(toolName?: string): void {
    if (toolName) {
      this.limiters.delete(toolName);
    } else {
      this.limiters.clear();
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}

export function createRateLimiter(config?: RateLimitConfig): ToolRateLimiter {
  const defaultConfig: RateLimitConfig = {
    enabled: true,
    tokensPerInterval: 100,
    interval: 'hour',
    fireImmediately: false,
  };

  return new ToolRateLimiter(config || defaultConfig);
}