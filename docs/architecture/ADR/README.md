# Architecture Decision Records

One file per decision, numbered, never deleted. Superseded ADRs stay and point to their successor.

Template: `0000-template.md`. Status values: Proposed · Accepted · Deprecated · Superseded by ADR-N.

| ADR                                       | Title                                                   | Status   |
| ----------------------------------------- | ------------------------------------------------------- | -------- |
| [0001](0001-static-first-no-backend.md)   | Static-first, client-side only, no backend              | Accepted |
| [0002](0002-hash-router.md)               | Use HashRouter for routing on GitHub Pages              | Accepted |
| [0003](0003-localstorage-persistence.md)  | Persist learner progress in localStorage only           | Accepted |
| [0004](0004-css-modules-and-variables.md) | CSS Modules + CSS custom properties, no UI framework    | Accepted |
| [0005](0005-testing-stack.md)             | Vitest + React Testing Library + Playwright + axe       | Accepted |
| [0006](0006-domain-isolation.md)          | Domain modules are isolated plugins over a core engine  | Accepted |
| [0007](0007-svg-first-canvas-fallback.md) | SVG first, Canvas as a measured fallback                | Accepted |
| [0008](0008-typed-content-blocks.md)      | Lessons are typed content blocks, not Markdown or HTML  | Accepted |
| [0009](0009-lazy-domain-loading.md)       | Load domain modules lazily                              | Accepted |
| [0010](0010-i18n-layer.md)                | A small typed i18n layer for UI text                    | Accepted |
| [0011](0011-offline-service-worker.md)    | Offline support with a build-generated service worker   | Accepted |
| [0012](0012-defer-webassembly.md)         | Defer WebAssembly until a simulator measurably needs it | Accepted |
| [0013](0013-shareable-lab-setups.md)      | Share lab setups as replayable action logs in the URL   | Accepted |
