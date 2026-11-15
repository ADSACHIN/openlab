# Architecture Decision Records

One file per decision, numbered, never deleted. Superseded ADRs stay and point to their successor.

Template: `0000-template.md`. Status values: Proposed · Accepted · Deprecated · Superseded by ADR-N.

| ADR                                       | Title                                                  | Status   |
| ----------------------------------------- | ------------------------------------------------------ | -------- |
| [0001](0001-static-first-no-backend.md)   | Static-first, client-side only, no backend             | Accepted |
| [0002](0002-hash-router.md)               | Use HashRouter for routing on GitHub Pages             | Accepted |
| [0003](0003-localstorage-persistence.md)  | Persist learner progress in localStorage only          | Accepted |
| [0004](0004-css-modules-and-variables.md) | CSS Modules + CSS custom properties, no UI framework   | Accepted |
| [0005](0005-testing-stack.md)             | Vitest + React Testing Library + Playwright + axe      | Accepted |
| [0006](0006-domain-isolation.md)          | Domain modules are isolated plugins over a core engine | Accepted |
| [0007](0007-svg-first-canvas-fallback.md) | SVG first, Canvas as a measured fallback               | Accepted |
