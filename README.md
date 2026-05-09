# @chenxuan520/opencode-background-agents

> Keep working while research runs in the background. Your work survives context compaction.

A plugin for [OpenCode](https://github.com/sst/opencode) that enables async background delegation. Fire off research tasks, continue brainstorming or coding, and retrieve results when you need them.

## Why This Exists

Context windows fill up. When that happens, compaction kicks in and your AI loses track of research it just did. You end up re-explaining, re-researching, starting over.

Background agents solve this:

- **Keep working** - Delegate research and continue your conversation. Brainstorm, code review, discuss architecture - you're not blocked waiting.
- **Survive compaction** - Results are saved to disk as markdown. When context gets tight, the AI knows exactly where to retrieve past research.
- **Fire and forget** - Use the "waiter model": you don't follow the waiter to the kitchen. A notification arrives when your order is ready.

## Install

Preferred install command:

```bash
opencode plugin @chenxuan520/opencode-background-agents@latest --global
```

Verified release at the time of writing:

```bash
opencode plugin @chenxuan520/opencode-background-agents@0.1.5 --global
```

If you only want it in the current project instead of globally, omit `--global`:

```bash
opencode plugin @chenxuan520/opencode-background-agents@latest
```

This package exposes a standard OpenCode server plugin entrypoint via `exports["./server"]`, so it installs through the normal npm plugin flow. OCX is not required.

For a global install, OpenCode writes the plugin entry into:

`~/.config/opencode/opencode.json`

Example result:

```json
{
  "plugin": [
    "@chenxuan520/opencode-background-agents@0.1.5"
  ]
}
```

## How It Works

```
1. Delegate    →  "Research OAuth2 PKCE best practices"
2. Continue    →  Keep coding, brainstorming, reviewing
3. Notified    →  <task-notification> arrives on terminal state
4. Retrieve    →  AI calls delegation_read() to get the result
```

Results are persisted to `~/.local/share/opencode/delegations/` as markdown files. Each delegation is automatically tagged with a title and summary, so the AI can scan past research and find what's relevant.

## Lifecycle Behavior

The plugin mirrors Claude Code-style background-agent lifecycle behavior as closely as possible inside OpenCode plugin boundaries:

- Stable delegation IDs are reused across state, artifact path, notifications, and retrieval.
- Explicit lifecycle transitions (`registered` → `running` → terminal).
- Terminal-state protection (late progress events cannot regress terminal status).
- Persistence occurs before terminal notification delivery.
- `delegation_read(id)` blocks until terminal/timeout and returns deterministic terminal info with persisted fallback.
- Compaction carries forward running and unread completed delegation context with retrieval hints.

## Usage

The plugin adds three tools:

| Tool | Purpose |
|------|---------|
| `delegate(prompt, agent)` | Launch a background task |
| `delegation_read(id)` | Retrieve a specific result |
| `delegation_list()` | List all delegations with titles and summaries |

## Notes

This fork blocks delegation in child/subagent sessions and rejects `delegate()` calls that target `mode: subagent` agents. Use native subagent/task flow for subagents, and keep background delegation in parent sessions only.

### Timeout

Delegations timeout after **15 minutes**.

### Upstream Parity Boundaries

This is plugin-compatible lifecycle parity, not runtime-internal parity. It does not replicate:

- Claude/OpenCode internal AppState/task queue internals
- runtime notification priority controls
- runtime-native undo/branching parity for detached background execution

Detached background execution still does not provide runtime-native undo/branching guarantees for side effects, and subagents should continue to use native subagent/task flow.

### Real-Time Monitoring

View active and completed sub-agents using OpenCode's navigation shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+X Up` | Jump to parent session |
| `Ctrl+X Left` | Previous sub-agent |
| `Ctrl+X Right` | Next sub-agent |

## FAQ

### How does the AI know what each delegation contains?

Each delegation is automatically tagged with a title and summary when it completes. When the AI calls `delegation_list()`, it sees all past research with descriptions - not just opaque IDs. This lets it scan for relevant prior work and retrieve exactly what it needs.

### Does this persist after the session ends?

Results are saved to disk and survive context compaction, session restarts, and process crashes. Within a session, the AI can retrieve any past delegation. New sessions start fresh but the files remain on disk.

### Does this bloat my context?

The opposite - it *saves* context. Heavy research runs in a separate sub-agent session. Only the distilled result comes back to your main conversation when you call `delegation_read()`.

### How is this different from Claude Code's Task tool?

Claude's native task tool runs sub-agents but results can be lost when context compacts. This plugin adds a persistence layer - results are written to markdown files, so the AI always knows where to find them.

## Local Development

Build the package locally:

```bash
npm install
npm run build
```

For local file-based testing without publishing to npm, point OpenCode at the built server entry:

```json
{
  "plugin": [
    "file:///absolute/path/to/opencode-background-agents/dist/server.js"
  ]
}
```

If OpenCode is already running, restart it after installation or after rebuilding the package.

For a release-ready check, run:

```bash
npm run typecheck
npm run build
npm pack --dry-run
```

## Contributing

This repository is now a standalone npm-distributed OpenCode plugin. The implementation is still based on the original KDCO background-agents work, but it no longer requires OCX for installation.

## Disclaimer

This project is not built by the OpenCode team and is not affiliated with [OpenCode](https://github.com/sst/opencode) in any way.

## License

MIT
