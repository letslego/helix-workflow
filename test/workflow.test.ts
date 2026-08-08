import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { WorkflowWorld } from "../src/index.js";

test("replays completed steps", async () => {
  const dir = mkdtempSync(join(tmpdir(), "hwf-"));
  try {
    const world = new WorkflowWorld(dir);
    const run = world.create("s1");
    let n = 0;
    const ctx = world.bind(run);
    assert.equal(await ctx.step("x", async () => (++n, 42)), 42);
    const again = world.bind(world.get(run.id)!);
    assert.equal(await again.step("x", async () => (++n, 99)), 42);
    assert.equal(n, 1);
    assert.equal(again.wasReplayed("x"), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
