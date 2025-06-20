import winston from 'winston';
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

export class Logger {
  private winston: winston.Logger;
  private config: LoggingConfig;

  constructor(config: LoggingConfig) {
    this.config = config;
    this.winston = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const format = this.config.format === 'json' 
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.simple()
        );

    return winston.createLogger({
      level: this.config.level,
      format,
      transports: [
        new winston.transports.Console({
          silent: process.env.NODE_ENV === 'test',
        }),
      ],
      exitOnError: false,
    });
  }

  debug(message: string, context?: LogContext): void {
    this.winston.debug(message, context);
  }

  info(message: string, context?: LogContext): void {
    this.winston.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.winston.warn(message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.winston.error(message, {
      ...context,
      errorMessage: error?.message,
      stack: error?.stack,
    });
  }

  performance(message: string, context: LogContext & { duration: number }): void {
    if (!this.config.performanceLogging) {
      return;
    }

    this.winston.info(`[PERFORMANCE] ${message}`, {
      type: 'performance',
      ...context,
    });
  }

  audit(action: string, context: LogContext): void {
    if (!this.config.auditEnabled) {
      return;
    }

    this.winston.info(`[AUDIT] ${action}`, {
      type: 'audit',
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  security(message: string, context?: LogContext): void {
    this.winston.warn(`[SECURITY] ${message}`, {
      type: 'security',
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger(this.config);
    
    const originalDebug = childLogger.debug.bind(childLogger);
    const originalInfo = childLogger.info.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);
    
    childLogger.debug = (message: string, context?: LogContext) => {
      originalDebug(message, { ...defaultContext, ...context });
    };
    
    childLogger.info = (message: string, context?: LogContext) => {
      originalInfo(message, { ...defaultContext, ...context });
    };
    
    childLogger.warn = (message: string, context?: LogContext) => {
      originalWarn(message, { ...defaultContext, ...context });
    };
    
    childLogger.error = (message: string, error?: Error, context?: LogContext) => {
      originalError(message, error, { ...defaultContext, ...context });
    };

    return childLogger;
  }

  setLevel(level: string): void {
    this.winston.level = level;
  }

  close(): void {
    this.winston.close();
  }
}

export function createLogger(config?: LoggingConfig): Logger {
  const defaultConfig: LoggingConfig = {
    level: 'info',
    format: 'json',
    auditEnabled: true,
    performanceLogging: true,
  };

  return new Logger(config || defaultConfig);
}