# opencode-background-agents Repo Guide

## Repo purpose

This repository contains a standalone, shareable OpenCode server plugin published as an npm package.

It is not an OCX registry facade anymore. Treat it as a distributable plugin package that installs through `opencode plugin <package>`.

## Source of truth

- Source code lives in `src/`
- Server plugin npm entrypoint lives in `src/server.ts`
- Core plugin logic lives in `src/plugin/background-agents.ts`
- Shared helpers live in `src/plugin/kdco-primitives/`
- Build output lives in `dist/`
- Package metadata lives in `package.json`

When changing behavior, edit `src/` first and rebuild. Do not hand-edit `dist/`.

## Distribution rules

- Package name: `@chenxuan520/opencode-background-agents`
- OpenCode install path: server plugin via `exports["./server"]`
- Do not reintroduce `registry.json` or require OCX for installation
- Keep the plugin installable through:

```bash
opencode plugin @chenxuan520/opencode-background-agents@latest --global
```

- `src/server.ts` plugin `id` must stay aligned with the published npm package identity to avoid runtime identity drift between path installs and npm installs

## Plugin behavior

- The plugin adds `delegate`, `delegation_read`, and `delegation_list`
- It creates child sessions and launches them asynchronously through `session.prompt()` without waiting
- It persists completed results to `~/.local/share/opencode/delegations/`
- It injects delegation context during compaction so unread/running results survive context loss
- This fork does not enforce agent-level safety routing for `delegate`
- Delegated child sessions inherit the selected agent as-is, including broad shell or write permissions if the user configured them

## Dependency rules

- Keep external dependencies minimal and justified
- Current runtime dependencies include:
  - `@opencode-ai/plugin`
  - `@opencode-ai/sdk`
  - `unique-names-generator`
- If install or packaging behavior changes, update `README.md`
- If delegation execution behavior changes, update both `README.md` and this file so they match the actual runtime semantics

## Release expectations

Before claiming the package is ready, run:

```bash
npm run typecheck
npm run build
npm pack --dry-run
```

Prefer also smoke testing installation with OpenCode:

```bash
opencode plugin @chenxuan520/opencode-background-agents@<version>
opencode plugin @chenxuan520/opencode-background-agents@<version> --global
```

If package metadata changes, verify:

- `name`
- `version`
- `repository`
- `homepage`
- `bugs`
- `exports`
- published file list from `npm pack --dry-run`

## Release flow

- Do not add GitHub Actions, CI auto-publish, trusted publishing, release scripts, or other release automation unless the user explicitly asks for it.
- Default release flow for this repo is manual.
- Release checklist:
  1. Confirm the repo changes are the ones you actually intend to publish. Do not mix unrelated local edits into a release.
  2. Bump `package.json` version before publishing.
  3. Verify npm auth with `npm whoami`.
  4. Verify the target version is not already published with:

```bash
npm view @chenxuan520/opencode-background-agents version
```

  5. Run release validation:

```bash
npm run typecheck
npm run build
npm pack --dry-run
```

  6. Publish manually:

```bash
npm publish
```

  7. Verify the published version after release:

```bash
npm view @chenxuan520/opencode-background-agents version
```

  8. If needed, smoke test installation with:

```bash
opencode plugin @chenxuan520/opencode-background-agents@<version>
opencode plugin @chenxuan520/opencode-background-agents@<version> --global
```

- If `npm publish` fails because of auth or package permissions, fix the npm-side access problem or publish manually from a machine/account that already has permission. Do not patch in CI automation unless the user explicitly asks for it.
- Do not commit npm credentials or tokens into the repo.

## Editing guidance

- Prefer small changes over broad rewrites
- Keep the package consumable as a normal npm OpenCode server plugin
- Preserve OpenCode plugin API compatibility
- Do not regress the no-OCX install path
- If adding dependencies, keep them justified and update README when install or publish behavior changes

## Git commit rules

- Commit messages must be in English
- Always use a conventional prefix such as `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Format should be like `feat: add new feature`
- Keep the message concise, but specific enough to describe the main change
