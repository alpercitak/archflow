# Archflow

Single Vite + React 19 app for sketching architecture diagrams; state in Jotai; deployed to Vercel.

- Use Bun for dependencies and package scripts.
- Use `@/` for imports from `src/`.
- For review, diagnosis, or planning, inspect only. For implementation, preserve unrelated user changes.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`, `refactor:`, `style:`, `test:`).

## App Layout

Screen regions live in `features/<name>/index.tsx`, with optional local `components/`, `hooks/`, and `constants.ts`:
top-bar, workspace, canvas-wrapper, node-library, node-inspector, context-menu, status-bar.
`components/ui/*` holds generic primitives; `components/app/*` holds diagram-specific shared pieces.
`stores/<name>/index.ts` holds Jotai atoms. Mutations are `*ActionAtom` write-only atoms defined in the store, not in components.
`hooks/*` holds cross-feature hooks (import/export, file picker). `utils/*` holds one small pure function per file.
`types/index.ts` holds shared domain types.
Each component folder is `index.tsx` + `index.module.css`, with BEM-style class names accessed as `styles['block__element--modifier']`.
Keep tuning values (sizes, timings, zoom limits) in constants, not inline in components.

## Implementation

Treat additional code as a cost.
Smallest change that solves the actual task.
Follow existing patterns.
No hypothetical future requirements, no unrelated refactors, no wrapper/factory/dependency for a single use unless it removes concrete complexity today.
Small duplication beats premature abstraction.
Default, not absolute — if the task genuinely needs structure, build it and say why in one line.
Scope is the task, nothing more.
Worth doing but out of scope → mention it, don't implement it.
If the issue is ambiguous, follow existing convention.

## Defensive Programming

Trust internal TypeScript invariants. No assertions/guards/validation/fallbacks for states this codebase already controls, unless you can name the concrete failure prevented. Validate only at real trust boundaries: imported JSON/YAML files, drag-and-drop payloads, (future) persisted storage. Handle errors only with a real recovery path — otherwise let them propagate. Don't invent recovery, don't swallow, don't build infra for it.

## TypeScript / React

Precise types over runtime checks — no `any`, no unnecessary assertions, no non-null assertions where the type can be modeled correctly. No state unless it affects render/behavior. No derived state duplication. No effect where derivation works. No memoization without a concrete problem. Keep pointer hot-path state (drag, pan, zoom deltas) in refs or read via `store.get`, not React state.

## Stopping

Implement, verify with checks, stop. Don't keep hardening or generalizing once it's done — note anything extra you noticed, don't build it.

## Before Finishing

Run `bun run build`, `bun run typecheck`, `bun run check`, and `bun run test` before finishing.
Keep README accurate when user-facing features change.
Cut from your own diff: unneeded abstractions, redundant guards, one-use helpers, speculative config, unrelated changes, obvious-code comments. Equal correctness → ship the smaller one.
