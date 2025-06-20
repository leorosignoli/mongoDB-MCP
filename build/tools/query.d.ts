import { Document } from 'mongodb';
import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
import { QueryArgs } from '../types/index.js';
export declare function executeQuery(connection: EnhancedMongoDBConnection, args: QueryArgs): Promise<{
    documents: Document[];
    count: number;
    metadata: any;
}>;
export declare function executeDistinct(connection: EnhancedMongoDBConnection, args: {
    database: string;
    collection: string;
    field: string;
    query?: Document;
}): Promise<{
    values: any[];
    metadata: any;
}>;
export declare function executeCount(connection: EnhancedMongoDBConnection, args: {
    database: string;
    collection: string;
    query?: Document;
}): Promise<{
    count: number;
    metadata: any;
}>;
//# sourceMappingURL=query.d.ts.map