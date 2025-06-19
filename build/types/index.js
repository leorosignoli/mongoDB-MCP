import { z } from 'zod';
export const MongoConnectionConfigSchema = z.object({
    uri: z.string(),
    database: z.string().optional(),
    options: z.record(z.any()).optional(),
});
export const QueryArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
    query: z.record(z.any()),
    options: z.record(z.any()).optional(),
});
export const AggregateArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
    pipeline: z.array(z.record(z.any())),
    options: z.record(z.any()).optional(),
});
export const ListCollectionsArgsSchema = z.object({
    database: z.string(),
});
export const GetIndexesArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
});
export const ExplainArgsSchema = z.object({
    database: z.string(),
    collection: z.string(),
    query: z.record(z.any()),
    options: z.record(z.any()).optional(),
});
export const StatsArgsSchema = z.object({
    database: z.string(),
    collection: z.string().optional(),
});
//# sourceMappingURL=index.js.map