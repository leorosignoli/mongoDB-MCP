import { MongoClient, ClientSession, ReadConcern, ReadPreference } from 'mongodb';

export interface ReadTransactionOptions {
  readConcern?: ReadConcern;
  readPreference?: ReadPreference;
  maxTimeMS?: number;
}

export class ReadOnlyTransaction {
  private session: ClientSession;
  private client: MongoClient;

  constructor(client: MongoClient, session: ClientSession) {
    this.client = client;
    this.session = session;
  }

  getSession(): ClientSession {
    return this.session;
  }

  async abort(): Promise<void> {
    if (this.session.inTransaction()) {
      await this.session.abortTransaction();
    }
  }

  async commit(): Promise<void> {
    if (this.session.inTransaction()) {
      await this.session.commitTransaction();
    }
  }

  async end(): Promise<void> {
    await this.session.endSession();
  }

  isActive(): boolean {
    return this.session.inTransaction();
  }
}

export async function withReadTransaction<T>(
  client: MongoClient,
  operation: (transaction: ReadOnlyTransaction) => Promise<T>,
  options?: ReadTransactionOptions
): Promise<T> {
  const session = client.startSession();
  const transaction = new ReadOnlyTransaction(client, session);

  try {
    const transactionOptions = {
      readConcern: options?.readConcern || { level: 'snapshot' as const },
      readPreference: options?.readPreference || ReadPreference.SECONDARY_PREFERRED,
      maxTimeMS: options?.maxTimeMS || 30000,
    };

    await session.startTransaction(transactionOptions);
    
    const result = await operation(transaction);
    
    await transaction.commit();
    
    return result;
  } catch (error) {
    await transaction.abort();
    throw error;
  } finally {
    await transaction.end();
  }
}

export async function withSession<T>(
  client: MongoClient,
  operation: (session: ClientSession) => Promise<T>
): Promise<T> {
  const session = client.startSession();
  
  try {
    return await operation(session);
  } finally {
    await session.endSession();
  }
}