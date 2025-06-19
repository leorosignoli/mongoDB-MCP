import { MongoClient, Db } from 'mongodb';
import { MongoConnectionConfig } from '../types/index.js';
export declare class MongoDBConnection {
    private client;
    private isConnected;
    private connectionConfig;
    constructor(config: MongoConnectionConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getDatabase(databaseName?: string): Db;
    getClient(): MongoClient;
    isConnectionActive(): boolean;
    ping(): Promise<boolean>;
    ensureConnection(): Promise<void>;
}
//# sourceMappingURL=connection.d.ts.map