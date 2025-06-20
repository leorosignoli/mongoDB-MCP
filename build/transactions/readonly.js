import { ReadPreference } from 'mongodb';
export class ReadOnlyTransaction {
    session;
    client;
    constructor(client, session) {
        this.client = client;
        this.session = session;
    }
    getSession() {
        return this.session;
    }
    async abort() {
        if (this.session.inTransaction()) {
            await this.session.abortTransaction();
        }
    }
    async commit() {
        if (this.session.inTransaction()) {
            await this.session.commitTransaction();
        }
    }
    async end() {
        await this.session.endSession();
    }
    isActive() {
        return this.session.inTransaction();
    }
}
export async function withReadTransaction(client, operation, options) {
    const session = client.startSession();
    const transaction = new ReadOnlyTransaction(client, session);
    try {
        const transactionOptions = {
            readConcern: options?.readConcern || { level: 'snapshot' },
            readPreference: options?.readPreference || ReadPreference.SECONDARY_PREFERRED,
            maxTimeMS: options?.maxTimeMS || 30000,
        };
        await session.startTransaction(transactionOptions);
        const result = await operation(transaction);
        await transaction.commit();
        return result;
    }
    catch (error) {
        await transaction.abort();
        throw error;
    }
    finally {
        await transaction.end();
    }
}
export async function withSession(client, operation) {
    const session = client.startSession();
    try {
        return await operation(session);
    }
    finally {
        await session.endSession();
    }
}
//# sourceMappingURL=readonly.js.map