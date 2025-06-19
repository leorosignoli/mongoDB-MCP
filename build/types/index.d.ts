import { z } from 'zod';
export declare const MongoConnectionConfigSchema: z.ZodObject<{
    uri: z.ZodString;
    database: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    database?: string | undefined;
    options?: Record<string, any> | undefined;
}, {
    uri: string;
    database?: string | undefined;
    options?: Record<string, any> | undefined;
}>;
export type MongoConnectionConfig = z.infer<typeof MongoConnectionConfigSchema>;
export declare const QueryArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
    query: z.ZodRecord<z.ZodString, z.ZodAny>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}>;
export type QueryArgs = z.infer<typeof QueryArgsSchema>;
export declare const AggregateArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
    pipeline: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
    pipeline: Record<string, any>[];
    options?: Record<string, any> | undefined;
}, {
    database: string;
    collection: string;
    pipeline: Record<string, any>[];
    options?: Record<string, any> | undefined;
}>;
export type AggregateArgs = z.infer<typeof AggregateArgsSchema>;
export declare const ListCollectionsArgsSchema: z.ZodObject<{
    database: z.ZodString;
}, "strip", z.ZodTypeAny, {
    database: string;
}, {
    database: string;
}>;
export type ListCollectionsArgs = z.infer<typeof ListCollectionsArgsSchema>;
export declare const GetIndexesArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
}, {
    database: string;
    collection: string;
}>;
export type GetIndexesArgs = z.infer<typeof GetIndexesArgsSchema>;
export declare const ExplainArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodString;
    query: z.ZodRecord<z.ZodString, z.ZodAny>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}, {
    database: string;
    collection: string;
    query: Record<string, any>;
    options?: Record<string, any> | undefined;
}>;
export type ExplainArgs = z.infer<typeof ExplainArgsSchema>;
export declare const StatsArgsSchema: z.ZodObject<{
    database: z.ZodString;
    collection: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    database: string;
    collection?: string | undefined;
}, {
    database: string;
    collection?: string | undefined;
}>;
export type StatsArgs = z.infer<typeof StatsArgsSchema>;
//# sourceMappingURL=index.d.ts.map