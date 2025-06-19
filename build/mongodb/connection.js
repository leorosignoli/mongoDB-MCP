import { MongoClient } from 'mongodb';
export class MongoDBConnection {
    client = null;
    isConnected = false;
    connectionConfig;
    constructor(config) {
        this.connectionConfig = config;
    }
    async connect() {
        if (this.isConnected && this.client) {
            return;
        }
        try {
            const options = {
                maxPoolSize: 10,
                minPoolSize: 2,
                maxIdleTimeMS: 30000,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4,
                ...this.connectionConfig.options,
            };
            this.client = new MongoClient(this.connectionConfig.uri, options);
            await this.client.connect();
            this.isConnected = true;
        }
        catch (error) {
            this.isConnected = false;
            throw new Error(`Failed to connect to MongoDB: ${error}`);
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.isConnected = false;
        }
    }
    getDatabase(databaseName) {
        if (!this.client || !this.isConnected) {
            throw new Error('MongoDB client is not connected');
        }
        const dbName = databaseName || this.connectionConfig.database;
        if (!dbName) {
            throw new Error('Database name is required');
        }
        return this.client.db(dbName);
    }
    getClient() {
        if (!this.client || !this.isConnected) {
            throw new Error('MongoDB client is not connected');
        }
        return this.client;
    }
    isConnectionActive() {
        return this.isConnected && this.client !== null;
    }
    async ping() {
        try {
            if (!this.client || !this.isConnected) {
                return false;
            }
            await this.client.db('admin').command({ ping: 1 });
            return true;
        }
        catch {
            return false;
        }
    }
    async ensureConnection() {
        if (!this.isConnectionActive()) {
            await this.connect();
        }
        const isAlive = await this.ping();
        if (!isAlive) {
            await this.disconnect();
            await this.connect();
        }
    }
}
//# sourceMappingURL=connection.js.map