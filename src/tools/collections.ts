import { MongoDBConnection } from '../mongodb/connection.js';
import { sanitizeDatabaseName, sanitizeCollectionName } from '../mongodb/safety.js';
import { ListCollectionsArgs, GetIndexesArgs } from '../types/index.js';

export async function listCollections(
  connection: MongoDBConnection,
  args: ListCollectionsArgs
): Promise<{ collections: any[]; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    const db = connection.getDatabase(databaseName);

    const collections = await db.listCollections().toArray();
    
    const filteredCollections = collections
      .filter(col => !col.name.startsWith('system.'))
      .map(col => ({
        name: col.name,
        type: (col as any).type || 'collection',
        options: (col as any).options || {},
        info: {
          readOnly: (col as any).info?.readOnly || false,
          uuid: (col as any).info?.uuid || null,
        },
      }));

    const metadata = {
      database: databaseName,
      totalCollections: filteredCollections.length,
      operation: 'listCollections',
    };

    return {
      collections: filteredCollections,
      metadata,
    };
  } catch (error) {
    throw new Error(`Failed to list collections: ${error}`);
  }
}

export async function getCollectionInfo(
  connection: MongoDBConnection,
  args: { database: string; collection: string }
): Promise<{ info: any; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    const collectionName = sanitizeCollectionName(args.collection);
    const db = connection.getDatabase(databaseName);

    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    const collectionInfo = collections[0]!;
    const collection = db.collection(collectionName);

    const [stats, indexes] = await Promise.all([
      db.command({ collStats: collectionName }).catch(() => null),
      collection.listIndexes().toArray().catch(() => []),
    ]);

    const info = {
      name: collectionInfo.name,
      type: (collectionInfo as any).type || 'collection',
      options: (collectionInfo as any).options || {},
      stats: stats ? {
        size: stats.size,
        count: stats.count,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        indexCount: stats.nindexes,
        indexSize: stats.totalIndexSize,
      } : null,
      indexes: indexes.map((idx: any) => ({
        name: idx.name,
        key: idx.key,
        unique: idx.unique || false,
        sparse: idx.sparse || false,
      })),
    };

    const metadata = {
      database: databaseName,
      collection: collectionName,
      operation: 'getCollectionInfo',
    };

    return {
      info,
      metadata,
    };
  } catch (error) {
    throw new Error(`Failed to get collection info: ${error}`);
  }
}

export async function getIndexes(
  connection: MongoDBConnection,
  args: GetIndexesArgs
): Promise<{ indexes: any[]; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    const collectionName = sanitizeCollectionName(args.collection);
    const db = connection.getDatabase(databaseName);
    const collection = db.collection(collectionName);

    const indexes = await collection.listIndexes().toArray();
    
    const formattedIndexes = indexes.map(idx => ({
      name: idx.name,
      key: idx.key,
      unique: idx.unique || false,
      sparse: idx.sparse || false,
      partialFilterExpression: idx.partialFilterExpression || null,
      expireAfterSeconds: idx.expireAfterSeconds || null,
      background: idx.background || false,
      weights: idx.weights || null,
      defaultLanguage: idx.default_language || null,
      languageOverride: idx.language_override || null,
      textIndexVersion: idx.textIndexVersion || null,
      version: idx.v || null,
    }));

    const metadata = {
      database: databaseName,
      collection: collectionName,
      indexCount: formattedIndexes.length,
      operation: 'getIndexes',
    };

    return {
      indexes: formattedIndexes,
      metadata,
    };
  } catch (error) {
    throw new Error(`Failed to get indexes: ${error}`);
  }
}