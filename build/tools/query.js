import { sanitizeQuery, sanitizeCollectionName, sanitizeDatabaseName, validateLimit, validateSkip, } from '../mongodb/safety.js';
export async function executeQuery(connection, args) {
    try {
        await connection.ensureConnection();
        const databaseName = sanitizeDatabaseName(args.database);
        const collectionName = sanitizeCollectionName(args.collection);
        const query = sanitizeQuery(args.query);
        const limit = validateLimit(args.options?.limit);
        const skip = validateSkip(args.options?.skip);
        const sort = args.options?.sort || {};
        const projection = args.options?.projection || {};
        const db = connection.getDatabase(databaseName);
        const collection = db.collection(collectionName);
        const cursor = collection
            .find(query, { projection })
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const documents = await cursor.toArray();
        const totalCount = await collection.countDocuments(query);
        const metadata = {
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
        };
        return {
            documents,
            count: documents.length,
            metadata,
        };
    }
    catch (error) {
        throw new Error(`Query execution failed: ${error}`);
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