import winston from 'winston';
export class Logger {
    winston;
    config;
    constructor(config) {
        this.config = config;
        this.winston = this.createWinstonLogger();
    }
    createWinstonLogger() {
        const format = this.config.format === 'json'
            ? winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json())
            : winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.simple());
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
    debug(message, context) {
        this.winston.debug(message, context);
    }
    info(message, context) {
        this.winston.info(message, context);
    }
    warn(message, context) {
        this.winston.warn(message, context);
    }
    error(message, error, context) {
        this.winston.error(message, {
            ...context,
            errorMessage: error?.message,
            stack: error?.stack,
        });
    }
    performance(message, context) {
        if (!this.config.performanceLogging) {
            return;
        }
        this.winston.info(`[PERFORMANCE] ${message}`, {
            type: 'performance',
            ...context,
        });
    }
    audit(action, context) {
        if (!this.config.auditEnabled) {
            return;
        }
        this.winston.info(`[AUDIT] ${action}`, {
            type: 'audit',
            timestamp: new Date().toISOString(),
            ...context,
        });
    }
    security(message, context) {
        this.winston.warn(`[SECURITY] ${message}`, {
            type: 'security',
            timestamp: new Date().toISOString(),
            ...context,
        });
    }
    child(defaultContext) {
        const childLogger = new Logger(this.config);
        const originalDebug = childLogger.debug.bind(childLogger);
        const originalInfo = childLogger.info.bind(childLogger);
        const originalWarn = childLogger.warn.bind(childLogger);
        const originalError = childLogger.error.bind(childLogger);
        childLogger.debug = (message, context) => {
            originalDebug(message, { ...defaultContext, ...context });
        };
        childLogger.info = (message, context) => {
            originalInfo(message, { ...defaultContext, ...context });
        };
        childLogger.warn = (message, context) => {
            originalWarn(message, { ...defaultContext, ...context });
        };
        childLogger.error = (message, error, context) => {
            originalError(message, error, { ...defaultContext, ...context });
        };
        return childLogger;
    }
    setLevel(level) {
        this.winston.level = level;
    }
    close() {
        this.winston.close();
    }
}
export function createLogger(config) {
    const defaultConfig = {
        level: 'info',
        format: 'json',
        auditEnabled: true,
        performanceLogging: true,
    };
    return new Logger(config || defaultConfig);
}
//# sourceMappingURL=index.js.map