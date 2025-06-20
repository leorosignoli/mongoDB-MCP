import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
import { sanitizeDatabaseName } from '../mongodb/safety.js';
import { StatsArgs } from '../types/index.js';

export async function listDatabases(
  connection: EnhancedMongoDBConnection
): Promise<{ databases: any[]; metadata: any }> {
  try {
    await connection.ensureConnection();

    const client = connection.getClient();
    const adminDb = client.db('admin');
    
    const result = await adminDb.command({ listDatabases: 1, nameOnly: false });
    
    const allowedDatabases = result.databases.filter((db: any) => {
      const restrictedNames = ['admin', 'local', 'config'];
      return !restrictedNames.includes(db.name.toLowerCase());
    });

    const databases = allowedDatabases.map((db: any) => ({
      name: db.name,
      sizeOnDisk: db.sizeOnDisk || 0,
      empty: db.empty || false,
    }));

    const metadata = {
      totalDatabases: databases.length,
      totalSize: databases.reduce((sum: number, db: any) => sum + db.sizeOnDisk, 0),
      operation: 'listDatabases',
    };

    return {
      databases,
      metadata,
    };
  } catch (error) {
    throw new Error(`Failed to list databases: ${error}`);
  }
}

export async function getDatabaseStats(
  connection: EnhancedMongoDBConnection,
  args: { database: string }
): Promise<{ stats: any; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    const db = connection.getDatabase(databaseName);

    const stats = await db.stats();
    
    const formattedStats = {
      database: stats.db,
      collections: stats.collections,
      views: stats.views || 0,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      totalSize: stats.totalSize || (stats.dataSize + stats.indexSize),
      scaleFactor: stats.scaleFactor || 1,
    };

    const metadata = {
      database: databaseName,
      operation: 'getDatabaseStats',
      timestamp: new Date().toISOString(),
    };

    return {
      stats: formattedStats,
      metadata,
    };
  } catch (error) {
    throw new Error(`Failed to get database stats: ${error}`);
  }
}

export async function getCollectionStats(
  connection: EnhancedMongoDBConnection,
  args: StatsArgs
): Promise<{ stats: any; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    
    if (!args.collection) {
      return getDatabaseStats(connection, { database: databaseName });
    }

    const db = connection.getDatabase(databaseName);

    const stats = await db.command({ collStats: args.collection });
    
    const formattedStats = {
      namespace: stats.ns,
      size: stats.size,
      count: stats.count,
      avgObjSize: stats.avgObjSize,
      storageSize: stats.storageSize,
      capped: stats.capped || false,
      wiredTiger: stats.wiredTiger ? {
        creationString: stats.wiredTiger['creation-string'],
        type: stats.wiredTiger.type,
      } : null,
      nindexes: stats.nindexes,
      totalIndexSize: stats.totalIndexSize,
      indexSizes: stats.indexSizes || {},
    };

    const metadata = {
      database: databaseName,
      collection: args.collection,
      operation: 'getCollectionStats',
      timestamp: new Date().toISOString(),
    };

    return {
      stats: formattedStats,
      metadata,
    };
  } catch (error) {
    throw new Error(`Failed to get collection stats: ${error}`);
  }
}

export async function getServerStatus(
  connection: EnhancedMongoDBConnection
): Promise<{ status: any; metadata: any }> {
  try {
    await connection.ensureConnection();

    const client = connection.getClient();
    const adminDb = client.db('admin');
    
    const serverStatus = await adminDb.command({ serverStatus: 1 });
    
    const filteredStatus = {
      host: serverStatus.host,
      version: serverStatus.version,
      process: serverStatus.process,
      pid: serverStatus.pid,
      uptime: serverStatus.uptime,
      uptimeMillis: serverStatus.uptimeMillis,
      uptimeEstimate: serverStatus.uptimeEstimate,
      localTime: serverStatus.localTime,
      connections: {
        current: serverStatus.connections?.current || 0,
        available: serverStatus.connections?.available || 0,
        totalCreated: serverStatus.connections?.totalCreated || 0,
      },
      network: {
        bytesIn: serverStatus.network?.bytesIn || 0,
        bytesOut: serverStatus.network?.bytesOut || 0,
        numRequests: serverStatus.network?.numRequests || 0,
      },
      opcounters: serverStatus.opcounters || {},
      mem: {
        bits: serverStatus.mem?.bits || 64,
        resident: serverStatus.mem?.resident || 0,
        virtual: serverStatus.mem?.virtual || 0,
        supported: serverStatus.mem?.supported || true,
      },
    };

    const metadata = {
      operation: 'getServerStatus',
      timestamp: new Date().toISOString(),
    };

    return {
      status: filteredStatus,
      metadata,
    };
  } catch (error) {
    throw new Error(`Failed to get server status: ${error}`);
  }
}