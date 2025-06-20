import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
import { ListCollectionsArgs, GetIndexesArgs } from '../types/index.js';
export declare function listCollections(connection: EnhancedMongoDBConnection, args: ListCollectionsArgs): Promise<{
    collections: any[];
    metadata: any;
}>;
export declare function getCollectionInfo(connection: EnhancedMongoDBConnection, args: {
    database: string;
    collection: string;
}): Promise<{
    info: any;
    metadata: any;
}>;
export declare function getIndexes(connection: EnhancedMongoDBConnection, args: GetIndexesArgs): Promise<{
    indexes: any[];
    metadata: any;
}>;
//# sourceMappingURL=collections.d.ts.map