export declare class TimeoutError extends Error {
    readonly timeoutMs: number;
    constructor(message: string, timeoutMs: number);
}
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
export declare function createTimeoutSignal(timeoutMs: number): AbortSignal;
//# sourceMappingURL=timeout.d.ts.map