import { Document } from 'mongodb';
import { MongoDBConnection } from '../mongodb/connection.js';
import { QueryArgs } from '../types/index.js';
export declare function executeQuery(connection: MongoDBConnection, args: QueryArgs): Promise<{
    documents: Document[];
    count: number;
    metadata: any;
}>;
export declare function executeDistinct(connection: MongoDBConnection, args: {
    database: string;
    collection: string;
    field: string;
    query?: Document;
}): Promise<{
    values: any[];
    metadata: any;
}>;
export declare function executeCount(connection: MongoDBConnection, args: {
    database: string;
    collection: string;
    query?: Document;
}): Promise<{
    count: number;
    metadata: any;
}>;
//# sourceMappingURL=query.d.ts.map