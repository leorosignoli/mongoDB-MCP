import { MongoDBConnection } from '../mongodb/connection.js';
import { ListCollectionsArgs, GetIndexesArgs } from '../types/index.js';
export declare function listCollections(connection: MongoDBConnection, args: ListCollectionsArgs): Promise<{
    collections: any[];
    metadata: any;
}>;
export declare function getCollectionInfo(connection: MongoDBConnection, args: {
    database: string;
    collection: string;
}): Promise<{
    info: any;
    metadata: any;
}>;
export declare function getIndexes(connection: MongoDBConnection, args: GetIndexesArgs): Promise<{
    indexes: any[];
    metadata: any;
}>;
//# sourceMappingURL=collections.d.ts.map