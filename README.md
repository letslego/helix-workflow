# @letslego/helix-workflow

Local-first **durable workflows** for the [Helix](https://github.com/letslego/helix) ecosystem.

- Checkpointed `step(name, fn)` execution
- Completed steps **never re-run** (replay from disk)
- Park & resume for human approvals / long waits
- Persists under `.helix/workflows/`

## Install

```bash
npm install @letslego/helix-workflow
```

## Usage

```ts
import { WorkflowWorld, step } from "@letslego/helix-workflow";

const world = new WorkflowWorld(process.cwd());
const run = world.create("session-1");
const ctx = world.bind(run, (type, data) => console.log(type, data));

const profile = await step("load-profile", ctx, async () => ({ id: "u1" }));
// crash & resume — load-profile replays instead of re-fetching
```

## Part of the Helix ecosystem

| Package | Role |
| --- | --- |
| [@letslego/helix](https://github.com/letslego/helix) | Agent framework |
| [@letslego/helix-workflow](https://github.com/letslego/helix-workflow) | Durable workflows |
| [@letslego/helix-gateway](https://github.com/letslego/helix-gateway) | AI Gateway |
| [@letslego/helix-sandbox](https://github.com/letslego/helix-sandbox) | Isolated compute |
| [@letslego/helix-connect](https://github.com/letslego/helix-connect) | Credential brokering |
| [@letslego/helix-channels](https://github.com/letslego/helix-channels) | Delivery surfaces |

Overview: https://letslego.github.io/helix-ecosystem/

## License

Apache-2.0 © LetsLego
