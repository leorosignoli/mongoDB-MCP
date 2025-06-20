import { Document, Filter, FindOptions, AggregateOptions } from 'mongodb';

export class QueryBuilder {
  private filter: Filter<Document> = {};
  private options: FindOptions = {};

  static create(): QueryBuilder {
    return new QueryBuilder();
  }

  where(field: string, value: any): QueryBuilder {
    this.filter[field] = value;
    return this;
  }

  equals(field: string, value: any): QueryBuilder {
    this.filter[field] = { $eq: value };
    return this;
  }

  notEquals(field: string, value: any): QueryBuilder {
    this.filter[field] = { $ne: value };
    return this;
  }

  greaterThan(field: string, value: number | Date): QueryBuilder {
    this.filter[field] = { $gt: value };
    return this;
  }

  greaterThanOrEqual(field: string, value: number | Date): QueryBuilder {
    this.filter[field] = { $gte: value };
    return this;
  }

  lessThan(field: string, value: number | Date): QueryBuilder {
    this.filter[field] = { $lt: value };
    return this;
  }

  lessThanOrEqual(field: string, value: number | Date): QueryBuilder {
    this.filter[field] = { $lte: value };
    return this;
  }

  in(field: string, values: any[]): QueryBuilder {
    this.filter[field] = { $in: values };
    return this;
  }

  notIn(field: string, values: any[]): QueryBuilder {
    this.filter[field] = { $nin: values };
    return this;
  }

  exists(field: string, exists = true): QueryBuilder {
    this.filter[field] = { $exists: exists };
    return this;
  }

  regex(field: string, pattern: string | RegExp, options?: string): QueryBuilder {
    if (typeof pattern === 'string') {
      this.filter[field] = { $regex: pattern, $options: options };
    } else {
      this.filter[field] = { $regex: pattern };
    }
    return this;
  }

  textSearch(searchText: string, language?: string): QueryBuilder {
    this.filter.$text = { $search: searchText };
    if (language) {
      (this.filter.$text as any).$language = language;
    }
    return this;
  }

  near(field: string, longitude: number, latitude: number, maxDistance?: number): QueryBuilder {
    const near: any = {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    };
    
    if (maxDistance !== undefined) {
      near.$maxDistance = maxDistance;
    }
    
    this.filter[field] = { $near: near };
    return this;
  }

  and(...conditions: Filter<Document>[]): QueryBuilder {
    if (conditions.length > 0) {
      this.filter.$and = conditions;
    }
    return this;
  }

  or(...conditions: Filter<Document>[]): QueryBuilder {
    if (conditions.length > 0) {
      this.filter.$or = conditions;
    }
    return this;
  }

  nor(...conditions: Filter<Document>[]): QueryBuilder {
    if (conditions.length > 0) {
      this.filter.$nor = conditions;
    }
    return this;
  }

  not(condition: Filter<Document>): QueryBuilder {
    this.filter.$not = condition;
    return this;
  }

  sort(field: string, direction: 1 | -1 = 1): QueryBuilder {
    if (!this.options.sort) {
      this.options.sort = {};
    }
    (this.options.sort as Document)[field] = direction;
    return this;
  }

  sortBy(sortSpec: Document): QueryBuilder {
    this.options.sort = sortSpec;
    return this;
  }

  limit(count: number): QueryBuilder {
    this.options.limit = count;
    return this;
  }

  skip(count: number): QueryBuilder {
    this.options.skip = count;
    return this;
  }

  project(fields: Document): QueryBuilder {
    this.options.projection = fields;
    return this;
  }

  includeFields(...fields: string[]): QueryBuilder {
    const projection: Document = {};
    for (const field of fields) {
      projection[field] = 1;
    }
    this.options.projection = projection;
    return this;
  }

  excludeFields(...fields: string[]): QueryBuilder {
    const projection: Document = {};
    for (const field of fields) {
      projection[field] = 0;
    }
    this.options.projection = projection;
    return this;
  }

  hint(indexHint: Document | string): QueryBuilder {
    this.options.hint = indexHint;
    return this;
  }

  build(): { filter: Filter<Document>; options: FindOptions } {
    return {
      filter: this.filter,
      options: this.options,
    };
  }

  getFilter(): Filter<Document> {
    return this.filter;
  }

  getOptions(): FindOptions {
    return this.options;
  }
}

export class AggregationBuilder {
  private pipeline: Document[] = [];
  private options: AggregateOptions = {};

  static create(): AggregationBuilder {
    return new AggregationBuilder();
  }

  match(filter: Filter<Document>): AggregationBuilder {
    this.pipeline.push({ $match: filter });
    return this;
  }

  project(projection: Document): AggregationBuilder {
    this.pipeline.push({ $project: projection });
    return this;
  }

  group(groupSpec: Document): AggregationBuilder {
    this.pipeline.push({ $group: groupSpec });
    return this;
  }

  sort(sortSpec: Document): AggregationBuilder {
    this.pipeline.push({ $sort: sortSpec });
    return this;
  }

  limit(count: number): AggregationBuilder {
    this.pipeline.push({ $limit: count });
    return this;
  }

  skip(count: number): AggregationBuilder {
    this.pipeline.push({ $skip: count });
    return this;
  }

  unwind(field: string, options?: { preserveNullAndEmptyArrays?: boolean; includeArrayIndex?: string }): AggregationBuilder {
    const unwindStage: any = { $unwind: field };
    if (options) {
      unwindStage.$unwind = {
        path: field,
        ...options,
      };
    }
    this.pipeline.push(unwindStage);
    return this;
  }

  lookup(from: string, localField: string, foreignField: string, as: string): AggregationBuilder {
    this.pipeline.push({
      $lookup: {
        from,
        localField,
        foreignField,
        as,
      },
    });
    return this;
  }

  addFields(fields: Document): AggregationBuilder {
    this.pipeline.push({ $addFields: fields });
    return this;
  }

  replaceRoot(newRoot: Document): AggregationBuilder {
    this.pipeline.push({ $replaceRoot: { newRoot } });
    return this;
  }

  facet(facets: Record<string, Document[]>): AggregationBuilder {
    this.pipeline.push({ $facet: facets });
    return this;
  }

  bucket(groupBy: any, boundaries: any[], defaultBucket?: string, output?: Document): AggregationBuilder {
    const bucketStage: any = {
      $bucket: {
        groupBy,
        boundaries,
      },
    };
    
    if (defaultBucket !== undefined) {
      bucketStage.$bucket.default = defaultBucket;
    }
    
    if (output) {
      bucketStage.$bucket.output = output;
    }
    
    this.pipeline.push(bucketStage);
    return this;
  }

  sample(size: number): AggregationBuilder {
    this.pipeline.push({ $sample: { size } });
    return this;
  }

  count(field: string): AggregationBuilder {
    this.pipeline.push({ $count: field });
    return this;
  }

  allowDiskUse(allow = true): AggregationBuilder {
    this.options.allowDiskUse = allow;
    return this;
  }

  batchSize(size: number): AggregationBuilder {
    this.options.batchSize = size;
    return this;
  }

  maxTimeMS(timeMs: number): AggregationBuilder {
    this.options.maxTimeMS = timeMs;
    return this;
  }

  hint(indexHint: Document | string): AggregationBuilder {
    this.options.hint = indexHint;
    return this;
  }

  build(): { pipeline: Document[]; options: AggregateOptions } {
    return {
      pipeline: this.pipeline,
      options: this.options,
    };
  }

  getPipeline(): Document[] {
    return this.pipeline;
  }

  getOptions(): AggregateOptions {
    return this.options;
  }
}

export function createQueryBuilder(): QueryBuilder {
  return QueryBuilder.create();
}

export function createAggregationBuilder(): AggregationBuilder {
  return AggregationBuilder.create();
}