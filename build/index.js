#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
import { EnhancedMongoDBConnection } from './mongodb/enhanced-connection.js';
import { getConnectionConfig, validateConnectionConfig } from './mongodb/config.js';
import { executeQuery } from './tools/query.js';
import { executeAggregation } from './tools/aggregate.js';
import { listCollections, getIndexes } from './tools/collections.js';
import { listDatabases, getCollectionStats } from './tools/databases.js';
import { explainQuery } from './tools/explain.js';
import { QueryArgsSchema, AggregateArgsSchema, ListCollectionsArgsSchema, GetIndexesArgsSchema, ExplainArgsSchema, StatsArgsSchema, } from './types/index.js';
let mongoConnection = null;
const server = new Server({
    name: 'mongodb-mcp-server',
    version: '0.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'query',
                description: 'Execute MongoDB find queries with safety restrictions',
                inputSchema: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', description: 'Database name' },
                        collection: { type: 'string', description: 'Collection name' },
                        query: { type: 'object', description: 'MongoDB query object' },
                        options: {
                            type: 'object',
                            description: 'Query options (limit, skip, sort, projection)',
                            properties: {
                                limit: { type: 'number', maximum: 1000 },
                                skip: { type: 'number', minimum: 0 },
                                sort: { type: 'object' },
                                projection: { type: 'object' },
                            },
                        },
                    },
                    required: ['database', 'collection', 'query'],
                },
            },
            {
                name: 'aggregate',
                description: 'Run aggregation pipelines (read-only operations)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', description: 'Database name' },
                        collection: { type: 'string', description: 'Collection name' },
                        pipeline: { type: 'array', description: 'Aggregation pipeline' },
                        options: {
                            type: 'object',
                            description: 'Aggregation options',
                            properties: {
                                batchSize: { type: 'number', maximum: 1000 },
                                maxTimeMS: { type: 'number', maximum: 60000 },
                            },
                        },
                    },
                    required: ['database', 'collection', 'pipeline'],
                },
            },
            {
                name: 'listCollections',
                description: 'List all collections in a database',
                inputSchema: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', description: 'Database name' },
                    },
                    required: ['database'],
                },
            },
            {
                name: 'listDatabases',
                description: 'List all accessible databases',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'getIndexes',
                description: 'View indexes for a collection',
                inputSchema: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', description: 'Database name' },
                        collection: { type: 'string', description: 'Collection name' },
                    },
                    required: ['database', 'collection'],
                },
            },
            {
                name: 'explain',
                description: 'Analyze query performance and execution plan',
                inputSchema: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', description: 'Database name' },
                        collection: { type: 'string', description: 'Collection name' },
                        query: { type: 'object', description: 'MongoDB query object' },
                        options: {
                            type: 'object',
                            description: 'Explain options',
                            properties: {
                                verbosity: {
                                    type: 'string',
                                    enum: ['queryPlanner', 'executionStats', 'allPlansExecution'],
                                },
                                sort: { type: 'object' },
                                projection: { type: 'object' },
                                limit: { type: 'number' },
                                skip: { type: 'number' },
                            },
                        },
                    },
                    required: ['database', 'collection', 'query'],
                },
            },
            {
                name: 'stats',
                description: 'Get collection or database statistics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', description: 'Database name' },
                        collection: {
                            type: 'string',
                            description: 'Collection name (optional for database stats)',
                        },
                    },
                    required: ['database'],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (!mongoConnection) {
            const config = getConnectionConfig();
            validateConnectionConfig(config);
            mongoConnection = new EnhancedMongoDBConnection(config);
        }
        switch (name) {
            case 'query': {
                const validatedArgs = QueryArgsSchema.parse(args);
                const result = await executeQuery(mongoConnection, validatedArgs);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'aggregate': {
                const validatedArgs = AggregateArgsSchema.parse(args);
                const result = await executeAggregation(mongoConnection, validatedArgs);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'listCollections': {
                const validatedArgs = ListCollectionsArgsSchema.parse(args);
                const result = await listCollections(mongoConnection, validatedArgs);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'listDatabases': {
                const result = await listDatabases(mongoConnection);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'getIndexes': {
                const validatedArgs = GetIndexesArgsSchema.parse(args);
                const result = await getIndexes(mongoConnection, validatedArgs);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'explain': {
                const validatedArgs = ExplainArgsSchema.parse(args);
                const result = await explainQuery(mongoConnection, validatedArgs);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'stats': {
                const validatedArgs = StatsArgsSchema.parse(args);
                const result = await getCollectionStats(mongoConnection, validatedArgs);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof McpError) {
            throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
    }
});
async function cleanup() {
    if (mongoConnection) {
        await mongoConnection.disconnect();
    }
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(error => {
    cleanup().finally(() => {
        process.stderr.write(`Fatal error: ${error}\n`);
        process.exit(1);
    });
});
//# sourceMappingURL=index.js.map