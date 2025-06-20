# MongoDB MCP Server

A production-ready Model Context Protocol (MCP) server for MongoDB operations with enhanced safety, performance monitoring, and comprehensive tooling.

## Features

- **Read-Only Operations**: Safe MongoDB queries with built-in restrictions
- **Comprehensive Toolset**: 7 powerful tools for database exploration and analysis
- **Enhanced Safety**: Query sanitization, rate limiting, and resource monitoring
- **Performance Monitoring**: Built-in metrics, caching, and timeout management
- **Production Ready**: Health checks, graceful shutdown, and comprehensive logging

## Tools Available

### 1. `query`
Execute MongoDB find queries with safety restrictions.
- **Parameters**: `database`, `collection`, `query`, `options`
- **Limits**: Maximum 1000 documents per query
- **Options**: limit, skip, sort, projection

### 2. `aggregate`
Run aggregation pipelines (read-only operations only).
- **Parameters**: `database`, `collection`, `pipeline`, `options`
- **Limits**: Maximum 1000 batch size, 60 second timeout
- **Safety**: Blocks write operations in pipelines

### 3. `listCollections`
List all collections in a database.
- **Parameters**: `database`
- **Returns**: Collection names and metadata

### 4. `listDatabases`
List all accessible databases.
- **Parameters**: None
- **Returns**: Database names and sizes

### 5. `getIndexes`
View indexes for a collection.
- **Parameters**: `database`, `collection`
- **Returns**: Index definitions and statistics

### 6. `explain`
Analyze query performance and execution plans.
- **Parameters**: `database`, `collection`, `query`, `options`
- **Verbosity**: queryPlanner, executionStats, allPlansExecution
- **Returns**: Detailed execution analysis

### 7. `stats`
Get collection or database statistics.
- **Parameters**: `database`, `collection` (optional)
- **Returns**: Storage stats, document counts, index information

## Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB connection (local or remote)

### From NPM
```bash
npm install -g mongodb-mcp-server
```

### From Source
```bash
git clone https://github.com/your-repo/mongodb-mcp-server
cd mongodb-mcp-server
npm install
npm run build
```

### Docker
```bash
docker build -t mongodb-mcp-server .
docker run -e MONGODB_URI="mongodb://localhost:27017" mongodb-mcp-server
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` | Yes |
| `MONGODB_DATABASE` | Default database name | - | No |
| `MONGODB_TIMEOUT` | Connection timeout (ms) | `30000` | No |
| `MONGODB_MAX_POOL_SIZE` | Max connection pool size | `10` | No |
| `MONGODB_MIN_POOL_SIZE` | Min connection pool size | `2` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `RATE_LIMIT_REQUESTS` | Max requests per minute | `100` | No |
| `CACHE_TTL` | Cache TTL in seconds | `300` | No |

### Connection String Examples

```bash
# Local MongoDB
MONGODB_URI="mongodb://localhost:27017"

# MongoDB Atlas
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/database"

# Replica Set
MONGODB_URI="mongodb://user:password@host1:27017,host2:27017/database?replicaSet=myReplSet"

# With SSL
MONGODB_URI="mongodb://user:password@host:27017/database?ssl=true"
```

## Usage

### As MCP Server
```bash
# Start the server
mongodb-mcp-server

# With custom configuration
MONGODB_URI="mongodb://localhost:27017/mydb" mongodb-mcp-server
```

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "mongodb-mcp-server",
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017"
      }
    }
  }
}
```

### Example Queries

```javascript
// Find documents
{
  "database": "ecommerce",
  "collection": "products",
  "query": { "category": "electronics" },
  "options": { "limit": 10, "sort": { "price": -1 } }
}

// Aggregation pipeline
{
  "database": "ecommerce",
  "collection": "orders",
  "pipeline": [
    { "$match": { "status": "completed" } },
    { "$group": { "_id": "$customerId", "totalSpent": { "$sum": "$amount" } } },
    { "$sort": { "totalSpent": -1 } },
    { "$limit": 5 }
  ]
}

// Explain query performance
{
  "database": "ecommerce",
  "collection": "products",
  "query": { "category": "electronics", "price": { "$lt": 500 } },
  "options": { "verbosity": "executionStats" }
}
```

## Safety Features

### Query Restrictions
- **Read-Only**: All write operations are blocked
- **Result Limits**: Maximum 1000 documents per query
- **Timeout Protection**: Queries timeout after 60 seconds
- **Resource Monitoring**: Memory and CPU usage tracking

### Blocked Operations
- `drop`, `dropDatabase`
- `insert`, `insertOne`, `insertMany`
- `update`, `updateOne`, `updateMany`
- `delete`, `deleteOne`, `deleteMany`
- `remove`, `findAndModify`
- `createIndex`, `dropIndex`

### Rate Limiting
- Default: 100 requests per minute
- Configurable via `RATE_LIMIT_REQUESTS`
- Per-connection tracking

## Performance Features

### Caching
- Query result caching with 5-minute TTL
- Configurable cache size and expiration
- Automatic cache invalidation

### Connection Management
- Connection pooling with min/max sizes
- Automatic reconnection on failures
- Health check monitoring

### Monitoring
- Query execution metrics
- Connection pool statistics
- Error rate tracking
- Performance alerts

## Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Type Checking
```bash
npm run typecheck
```

## Docker Usage

### Build Image
```bash
docker build -t mongodb-mcp-server .
```

### Run Container
```bash
docker run -e MONGODB_URI="mongodb://host.docker.internal:27017" mongodb-mcp-server
```

### Docker Compose
```yaml
version: '3.8'
services:
  mongodb-mcp:
    build: .
    environment:
      - MONGODB_URI=mongodb://mongo:27017
      - LOG_LEVEL=debug
    depends_on:
      - mongo
  
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
```

## Troubleshooting

### Common Issues

**Connection Refused**
```bash
# Check MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Test connection string
MONGODB_URI="your-connection-string" mongodb-mcp-server
```

**Permission Denied**
```bash
# Ensure user has read permissions
# Add to MongoDB user roles: ["read", "readAnyDatabase"]
```

**High Memory Usage**
```bash
# Reduce query limits
# Increase cache TTL
# Monitor query complexity
```

### Debug Mode
```bash
LOG_LEVEL=debug mongodb-mcp-server
```

### Health Check
The server provides a health check endpoint for monitoring:
```bash
# Check server status
curl http://localhost:3000/health
```

## Security Considerations

- **Network Security**: Use SSL/TLS for production connections
- **Authentication**: Always use authenticated MongoDB connections
- **Firewall**: Restrict MongoDB access to authorized hosts only
- **Monitoring**: Enable audit logging for security events
- **Updates**: Keep dependencies updated for security patches

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Check the docs/ directory for detailed guides
- Examples: See examples/ directory for common use cases