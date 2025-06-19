import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { MongoConnectionConfig } from '../types/index.js';

export class MongoDBConnection {
  private client: MongoClient | null = null;
  private isConnected = false;
  private connectionConfig: MongoConnectionConfig;

  constructor(config: MongoConnectionConfig) {
    this.connectionConfig = config;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      const options: MongoClientOptions = {
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
    } catch (error) {
      this.isConnected = false;
      throw new Error(`Failed to connect to MongoDB: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.isConnected = false;
    }
  }

  getDatabase(databaseName?: string): Db {
    if (!this.client || !this.isConnected) {
      throw new Error('MongoDB client is not connected');
    }

    const dbName = databaseName || this.connectionConfig.database;
    if (!dbName) {
      throw new Error('Database name is required');
    }

    return this.client.db(dbName);
  }

  getClient(): MongoClient {
    if (!this.client || !this.isConnected) {
      throw new Error('MongoDB client is not connected');
    }
    return this.client;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.client !== null;
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }
      await this.client.db('admin').command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async ensureConnection(): Promise<void> {
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