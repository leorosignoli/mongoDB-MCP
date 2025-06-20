import { Document } from 'mongodb';
import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
import { ExplainArgs } from '../types/index.js';
export declare function explainQuery(connection: EnhancedMongoDBConnection, args: ExplainArgs): Promise<{
    explanation: any;
    metadata: any;
}>;
export declare function explainAggregation(connection: EnhancedMongoDBConnection, args: {
    database: string;
    collection: string;
    pipeline: Document[];
    options?: any;
}): Promise<{
    explanation: any;
    metadata: any;
}>;
//# sourceMappingURL=explain.d.ts.map