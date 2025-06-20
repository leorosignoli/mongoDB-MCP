import { MongoClient, ClientSession, ReadConcern, ReadPreference } from 'mongodb';
export interface ReadTransactionOptions {
    readConcern?: ReadConcern;
    readPreference?: ReadPreference;
    maxTimeMS?: number;
}
export declare class ReadOnlyTransaction {
    private session;
    private client;
    constructor(client: MongoClient, session: ClientSession);
    getSession(): ClientSession;
    abort(): Promise<void>;
    commit(): Promise<void>;
    end(): Promise<void>;
    isActive(): boolean;
}
export declare function withReadTransaction<T>(client: MongoClient, operation: (transaction: ReadOnlyTransaction) => Promise<T>, options?: ReadTransactionOptions): Promise<T>;
export declare function withSession<T>(client: MongoClient, operation: (session: ClientSession) => Promise<T>): Promise<T>;
//# sourceMappingURL=readonly.d.ts.map