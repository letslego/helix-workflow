import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, } from "node:fs";
import { join } from "node:path";
/** Local-first durable workflow world. Completed steps never re-run. */
export class WorkflowWorld {
    dir;
    constructor(rootDir, namespace = ".helix/workflows") {
        this.dir = join(rootDir, namespace);
        mkdirSync(this.dir, { recursive: true });
    }
    create(sessionId, meta) {
        const now = new Date().toISOString();
        const run = {
            id: randomUUID(),
            sessionId,
            status: "running",
            createdAt: now,
            updatedAt: now,
            steps: [],
            meta,
        };
        this.save(run);
        return run;
    }
    get(id) {
        const path = join(this.dir, `${id}.json`);
        if (!existsSync(path))
            return null;
        return JSON.parse(readFileSync(path, "utf8"));
    }
    list(sessionId) {
        return readdirSync(this.dir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => JSON.parse(readFileSync(join(this.dir, f), "utf8")))
            .filter((r) => (sessionId ? r.sessionId === sessionId : true))
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    save(run) {
        run.updatedAt = new Date().toISOString();
        writeFileSync(join(this.dir, `${run.id}.json`), JSON.stringify(run, null, 2));
    }
    bind(run, emit = () => undefined) {
        const replayed = new Set();
        const checkpoint = (name, data) => {
            emit("checkpoint", { workflowId: run.id, name, ...data });
        };
        const step = async (name, fn) => {
            const existing = run.steps.find((s) => s.name === name && s.status === "done");
            if (existing) {
                replayed.add(name);
                emit("workflow.replay", { workflowId: run.id, step: name, result: existing.result });
                return existing.result;
            }
            emit("workflow.step.start", { workflowId: run.id, step: name });
            checkpoint(`step:${name}:start`);
            try {
                const value = await fn();
                run.steps.push({
                    name,
                    status: "done",
                    result: value ?? null,
                    at: new Date().toISOString(),
                });
                this.save(run);
                checkpoint(`step:${name}:done`, { ok: true });
                emit("workflow.step.done", { workflowId: run.id, step: name });
                return value;
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                run.steps.push({
                    name,
                    status: "error",
                    error: message,
                    at: new Date().toISOString(),
                });
                run.status = "failed";
                this.save(run);
                checkpoint(`step:${name}:error`, { error: message });
                emit("workflow.step.error", { workflowId: run.id, step: name, error: message });
                throw err;
            }
        };
        const park = (reason, data) => {
            run.status = "parked";
            run.park = { reason, data, at: new Date().toISOString() };
            this.save(run);
            emit("workflow.park", { workflowId: run.id, reason, data });
            checkpoint("park", { reason, ...data });
        };
        return {
            run,
            sessionId: run.sessionId,
            step,
            checkpoint,
            park,
            emit,
            wasReplayed: (name) => replayed.has(name),
        };
    }
    complete(run) {
        run.status = "completed";
        run.park = undefined;
        this.save(run);
    }
    resume(run) {
        run.status = "running";
        run.park = undefined;
        this.save(run);
        return run;
    }
}
export async function step(name, ctx, fn) {
    return ctx.step(name, fn);
}
//# sourceMappingURL=index.js.map