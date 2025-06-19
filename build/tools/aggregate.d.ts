import { Document } from 'mongodb';
import { MongoDBConnection } from '../mongodb/connection.js';
import { AggregateArgs } from '../types/index.js';
export declare function executeAggregation(connection: MongoDBConnection, args: AggregateArgs): Promise<{
    documents: Document[];
    count: number;
    metadata: any;
}>;
export declare function validateAggregationPipeline(pipeline: Document[]): void;
//# sourceMappingURL=aggregate.d.ts.map