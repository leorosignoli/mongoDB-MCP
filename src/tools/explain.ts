import { Document } from 'mongodb';
import { MongoDBConnection } from '../mongodb/connection.js';
import {
  sanitizeQuery,
  sanitizeCollectionName,
  sanitizeDatabaseName,
} from '../mongodb/safety.js';
import { ExplainArgs } from '../types/index.js';

export async function explainQuery(
  connection: MongoDBConnection,
  args: ExplainArgs
): Promise<{ explanation: any; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    const collectionName = sanitizeCollectionName(args.collection);
    const query = sanitizeQuery(args.query);
    
    const verbosity = args.options?.verbosity || 'executionStats';
    const sort = args.options?.sort || {};
    const projection = args.options?.projection || {};
    const limit = args.options?.limit;
    const skip = args.options?.skip;

    if (!['queryPlanner', 'executionStats', 'allPlansExecution'].includes(verbosity)) {
      throw new Error('Invalid verbosity level. Must be queryPlanner, executionStats, or allPlansExecution');
    }

    const db = connection.getDatabase(databaseName);
    const collection = db.collection(collectionName);

    let cursor = collection.find(query, { projection }).sort(sort);
    
    if (skip) cursor = cursor.skip(skip);
    if (limit) cursor = cursor.limit(limit);

    const explanation = await cursor.explain(verbosity);

    const formattedExplanation = {
      queryPlanner: explanation.queryPlanner ? {
        plannerVersion: explanation.queryPlanner.plannerVersion,
        namespace: explanation.queryPlanner.namespace,
        indexFilterSet: explanation.queryPlanner.indexFilterSet,
        parsedQuery: explanation.queryPlanner.parsedQuery,
        winningPlan: formatPlan(explanation.queryPlanner.winningPlan),
        rejectedPlans: explanation.queryPlanner.rejectedPlans?.map(formatPlan) || [],
      } : null,
      executionStats: explanation.executionStats ? {
        executionSuccess: explanation.executionStats.executionSuccess,
        nReturned: explanation.executionStats.nReturned,
        executionTimeMillis: explanation.executionStats.executionTimeMillis,
        totalKeysExamined: explanation.executionStats.totalKeysExamined,
        totalDocsExamined: explanation.executionStats.totalDocsExamined,
        executionStages: formatExecutionStage(explanation.executionStats.executionStages),
        allPlansExecution: explanation.executionStats.allPlansExecution?.map(formatExecutionStage) || [],
      } : null,
      command: explanation.command,
      serverInfo: explanation.serverInfo ? {
        host: explanation.serverInfo.host,
        port: explanation.serverInfo.port,
        version: explanation.serverInfo.version,
        gitVersion: explanation.serverInfo.gitVersion,
      } : null,
    };

    const metadata = {
      database: databaseName,
      collection: collectionName,
      query,
      verbosity,
      operation: 'explain',
      timestamp: new Date().toISOString(),
    };

    return {
      explanation: formattedExplanation,
      metadata,
    };
  } catch (error) {
    throw new Error(`Explain operation failed: ${error}`);
  }
}

export async function explainAggregation(
  connection: MongoDBConnection,
  args: {
    database: string;
    collection: string;
    pipeline: Document[];
    options?: any;
  }
): Promise<{ explanation: any; metadata: any }> {
  try {
    await connection.ensureConnection();

    const databaseName = sanitizeDatabaseName(args.database);
    const collectionName = sanitizeCollectionName(args.collection);
    
    if (!Array.isArray(args.pipeline) || args.pipeline.length === 0) {
      throw new Error('Pipeline must be a non-empty array');
    }

    const db = connection.getDatabase(databaseName);
    const collection = db.collection(collectionName);

    const explanation = await collection.aggregate(args.pipeline, {
      explain: true,
      allowDiskUse: false,
    }).next();

    const formattedExplanation = {
      stages: explanation?.stages?.map((stage: any) => ({
        stage: stage.$cursor ? '$cursor' : Object.keys(stage)[0],
        details: stage,
      })) || [],
      serverInfo: explanation?.serverInfo ? {
        host: explanation.serverInfo.host,
        port: explanation.serverInfo.port,
        version: explanation.serverInfo.version,
      } : null,
    };

    const metadata = {
      database: databaseName,
      collection: collectionName,
      pipeline: args.pipeline,
      operation: 'explainAggregation',
      timestamp: new Date().toISOString(),
    };

    return {
      explanation: formattedExplanation,
      metadata,
    };
  } catch (error) {
    throw new Error(`Aggregation explain operation failed: ${error}`);
  }
}

function formatPlan(plan: any): any {
  if (!plan) return null;

  return {
    stage: plan.stage,
    inputStage: plan.inputStage ? formatPlan(plan.inputStage) : null,
    indexName: plan.indexName,
    direction: plan.direction,
    indexBounds: plan.indexBounds,
    filter: plan.filter,
    sort: plan.sort,
    limit: plan.limit,
    skip: plan.skip,
  };
}

function formatExecutionStage(stage: any): any {
  if (!stage) return null;

  return {
    stage: stage.stage,
    nReturned: stage.nReturned,
    executionTimeMillisEstimate: stage.executionTimeMillisEstimate,
    works: stage.works,
    advanced: stage.advanced,
    needTime: stage.needTime,
    needYield: stage.needYield,
    saveState: stage.saveState,
    restoreState: stage.restoreState,
    isEOF: stage.isEOF,
    indexName: stage.indexName,
    keysExamined: stage.keysExamined,
    docsExamined: stage.docsExamined,
    alreadyHasObj: stage.alreadyHasObj,
    inputStage: stage.inputStage ? formatExecutionStage(stage.inputStage) : null,
  };
}