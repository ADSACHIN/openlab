# tests/

| Folder           | Runner                | Purpose                                                                              |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------ |
| `unit/`          | Vitest                | Pure logic in `core/`, `utils/`, `hooks/` (component tests are co-located in `src/`) |
| `integration/`   | Vitest + RTL          | Multiple units together, e.g. registry + router, progress store + UI                 |
| `e2e/`           | Playwright            | Real browser journeys against the dev server or `dist/`                              |
| `accessibility/` | Playwright + axe-core | Automated WCAG audits per route                                                      |

`setup.ts` is the global Vitest setup. Strategy: `docs/development/TESTING.md`.
