import { Document, Filter, FindOptions, AggregateOptions } from 'mongodb';
export declare class QueryBuilder {
    private filter;
    private options;
    static create(): QueryBuilder;
    where(field: string, value: any): QueryBuilder;
    equals(field: string, value: any): QueryBuilder;
    notEquals(field: string, value: any): QueryBuilder;
    greaterThan(field: string, value: number | Date): QueryBuilder;
    greaterThanOrEqual(field: string, value: number | Date): QueryBuilder;
    lessThan(field: string, value: number | Date): QueryBuilder;
    lessThanOrEqual(field: string, value: number | Date): QueryBuilder;
    in(field: string, values: any[]): QueryBuilder;
    notIn(field: string, values: any[]): QueryBuilder;
    exists(field: string, exists?: boolean): QueryBuilder;
    regex(field: string, pattern: string | RegExp, options?: string): QueryBuilder;
    textSearch(searchText: string, language?: string): QueryBuilder;
    near(field: string, longitude: number, latitude: number, maxDistance?: number): QueryBuilder;
    and(...conditions: Filter<Document>[]): QueryBuilder;
    or(...conditions: Filter<Document>[]): QueryBuilder;
    nor(...conditions: Filter<Document>[]): QueryBuilder;
    not(condition: Filter<Document>): QueryBuilder;
    sort(field: string, direction?: 1 | -1): QueryBuilder;
    sortBy(sortSpec: Document): QueryBuilder;
    limit(count: number): QueryBuilder;
    skip(count: number): QueryBuilder;
    project(fields: Document): QueryBuilder;
    includeFields(...fields: string[]): QueryBuilder;
    excludeFields(...fields: string[]): QueryBuilder;
    hint(indexHint: Document | string): QueryBuilder;
    build(): {
        filter: Filter<Document>;
        options: FindOptions;
    };
    getFilter(): Filter<Document>;
    getOptions(): FindOptions;
}
export declare class AggregationBuilder {
    private pipeline;
    private options;
    static create(): AggregationBuilder;
    match(filter: Filter<Document>): AggregationBuilder;
    project(projection: Document): AggregationBuilder;
    group(groupSpec: Document): AggregationBuilder;
    sort(sortSpec: Document): AggregationBuilder;
    limit(count: number): AggregationBuilder;
    skip(count: number): AggregationBuilder;
    unwind(field: string, options?: {
        preserveNullAndEmptyArrays?: boolean;
        includeArrayIndex?: string;
    }): AggregationBuilder;
    lookup(from: string, localField: string, foreignField: string, as: string): AggregationBuilder;
    addFields(fields: Document): AggregationBuilder;
    replaceRoot(newRoot: Document): AggregationBuilder;
    facet(facets: Record<string, Document[]>): AggregationBuilder;
    bucket(groupBy: any, boundaries: any[], defaultBucket?: string, output?: Document): AggregationBuilder;
    sample(size: number): AggregationBuilder;
    count(field: string): AggregationBuilder;
    allowDiskUse(allow?: boolean): AggregationBuilder;
    batchSize(size: number): AggregationBuilder;
    maxTimeMS(timeMs: number): AggregationBuilder;
    hint(indexHint: Document | string): AggregationBuilder;
    build(): {
        pipeline: Document[];
        options: AggregateOptions;
    };
    getPipeline(): Document[];
    getOptions(): AggregateOptions;
}
export declare function createQueryBuilder(): QueryBuilder;
export declare function createAggregationBuilder(): AggregationBuilder;
//# sourceMappingURL=builders.d.ts.map