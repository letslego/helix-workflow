export type WorkflowStatus = "running" | "parked" | "completed" | "failed";
export type WorkflowEventType = string;
export interface WorkflowEvent {
    type: WorkflowEventType;
    at: string;
    data?: Record<string, unknown>;
}
export interface WorkflowStepRecord {
    name: string;
    status: "done" | "error";
    result?: unknown;
    error?: string;
    at: string;
}
export interface WorkflowParkState {
    reason: string;
    data?: Record<string, unknown>;
    at: string;
}
export interface WorkflowRun {
    id: string;
    sessionId: string;
    status: WorkflowStatus;
    createdAt: string;
    updatedAt: string;
    steps: WorkflowStepRecord[];
    park?: WorkflowParkState;
    meta?: Record<string, unknown>;
}
export type WorkflowEmitter = (type: WorkflowEventType, data?: Record<string, unknown>) => WorkflowEvent | void;
export interface WorkflowContext {
    run: WorkflowRun;
    sessionId: string;
    step: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
    checkpoint: (name: string, data?: Record<string, unknown>) => void;
    park: (reason: string, data?: Record<string, unknown>) => void;
    emit: WorkflowEmitter;
    wasReplayed: (name: string) => boolean;
}
/** Local-first durable workflow world. Completed steps never re-run. */
export declare class WorkflowWorld {
    private dir;
    constructor(rootDir: string, namespace?: string);
    create(sessionId: string, meta?: Record<string, unknown>): WorkflowRun;
    get(id: string): WorkflowRun | null;
    list(sessionId?: string): WorkflowRun[];
    save(run: WorkflowRun): void;
    bind(run: WorkflowRun, emit?: WorkflowEmitter): WorkflowContext;
    complete(run: WorkflowRun): void;
    resume(run: WorkflowRun): WorkflowRun;
}
export declare function step<T>(name: string, ctx: Pick<WorkflowContext, "step">, fn: () => Promise<T> | T): Promise<T>;
//# sourceMappingURL=index.d.ts.map