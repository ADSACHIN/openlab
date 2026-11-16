# CLAUDE.md — AI-Assisted Development Guide for OPENLAB

This file is read by Claude Code (and other AI assistants) at the start of every session.
It states the non-negotiable constraints, the architecture, and the working conventions.
Humans should read it too; it is the shortest accurate description of how this repo works.

## Project in one paragraph

OPENLAB is a free, open-source, static, client-side learning platform. React 19 + TypeScript +
Vite, routed with React Router **HashRouter**, styled with CSS Modules and CSS variables,
visualised with SVG/Canvas, persisted in `localStorage`, tested with Vitest + React Testing
Library + Playwright, deployed by GitHub Actions to GitHub Pages. Eight isolated learning
domains live under `src/domains/`. There is **no backend**.

## Hard constraints (never violate)

1. **No paid services.** No paid APIs, hosting, databases, auth providers or SaaS.
2. **No backend requirement.** The app must fully work from the static `dist/` folder.
3. **No mandatory authentication.** Progress is local-only, in `localStorage`.
4. **No tracking / telemetry.** No analytics, no beacons, no third-party scripts.
5. **No unnecessary dependencies.** Prefer platform APIs. Justify every new package in the PR.
6. **Domains are isolated.** `src/domains/<a>` must never import from `src/domains/<b>`.
   Shared code goes through `src/core`, `src/components`, `src/hooks` or `src/utils`.
7. **Accessibility is mandatory.** Keyboard operable, labelled, respects `prefers-reduced-motion`.
8. **Never fabricate test results.** Run the command; paste the real output; say if it fails.
9. **No destructive commands** (`rm -rf`, `git reset --hard`, force-push) without explicit approval.
10. **No commits or pushes** unless the user asks for them in that message.

## Repository map

```
src/app          shell, router, providers, layouts            (depends on: core, components, domains)
src/core         learning engine: model (types, define* helpers), registry (validation, DAG, routes), progress (store, schema, import/export), search, storage  (depends on: types, utils; React *types* only)
src/components   shared presentational + interactive UI       (depends on: hooks, styles, types, utils)
src/domains/*    one folder per domain; exports a DomainModule (depends on: core, components, hooks, types, utils)
src/data         static catalogues (domain index, tags)       (depends on: types)
src/hooks        shared React hooks                            (depends on: utils, types)
src/styles       design tokens (CSS variables), reset, themes  (no TS deps)
src/types        shared TypeScript types                       (no deps)
src/utils        pure functions                                (depends on: types)
tests/           unit · integration · e2e · accessibility
docs/            architecture (+ADRs) · development · security · contribution
.github/         CI (ci.yml) and Pages deployment (deploy.yml)
```

Dependency direction is strictly downward in the table above. Details:
`docs/architecture/MODULE_DEPENDENCIES.md`.

## Commands

```bash
npm install            # once
npm run dev            # Vite dev server at http://localhost:5173/openlab/
npm run build          # tsc -b && vite build → dist/
npm run validate       # typecheck + lint + format:check + unit tests  (run before every PR)
npm run test           # Vitest (unit + integration)
npm run test:e2e       # Playwright
npm run test:a11y      # Playwright axe-core project
```

## Conventions

- **TypeScript strict**, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. No `any`.
- **Imports:** use path aliases (`@core/...`, `@components/...`, `@typings/...` for `src/types` — `@types/` is reserved by TypeScript). Type-only imports use `import type`.
- **Components:** function components, named exports, one component per file, co-located
  `*.module.css` and `*.test.tsx`.
- **Styling:** CSS Modules for scoping, CSS custom properties from `src/styles/tokens.css` for
  values. No inline style objects except for computed geometry in visualisations.
- **Visualisation:** SVG for diagrams with < ~500 nodes and anything needing DOM accessibility;
  Canvas for high-frequency animation. Every visual has a text alternative.
- **State:** React state + context. Persistence only through `src/core/progress` — never call
  `localStorage` directly from a component.
- **Routing:** HashRouter. Routes are registered by domain modules, not hard-coded in app.
- **Commits:** Conventional Commits (`feat(networking): ...`). See CONTRIBUTING.md.
- **Docs:** when behaviour or architecture changes, update the relevant doc in the same PR and
  add a line to `DEVELOPMENT_PROGRESS.md`. Architectural decisions get an ADR.

## Working style expected from AI assistants

- Work in small, reviewable steps. Explain decisions and assumptions in the reply.
- Read before editing. Never overwrite a file without showing what changes.
- Prefer editing existing files to creating new ones; prefer deleting to deprecating.
- When blocked on a human decision (identity, credentials, paid anything), stop and ask.
- Keep `DEVELOPMENT_PROGRESS.md` current at the end of every work session.

## Current phase

**Phases 0–6 complete (2026-11-16).** All eight domains, lazy loading, offline support, an i18n
foundation, a CI performance budget, generators, learning paths (`#/paths`) and shareable lab
setups (ADR-0013). WebAssembly is deferred by ADR-0012. The roadmap has no further phases; new work
needs the owner’s direction. See `ROADMAP.md`.

### Authoring a domain module (see `src/domains/networking` for the reference implementation)

- Export one `DomainModule` from `src/domains/<id>/index.ts` using `defineModule`, `defineLesson`,
  `defineLab`, `defineSimulator` from `@core/model`; register it as a **lazy loader** in
  `src/app/modules.ts` (`import()` only — a static import of `@domains/*` in `src/app` defeats the
  per-domain chunks, ADR-0009). Pages that need domain data call `useDomains([...])`.
- Ids are `<domainId>/<slug>`; prerequisites reference lesson ids and may cross domains.
- Simulator engines are pure and seeded (`init`, `step`, optional `apply`/`isDone`, `describe`).
  Views receive `{ state, dispatch, reducedMotion }` and render inside `SvgStage` where possible.
- Lab `check(state)` is pure and returns `{ passed, message, score? }`.
- Simulators driven only by the learner (a shell, a form, a slider) set `controls: 'reset'` so the
  host hides Play/Step/Speed.
- Every number stated in lesson prose or used as a lab threshold gets a unit test that computes it.
- `tests/unit/all-modules.test.ts` fails if a `src/domains/<id>/index.ts` exists without a loader.
- Scaffold with `npm run new:lesson|new:simulator -- <domain> <slug>`; the full checklist is in
  `docs/contribution/AUTHORING_GUIDE.md`.
- UI chrome text goes through `useT()` and `src/i18n/messages/en.ts` (ADR-0010); domain content stays
  in the domain.
- `npm run budget` must pass after `npm run build` (CI enforces it). Offline support: ADR-0011.
- Engines must validate `apply` input: shared setups (ADR-0013) feed them untrusted actions, and
  `tests/integration/share-fuzz.test.ts` replays junk logs against every simulator.
- `npm run bench` times every engine (opt-in, not in CI); see ADR-0012 before proposing WebAssembly.
- Node scripts are `.mjs` with JSDoc types, because this machine's Node build has no TypeScript
  stripping; `tsc` checks them via `tsconfig.node.json`.
- The registry throws at startup on duplicate ids, bad slugs, dangling prerequisites, cycles,
  unknown simulators and invalid quizzes, so `npm run test` catches authoring mistakes.
