import { MongoDBConnection } from '../mongodb/connection.js';
import { StatsArgs } from '../types/index.js';
export declare function listDatabases(connection: MongoDBConnection): Promise<{
    databases: any[];
    metadata: any;
}>;
export declare function getDatabaseStats(connection: MongoDBConnection, args: {
    database: string;
}): Promise<{
    stats: any;
    metadata: any;
}>;
export declare function getCollectionStats(connection: MongoDBConnection, args: StatsArgs): Promise<{
    stats: any;
    metadata: any;
}>;
export declare function getServerStatus(connection: MongoDBConnection): Promise<{
    status: any;
    metadata: any;
}>;
//# sourceMappingURL=databases.d.ts.map