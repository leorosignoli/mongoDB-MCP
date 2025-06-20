import { sanitizeQuery, sanitizeCollectionName, sanitizeDatabaseName, validateLimit, validateSkip, } from '../mongodb/safety.js';
import { withTimeout } from '../performance/timeout.js';
export async function executeQuery(connection, args) {
    const cache = connection.getCache();
    const performanceMonitor = connection.getPerformanceMonitor();
    const logger = connection.getLogger();
    const auditLogger = connection.getAuditLogger();
    await connection.checkRateLimit('query');
    const operationId = performanceMonitor.startOperation('query', args.database, args.collection);
    const startTime = Date.now();
    try {
        await connection.ensureConnection();
        const databaseName = sanitizeDatabaseName(args.database);
        const collectionName = sanitizeCollectionName(args.collection);
        const query = sanitizeQuery(args.query);
        const limit = validateLimit(args.options?.limit);
        const skip = validateSkip(args.options?.skip);
        const sort = args.options?.sort || {};
        const projection = args.options?.projection || {};
        const cacheKey = cache.generateKey('query', databaseName, collectionName, query, {
            limit, skip, sort, projection
        });
        let result = cache.get(cacheKey);
        let cacheHit = false;
        if (result) {
            cacheHit = true;
            logger.debug('Query cache hit', { operationId, cacheKey });
        }
        else {
            const timeout = 30000;
            const db = connection.getDatabase(databaseName);
            const collection = db.collection(collectionName);
            const queryPromise = async () => {
                const cursor = collection
                    .find(query, { projection })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit);
                const [documents, totalCount] = await Promise.all([
                    cursor.toArray(),
                    collection.countDocuments(query)
                ]);
                return { documents, totalCount };
            };
            const { documents, totalCount } = await withTimeout(queryPromise(), timeout, `Query timeout after ${timeout}ms`);
            result = {
                documents,
                count: documents.length,
                metadata: {
                    database: databaseName,
                    collection: collectionName,
                    query,
                    limit,
                    skip,
                    sort,
                    projection,
                    returnedCount: documents.length,
                    totalCount,
                    hasMore: totalCount > skip + documents.length,
                    operationId,
                    cacheHit: false,
                    executionTime: Date.now() - startTime,
                },
            };
            cache.set(cacheKey, result, 300);
            logger.debug('Query executed and cached', { operationId, cacheKey });
        }
        const duration = Date.now() - startTime;
        const isSlowQuery = performanceMonitor.isSlowQuery(duration);
        performanceMonitor.endOperation(operationId, true, {
            documentsReturned: result.documents.length,
            cacheHit,
        });
        auditLogger.logToolExecution({
            action: 'QUERY_EXECUTE',
            resource: {
                type: 'query',
                database: databaseName,
                collection: collectionName
            },
            metadata: {
                operationId,
                toolName: 'query',
                success: true,
                resultCount: result.documents.length,
                cacheHit,
                duration,
                query: query,
                options: { limit, skip, sort, projection },
            },
        });
        if (isSlowQuery) {
            auditLogger.logPerformanceEvent(operationId, 'query', duration, {
                database: databaseName,
                collection: collectionName,
                resultCount: result.documents.length,
                cacheHit,
                slow: true,
            });
        }
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error.message;
        performanceMonitor.endOperation(operationId, false, {
            error: errorMessage
        });
        auditLogger.logToolExecution({
            action: 'QUERY_EXECUTE',
            resource: {
                type: 'query',
                database: args.database,
                collection: args.collection
            },
            metadata: {
                operationId,
                toolName: 'query',
                success: false,
                error: errorMessage,
                duration,
                query: args.query,
                options: args.options,
            },
        });
        logger.error('Query execution failed', error, {
            operationId,
            database: args.database,
            collection: args.collection,
        });
        throw new Error(`Query execution failed: ${errorMessage}`);
    }
}
export async function executeDistinct(connection, args) {
    try {
        await connection.ensureConnection();
        const databaseName = sanitizeDatabaseName(args.database);
        const collectionName = sanitizeCollectionName(args.collection);
        const query = args.query ? sanitizeQuery(args.query) : {};
        if (!args.field || typeof args.field !== 'string') {
            throw new Error('Field name is required for distinct operation');
        }
        const db = connection.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        const values = await collection.distinct(args.field, query);
        const metadata = {
            database: databaseName,
            collection: collectionName,
            field: args.field,
            query,
            distinctCount: values.length,
        };
        return {
            values,
            metadata,
        };
    }
    catch (error) {
        throw new Error(`Distinct operation failed: ${error}`);
    }
}
export async function executeCount(connection, args) {
    try {
        await connection.ensureConnection();
        const databaseName = sanitizeDatabaseName(args.database);
        const collectionName = sanitizeCollectionName(args.collection);
        const query = args.query ? sanitizeQuery(args.query) : {};
        const db = connection.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments(query);
        const metadata = {
            database: databaseName,
            collection: collectionName,
            query,
            operation: 'count',
        };
        return {
            count,
            metadata,
        };
    }
    catch (error) {
        throw new Error(`Count operation failed: ${error}`);
    }
}
//# sourceMappingURL=query.js.map