export class QueryBuilder {
    filter = {};
    options = {};
    static create() {
        return new QueryBuilder();
    }
    where(field, value) {
        this.filter[field] = value;
        return this;
    }
    equals(field, value) {
        this.filter[field] = { $eq: value };
        return this;
    }
    notEquals(field, value) {
        this.filter[field] = { $ne: value };
        return this;
    }
    greaterThan(field, value) {
        this.filter[field] = { $gt: value };
        return this;
    }
    greaterThanOrEqual(field, value) {
        this.filter[field] = { $gte: value };
        return this;
    }
    lessThan(field, value) {
        this.filter[field] = { $lt: value };
        return this;
    }
    lessThanOrEqual(field, value) {
        this.filter[field] = { $lte: value };
        return this;
    }
    in(field, values) {
        this.filter[field] = { $in: values };
        return this;
    }
    notIn(field, values) {
        this.filter[field] = { $nin: values };
        return this;
    }
    exists(field, exists = true) {
        this.filter[field] = { $exists: exists };
        return this;
    }
    regex(field, pattern, options) {
        if (typeof pattern === 'string') {
            this.filter[field] = { $regex: pattern, $options: options };
        }
        else {
            this.filter[field] = { $regex: pattern };
        }
        return this;
    }
    textSearch(searchText, language) {
        this.filter.$text = { $search: searchText };
        if (language) {
            this.filter.$text.$language = language;
        }
        return this;
    }
    near(field, longitude, latitude, maxDistance) {
        const near = {
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
    and(...conditions) {
        if (conditions.length > 0) {
            this.filter.$and = conditions;
        }
        return this;
    }
    or(...conditions) {
        if (conditions.length > 0) {
            this.filter.$or = conditions;
        }
        return this;
    }
    nor(...conditions) {
        if (conditions.length > 0) {
            this.filter.$nor = conditions;
        }
        return this;
    }
    not(condition) {
        this.filter.$not = condition;
        return this;
    }
    sort(field, direction = 1) {
        if (!this.options.sort) {
            this.options.sort = {};
        }
        this.options.sort[field] = direction;
        return this;
    }
    sortBy(sortSpec) {
        this.options.sort = sortSpec;
        return this;
    }
    limit(count) {
        this.options.limit = count;
        return this;
    }
    skip(count) {
        this.options.skip = count;
        return this;
    }
    project(fields) {
        this.options.projection = fields;
        return this;
    }
    includeFields(...fields) {
        const projection = {};
        for (const field of fields) {
            projection[field] = 1;
        }
        this.options.projection = projection;
        return this;
    }
    excludeFields(...fields) {
        const projection = {};
        for (const field of fields) {
            projection[field] = 0;
        }
        this.options.projection = projection;
        return this;
    }
    hint(indexHint) {
        this.options.hint = indexHint;
        return this;
    }
    build() {
        return {
            filter: this.filter,
            options: this.options,
        };
    }
    getFilter() {
        return this.filter;
    }
    getOptions() {
        return this.options;
    }
}
export class AggregationBuilder {
    pipeline = [];
    options = {};
    static create() {
        return new AggregationBuilder();
    }
    match(filter) {
        this.pipeline.push({ $match: filter });
        return this;
    }
    project(projection) {
        this.pipeline.push({ $project: projection });
        return this;
    }
    group(groupSpec) {
        this.pipeline.push({ $group: groupSpec });
        return this;
    }
    sort(sortSpec) {
        this.pipeline.push({ $sort: sortSpec });
        return this;
    }
    limit(count) {
        this.pipeline.push({ $limit: count });
        return this;
    }
    skip(count) {
        this.pipeline.push({ $skip: count });
        return this;
    }
    unwind(field, options) {
        const unwindStage = { $unwind: field };
        if (options) {
            unwindStage.$unwind = {
                path: field,
                ...options,
            };
        }
        this.pipeline.push(unwindStage);
        return this;
    }
    lookup(from, localField, foreignField, as) {
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
    addFields(fields) {
        this.pipeline.push({ $addFields: fields });
        return this;
    }
    replaceRoot(newRoot) {
        this.pipeline.push({ $replaceRoot: { newRoot } });
        return this;
    }
    facet(facets) {
        this.pipeline.push({ $facet: facets });
        return this;
    }
    bucket(groupBy, boundaries, defaultBucket, output) {
        const bucketStage = {
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
    sample(size) {
        this.pipeline.push({ $sample: { size } });
        return this;
    }
    count(field) {
        this.pipeline.push({ $count: field });
        return this;
    }
    allowDiskUse(allow = true) {
        this.options.allowDiskUse = allow;
        return this;
    }
    batchSize(size) {
        this.options.batchSize = size;
        return this;
    }
    maxTimeMS(timeMs) {
        this.options.maxTimeMS = timeMs;
        return this;
    }
    hint(indexHint) {
        this.options.hint = indexHint;
        return this;
    }
    build() {
        return {
            pipeline: this.pipeline,
            options: this.options,
        };
    }
    getPipeline() {
        return this.pipeline;
    }
    getOptions() {
        return this.options;
    }
}
export function createQueryBuilder() {
    return QueryBuilder.create();
}
export function createAggregationBuilder() {
    return AggregationBuilder.create();
}
//# sourceMappingURL=builders.js.map