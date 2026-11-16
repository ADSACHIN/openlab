# ADR-0011: Offline support with a build-generated service worker

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** project owner

## Context

Learners often have unreliable connections. Everything OPENLAB does runs client-side, so once the
files are in the browser there is no reason it should stop working offline. Constraints: static
hosting, no dependencies without need, a strict CSP, and no data leaving the device.

## Decision

A Vite plugin (`scripts/lib/service-worker.mjs`) generates `sw.js` at build time. It precaches every
emitted file plus the public folder, and is versioned from those file names and the public files'
contents. Navigations are network-first with a cached-shell fallback; other same-origin GET requests
are cache-first, matching with `ignoreVary`. Registration happens only in production. A web app
manifest is linked from `index.html`.

## Alternatives considered

| Option                             | Pros                                                        | Cons                                                         |
| ---------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| vite-plugin-pwa or Workbox         | Feature-rich                                                | Large dependency tree for about 40 lines of behaviour        |
| Runtime caching only (no precache) | Smaller first visit                                         | Domains not yet opened would be unavailable offline          |
| Generated precache worker (chosen) | Whole site offline after one visit, no dependency, testable | About 600 KB downloaded in the background on the first visit |

## Consequences

- After the first visit the site works offline, including unopened domains
  (`tests/e2e/offline.spec.ts`).
- The worker caches only the site's own files: no learner data, no third-party requests. The CSP is
  unchanged, because the worker is same-origin (`script-src 'self'`).
- A new deploy takes effect on the next visit after all tabs close (default service-worker update
  semantics). An "update available" prompt is listed as a starter issue.
