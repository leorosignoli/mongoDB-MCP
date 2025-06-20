import { LoggingConfig } from '../types/index.js';
export interface LogContext {
    operationId?: string;
    toolName?: string;
    database?: string;
    collection?: string;
    userId?: string;
    duration?: number;
    cacheHit?: boolean;
    error?: string;
    [key: string]: any;
}
export declare class Logger {
    private winston;
    private config;
    constructor(config: LoggingConfig);
    private createWinstonLogger;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    performance(message: string, context: LogContext & {
        duration: number;
    }): void;
    audit(action: string, context: LogContext): void;
    security(message: string, context?: LogContext): void;
    child(defaultContext: LogContext): Logger;
    setLevel(level: string): void;
    close(): void;
}
export declare function createLogger(config?: LoggingConfig): Logger;
//# sourceMappingURL=index.d.ts.map