# ADR-0005: Vitest + React Testing Library + Playwright + axe-core

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** project owner

## Context

Tests must be fast enough to run on every PR on free CI minutes, must exercise real browsers
for simulators, and must enforce accessibility automatically.

## Decision

- **Vitest** (shares the Vite config; jsdom) for unit and component tests.
- **React Testing Library** + `user-event` for component tests, querying by role/name.
- **Playwright** for e2e on chromium, firefox and a mobile profile.
- **`@axe-core/playwright`** for automated WCAG audits as a dedicated Playwright project.

## Alternatives considered

| Option                        | Pros        | Cons                                                                                    |
| ----------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| Jest                          | Ubiquitous  | Separate transform config from Vite; slower; ESM friction                               |
| Cypress                       | Nice UI     | Heavier, slower in CI, weaker multi-browser story                                       |
| Storybook + interaction tests | Visual docs | Large dependency; defer to a later phase if valuable                                    |
| Manual a11y only              | No tooling  | Not repeatable; axe catches ~30–40 % automatically and that is worth having on every PR |

## Consequences

- One config family (Vite) for build, dev and unit tests.
- Playwright browsers add ~500 MB locally and a few minutes in CI; e2e runs after build, only on PRs/main.
- Coverage via `@vitest/coverage-v8`; thresholds to be enforced from Phase 2.
- Manual screen-reader testing remains a review requirement for new UI.
