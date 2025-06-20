import { Logger, LogContext } from './index.js';

export interface AuditEvent {
  action: string;
  resource: {
    type: 'database' | 'collection' | 'query' | 'aggregation';
    database?: string;
    collection?: string;
  };
  metadata: {
    operationId: string;
    toolName: string;
    userId?: string;
    sessionId?: string;
    timestamp: string;
    duration?: number;
    success: boolean;
    error?: string;
    query?: any;
    options?: any;
    resultCount?: number;
    cacheHit?: boolean;
  };
}

export class AuditLogger {
  private logger: Logger;
  private events: AuditEvent[] = [];
  private readonly maxEvents = 10000;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  logToolExecution(event: Omit<AuditEvent, 'metadata'> & { 
    metadata: Omit<AuditEvent['metadata'], 'timestamp'> 
  }): void {
    const auditEvent: AuditEvent = {
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
      },
    };

    this.events.push(auditEvent);
    
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    const context: LogContext = {
      operationId: auditEvent.metadata.operationId,
      toolName: auditEvent.metadata.toolName,
      database: auditEvent.resource.database || undefined,
      collection: auditEvent.resource.collection || undefined,
      duration: auditEvent.metadata.duration || undefined,
      cacheHit: auditEvent.metadata.cacheHit || undefined,
      success: auditEvent.metadata.success,
      error: auditEvent.metadata.error || undefined,
      resultCount: auditEvent.metadata.resultCount || undefined,
    };

    this.logger.audit(
      `${auditEvent.action} on ${auditEvent.resource.type}`,
      context
    );
  }

  logSecurityEvent(
    event: 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_QUERY' | 'RATE_LIMIT_EXCEEDED' | 'BLOCKED_OPERATION',
    details: {
      toolName?: string;
      database?: string;
      collection?: string;
      query?: any;
      reason: string;
      userId?: string;
    }
  ): void {
    const context: LogContext = {
      event,
      toolName: details.toolName || undefined,
      database: details.database || undefined,
      collection: details.collection || undefined,
      reason: details.reason,
      userId: details.userId || undefined,
      query: details.query ? JSON.stringify(details.query) : undefined,
    };

    this.logger.security(`Security event: ${event} - ${details.reason}`, context);
  }

  logPerformanceEvent(
    operationId: string,
    toolName: string,
    duration: number,
    metadata: {
      database?: string;
      collection?: string;
      resultCount?: number;
      cacheHit?: boolean;
      slow?: boolean;
    }
  ): void {
    const context: LogContext = {
      operationId,
      toolName,
      duration,
      database: metadata.database || undefined,
      collection: metadata.collection || undefined,
      resultCount: metadata.resultCount || undefined,
      cacheHit: metadata.cacheHit || undefined,
      slow: metadata.slow || undefined,
    };

    this.logger.performance(
      `Operation completed in ${duration}ms${metadata.slow ? ' (SLOW)' : ''}`,
      { ...context, duration }
    );
  }

  getEvents(filter?: {
    action?: string;
    toolName?: string;
    database?: string;
    collection?: string;
    success?: boolean;
    since?: Date;
    limit?: number;
  }): AuditEvent[] {
    let filteredEvents = this.events;

    if (filter?.action) {
      filteredEvents = filteredEvents.filter(e => e.action === filter.action);
    }

    if (filter?.toolName) {
      filteredEvents = filteredEvents.filter(e => e.metadata.toolName === filter.toolName);
    }

    if (filter?.database) {
      filteredEvents = filteredEvents.filter(e => e.resource.database === filter.database);
    }

    if (filter?.collection) {
      filteredEvents = filteredEvents.filter(e => e.resource.collection === filter.collection);
    }

    if (filter?.success !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.metadata.success === filter.success);
    }

    if (filter?.since) {
      filteredEvents = filteredEvents.filter(e => 
        new Date(e.metadata.timestamp) >= filter.since!
      );
    }

    filteredEvents = filteredEvents.sort((a, b) => 
      new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
    );

    if (filter?.limit) {
      filteredEvents = filteredEvents.slice(0, filter.limit);
    }

    return filteredEvents;
  }

  getStats(since?: Date): {
    totalEvents: number;
    successfulOperations: number;
    failedOperations: number;
    toolCounts: Record<string, number>;
    errorCounts: Record<string, number>;
    databaseCounts: Record<string, number>;
  } {
    const sinceTime = since || new Date(Date.now() - 3600000);
    const events = this.getEvents({ since: sinceTime });

    const totalEvents = events.length;
    const successfulOperations = events.filter(e => e.metadata.success).length;
    const failedOperations = totalEvents - successfulOperations;

    const toolCounts: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};
    const databaseCounts: Record<string, number> = {};

    for (const event of events) {
      toolCounts[event.metadata.toolName] = (toolCounts[event.metadata.toolName] || 0) + 1;
      
      if (event.metadata.error) {
        errorCounts[event.metadata.error] = (errorCounts[event.metadata.error] || 0) + 1;
      }
      
      if (event.resource.database) {
        databaseCounts[event.resource.database] = (databaseCounts[event.resource.database] || 0) + 1;
      }
    }

    return {
      totalEvents,
      successfulOperations,
      failedOperations,
      toolCounts,
      errorCounts,
      databaseCounts,
    };
  }

  clearEvents(): void {
    this.events = [];
  }
}

export function createAuditLogger(logger: Logger): AuditLogger {
  return new AuditLogger(logger);
}