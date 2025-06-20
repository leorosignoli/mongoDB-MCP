import { Document } from 'mongodb';
import { EnhancedMongoDBConnection } from '../mongodb/enhanced-connection.js';
import {
  sanitizeAggregationPipeline,
  sanitizeCollectionName,
  sanitizeDatabaseName,
} from '../mongodb/safety.js';
import { AggregateArgs } from '../types/index.js';

export async function executeAggregation(
  connection: EnhancedMongoDBConnection,
  args: AggregateArgs
): Promise<{ documents: Document[]; count: number; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    const collectionName = sanitizeCollectionName(args.collection);
    const pipeline = sanitizeAggregationPipeline(args.pipeline);

    const allowCursor = args.options?.allowCursor !== false;
    const batchSize = Math.min(args.options?.batchSize || 100, 1000);
    const maxTimeMS = Math.min(args.options?.maxTimeMS || 30000, 60000);

    const db = connection.getDatabase(databaseName);
    const collection = db.collection(collectionName);

    const aggregationOptions: Record<string, unknown> = {
      allowDiskUse: false,
      maxTimeMS,
      batchSize,
    };
    
    if (allowCursor) {
      aggregationOptions.cursor = { batchSize };
    }

    const cursor = collection.aggregate(pipeline, aggregationOptions);
    const documents = await cursor.toArray();

    const metadata = {
      database: databaseName,
      collection: collectionName,
      pipeline,
      returnedCount: documents.length,
      aggregationOptions,
      operation: 'aggregate',
    };

    return {
      documents,
      count: documents.length,
      metadata,
    };
  } catch (error) {
    throw new Error(`Aggregation execution failed: ${error}`);
  }
}


export function validateAggregationPipeline(pipeline: Document[]): void {
  if (!Array.isArray(pipeline) || pipeline.length === 0) {
    throw new Error('Pipeline must be a non-empty array');
  }

  if (pipeline.length > 20) {
    throw new Error('Pipeline cannot have more than 20 stages');
  }

  const allowedStages = [
    '$match',
    '$project',
    '$sort',
    '$limit',
    '$skip',
    '$unwind',
    '$group',
    '$lookup',
    '$addFields',
    '$replaceRoot',
    '$facet',
    '$bucket',
    '$bucketAuto',
    '$sortByCount',
    '$count',
    '$sample',
    '$redact',
    '$geoNear',
    '$graphLookup',
    '$collStats',
    '$indexStats',
  ];

  for (let i = 0; i < pipeline.length; i++) {
    const stage = pipeline[i];
    if (!stage || typeof stage !== 'object') {
      throw new Error(`Pipeline stage ${i} must be an object`);
    }

    const stageKeys = Object.keys(stage);
    if (stageKeys.length !== 1) {
      throw new Error(`Pipeline stage ${i} must have exactly one operator`);
    }

    const stageOperator = stageKeys[0]!;
    if (!allowedStages.includes(stageOperator)) {
      throw new Error(`Pipeline stage operator '${stageOperator}' is not allowed`);
    }

    if (stageOperator === '$limit' && typeof stage.$limit !== 'number') {
      throw new Error('$limit stage must have a numeric value');
    }

    if (stageOperator === '$limit' && stage.$limit > 1000) {
      throw new Error('$limit stage cannot exceed 1000 documents');
    }

    if (stageOperator === '$skip' && typeof stage.$skip !== 'number') {
      throw new Error('$skip stage must have a numeric value');
    }

    if (stageOperator === '$skip' && stage.$skip < 0) {
      throw new Error('$skip stage cannot be negative');
    }
  }
}