import { z } from 'zod';

export const MongoConnectionConfigSchema = z.object({
  uri: z.string(),
  database: z.string().optional(),
  options: z.record(z.any()).optional(),
});

export type MongoConnectionConfig = z.infer<typeof MongoConnectionConfigSchema>;

export const QueryArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
  query: z.record(z.any()),
  options: z.record(z.any()).optional(),
});

export type QueryArgs = z.infer<typeof QueryArgsSchema>;

export const AggregateArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
  pipeline: z.array(z.record(z.any())),
  options: z.record(z.any()).optional(),
});

export type AggregateArgs = z.infer<typeof AggregateArgsSchema>;

export const ListCollectionsArgsSchema = z.object({
  database: z.string(),
});

export type ListCollectionsArgs = z.infer<typeof ListCollectionsArgsSchema>;

export const GetIndexesArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
});

export type GetIndexesArgs = z.infer<typeof GetIndexesArgsSchema>;

export const ExplainArgsSchema = z.object({
  database: z.string(),
  collection: z.string(),
  query: z.record(z.any()),
  options: z.record(z.any()).optional(),
});

export type ExplainArgs = z.infer<typeof ExplainArgsSchema>;

export const StatsArgsSchema = z.object({
  database: z.string(),
  collection: z.string().optional(),
});

export type StatsArgs = z.infer<typeof StatsArgsSchema>;