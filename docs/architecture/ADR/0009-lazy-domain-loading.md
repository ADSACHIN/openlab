# ADR-0009: Load domain modules lazily

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** project owner

## Context

With three domains registered, every domain's lessons, simulators and views shipped in the main
bundle: 148 KB of app JavaScript (49 KB gzipped) on first load, growing by roughly 30 KB per domain.
Five more domains are planned. Most learners open one domain at a time.

Two things need data from every domain: the home catalogue (which domains are available) and
search / progress totals. Cross-domain prerequisites also mean the registry must see a domain's
dependencies before it can validate it.

## Decision

- `src/app/modules.ts` maps each domain id to a dynamic `import()`. Vite emits one chunk per
  domain, named `assets/domain-<id>-<hash>.js`.
- `src/app/moduleStore.ts` loads domains on demand, shares in-flight requests, loads domains
  referenced by cross-domain prerequisites or simulator ids, and exposes only modules whose
  dependencies are all present. Failed loads reject and can be retried.
- Pages declare what they need with `useDomains(ids | 'all')`, which suspends via React `use()`.
  A `Suspense` boundary around the routed outlet shows an accessible loading state.
- The home catalogue reads `registered` ids from the store, so it downloads no domain code.
- `tests/unit/all-modules.test.ts` loads every domain and validates them as one registry, so
  cross-domain authoring errors are still caught even though the app never loads them all at once.

## Alternatives considered

| Option                                             | Pros                                                                | Cons                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Keep one bundle                                    | Simplest                                                            | Grows linearly with content; every learner pays for every domain                       |
| `React.lazy` per page component                    | Built in                                                            | Domain data, not page components, is the heavy part; registry and search still need it |
| Per-domain manifest (metadata eager, content lazy) | Search works without loading domains                                | Duplicated metadata to keep in sync by hand or with a build step                       |
| Lazy module store (chosen)                         | No duplication; tiny first load; search/progress load all on demand | Search and progress pages pay for all domains when opened                              |

## Consequences

- First-load app JavaScript dropped from 148 KB to 60 KB (49 → 20 KB gzipped); each domain is
  27–35 KB (9–12 KB gzipped) and downloads only when opened.
- New domains are registered as a loader, not a static import. A static import of
  `@domains/*` anywhere in `src/app` would silently undo the split; review for it.
- Search and progress trigger a load of every domain. Acceptable today; a build-time metadata
  manifest can replace this if the domain count makes it slow.
- `tests/e2e/lazy-loading.spec.ts` asserts which domain code the browser actually fetches, in
  both the dev server and the production build.
