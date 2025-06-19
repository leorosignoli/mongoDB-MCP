#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'mongodb-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query',
        description: 'Execute MongoDB queries',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string', description: 'Database name' },
            collection: { type: 'string', description: 'Collection name' },
            query: { type: 'object', description: 'MongoDB query object' },
          },
          required: ['database', 'collection', 'query'],
        },
      },
      {
        name: 'aggregate',
        description: 'Run aggregation pipelines',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string', description: 'Database name' },
            collection: { type: 'string', description: 'Collection name' },
            pipeline: { type: 'array', description: 'Aggregation pipeline' },
          },
          required: ['database', 'collection', 'pipeline'],
        },
      },
      {
        name: 'listCollections',
        description: 'Show all collections',
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
        description: 'Show all databases',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'getIndexes',
        description: 'View collection indexes',
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
        description: 'Query performance analysis',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string', description: 'Database name' },
            collection: { type: 'string', description: 'Collection name' },
            query: { type: 'object', description: 'MongoDB query object' },
          },
          required: ['database', 'collection', 'query'],
        },
      },
      {
        name: 'stats',
        description: 'Collection/database statistics',
        inputSchema: {
          type: 'object',
          properties: {
            database: { type: 'string', description: 'Database name' },
            collection: {
              type: 'string',
              description: 'Collection name (optional for db stats)',
            },
          },
          required: ['database'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'query':
    case 'aggregate':
    case 'listCollections':
    case 'listDatabases':
    case 'getIndexes':
    case 'explain':
    case 'stats':
      return {
        content: [
          {
            type: 'text',
            text: `Tool ${name} not yet implemented. Arguments: ${JSON.stringify(
              args
            )}`,
          },
        ],
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});