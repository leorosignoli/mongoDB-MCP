import { Document } from 'mongodb';
export declare function sanitizeQuery(query: Document): Document;
export declare function sanitizeAggregationPipeline(pipeline: Document[]): Document[];
export declare function validateReadOnlyOperation(operation: string): void;
export declare function sanitizeCollectionName(name: string): string;
export declare function sanitizeDatabaseName(name: string): string;
export declare function validateLimit(limit?: number): number;
export declare function validateSkip(skip?: number): number;
//# sourceMappingURL=safety.d.ts.map