import { Document } from 'mongodb';
import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
import { AggregateArgs } from '../types/index.js';
export declare function executeAggregation(connection: EnhancedMongoDBConnection, args: AggregateArgs): Promise<{
    documents: Document[];
    count: number;
    metadata: any;
}>;
export declare function validateAggregationPipeline(pipeline: Document[]): void;
//# sourceMappingURL=aggregate.d.ts.map