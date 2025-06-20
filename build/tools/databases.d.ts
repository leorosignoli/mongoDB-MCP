import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
import { StatsArgs } from '../types/index.js';
export declare function listDatabases(connection: EnhancedMongoDBConnection): Promise<{
    databases: any[];
    metadata: any;
}>;
export declare function getDatabaseStats(connection: EnhancedMongoDBConnection, args: {
    database: string;
}): Promise<{
    stats: any;
    metadata: any;
}>;
export declare function getCollectionStats(connection: EnhancedMongoDBConnection, args: StatsArgs): Promise<{
    stats: any;
    metadata: any;
}>;
export declare function getServerStatus(connection: EnhancedMongoDBConnection): Promise<{
    status: any;
    metadata: any;
}>;
//# sourceMappingURL=databases.d.ts.map