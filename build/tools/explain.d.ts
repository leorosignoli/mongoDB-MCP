import { Document } from 'mongodb';
import { MongoDBConnection } from '../mongodb/connection.js';
import { ExplainArgs } from '../types/index.js';
export declare function explainQuery(connection: MongoDBConnection, args: ExplainArgs): Promise<{
    explanation: any;
    metadata: any;
}>;
export declare function explainAggregation(connection: MongoDBConnection, args: {
    database: string;
    collection: string;
    pipeline: Document[];
    options?: any;
}): Promise<{
    explanation: any;
    metadata: any;
}>;
//# sourceMappingURL=explain.d.ts.map