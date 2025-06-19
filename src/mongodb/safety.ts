import { Document } from 'mongodb';

const BLACKLISTED_OPERATIONS = [
  'drop',
  'dropDatabase',
  'dropCollection',
  'dropIndex',
  'dropIndexes',
  'remove',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
  'findOneAndRemove',
  'bulkWrite',
  'insertOne',
  'insertMany',
  'replaceOne',
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'createIndex',
  'createIndexes',
  'renameCollection',
  'createCollection',
  'eval',
  'mapReduce',
];

const DESTRUCTIVE_AGGREGATION_STAGES = [
  '$out',
  '$merge',
];

const UNSAFE_QUERY_OPERATORS = [
  '$where',
  '$function',
  '$accumulator',
  '$expr',
];

export function sanitizeQuery(query: Document): Document {
  if (!query || typeof query !== 'object') {
    throw new Error('Query must be a valid object');
  }

  const sanitized = JSON.parse(JSON.stringify(query));
  
  checkForUnsafeOperators(sanitized);
  return sanitized;
}

export function sanitizeAggregationPipeline(pipeline: Document[]): Document[] {
  if (!Array.isArray(pipeline)) {
    throw new Error('Pipeline must be an array');
  }

  const sanitized = JSON.parse(JSON.stringify(pipeline));
  
  for (const stage of sanitized) {
    if (typeof stage !== 'object' || stage === null) {
      throw new Error('Each pipeline stage must be a valid object');
    }
    
    for (const operator of Object.keys(stage)) {
      if (DESTRUCTIVE_AGGREGATION_STAGES.includes(operator)) {
        throw new Error(`Destructive aggregation stage '${operator}' is not allowed`);
      }
    }
    
    checkForUnsafeOperators(stage);
  }
  
  return sanitized;
}

export function validateReadOnlyOperation(operation: string): void {
  const normalizedOperation = operation.toLowerCase();
  
  for (const blacklisted of BLACKLISTED_OPERATIONS) {
    if (normalizedOperation.includes(blacklisted.toLowerCase())) {
      throw new Error(`Operation '${operation}' contains blacklisted command '${blacklisted}'`);
    }
  }
}

export function sanitizeCollectionName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Collection name must be a non-empty string');
  }
  
  if (name.length > 120) {
    throw new Error('Collection name is too long (max 120 characters)');
  }
  
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
    throw new Error('Collection name contains invalid characters');
  }
  
  if (name.startsWith('system.')) {
    throw new Error('Access to system collections is not allowed');
  }
  
  return name;
}

export function sanitizeDatabaseName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Database name must be a non-empty string');
  }
  
  if (name.length > 64) {
    throw new Error('Database name is too long (max 64 characters)');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error('Database name contains invalid characters');
  }
  
  const restrictedNames = ['admin', 'local', 'config'];
  if (restrictedNames.includes(name.toLowerCase())) {
    throw new Error(`Access to database '${name}' is restricted`);
  }
  
  return name;
}

function checkForUnsafeOperators(obj: any): void {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      checkForUnsafeOperators(item);
    }
    return;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    if (UNSAFE_QUERY_OPERATORS.includes(key)) {
      throw new Error(`Unsafe query operator '${key}' is not allowed`);
    }
    
    if (typeof value === 'string' && value.includes('javascript:')) {
      throw new Error('JavaScript code execution is not allowed');
    }
    
    checkForUnsafeOperators(value);
  }
}

export function validateLimit(limit?: number): number {
  if (limit === undefined) {
    return 100;
  }
  
  if (typeof limit !== 'number' || limit < 0) {
    throw new Error('Limit must be a non-negative number');
  }
  
  if (limit > 1000) {
    throw new Error('Limit cannot exceed 1000 documents');
  }
  
  return limit;
}

export function validateSkip(skip?: number): number {
  if (skip === undefined) {
    return 0;
  }
  
  if (typeof skip !== 'number' || skip < 0) {
    throw new Error('Skip must be a non-negative number');
  }
  
  return skip;
}