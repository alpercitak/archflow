# Archflow

Single Vite + React 19 app for sketching architecture diagrams. State in Jotai; deployed to Vercel.

## Conventions

- Use Bun for dependencies and package scripts.
- Use `@/` for imports from `src/`.
- Use Conventional Commits.

## App Layout

- Screen regions live in `features/<name>/index.tsx`, with optional local `components/`, `hooks/`, and `constants.ts`: top-bar, workspace, canvas-wrapper, node-library, node-inspector, context-menu, status-bar.
- `components/ui/*` holds generic primitives; `components/app/*` holds shared diagram-specific components.
- `stores/<name>/index.ts` holds Jotai atoms. Mutations are write-only `*ActionAtom` atoms defined in stores, not components.
- `hooks/*` holds cross-feature hooks.
- `utils/*` holds one small pure function per file.
- `types/index.ts` holds shared domain types.
- Component folders contain `index.tsx` and `index.module.css`. Use BEM-style class names accessed as `styles['block__element--modifier']`.
- Keep tuning values (sizes, timings, zoom limits) in constants rather than inline in components.

## TypeScript / React

- Use precise types. Avoid `any`, unnecessary assertions, and non-null assertions where types can be modeled correctly.
- Keep state minimal. Derive values instead of duplicating state or using unnecessary effects.
- Avoid memoization without a concrete performance reason.
- Keep pointer hot-path state (drag, pan, zoom deltas) in refs or read via `store.get`, not React state.
- Validate imported JSON/YAML files, drag-and-drop payloads, and persisted data at their trust boundaries.

## Documentation

- Keep the README accurate when user-facing features change.

## Verification

- Run `bun run build`, `bun run typecheck`, `bun run check`, and `bun run test` after implementation.
