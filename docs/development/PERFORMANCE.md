# Performance and offline support

## Budget (enforced in CI)

`npm run budget` (`scripts/check-budget.mjs`) measures the production build and fails when a limit is
exceeded. CI runs it right after `npm run build`.

| Measure                                                                | Budget | 2026-11-16 build         |
| ---------------------------------------------------------------------- | ------ | ------------------------ |
| Initial JavaScript, gzipped (entry and modulepreloads in `index.html`) | 110 KB | 103.4 KB (after Phase 6) |
| Initial CSS, gzipped                                                   | 10 KB  | 4.9 KB                   |
| Largest lazily loaded chunk, gzipped                                   | 16 KB  | 13.2 KB                  |
| Whole build, raw                                                       | 900 KB | about 610 KB             |

What a first visit downloads is read from the built `index.html`, so the budget tracks reality as
the bundler's output changes. Every other `assets/*.js` file is a lazy chunk (domains, shared helpers).

If a change breaks the budget, check for an accidental static import of a domain (ADR-0009), a new
dependency, or large inline data. Raising a limit needs a sentence in the PR explaining why.

React and React Router are about 81 KB of the initial 103 KB; the app shell itself is about 22 KB.
Headroom is now 6.6 KB. The next cheap win is lazy-loading the Search, Progress and Paths pages
(listed as a starter issue).

## Engine cost

`npm run bench` times every simulator engine (opt-in; skipped in normal runs and CI). The slowest
step is 0.063 ms (SHA-256 in the hash cracker), far below a 16.7 ms frame. See ADR-0012.

## Offline support (ADR-0011)

A build-generated service worker precaches every file of the site (27 files, about 600 KB) on the
first visit. After that OPENLAB works without a network, including domains not opened before.

- Page loads go to the network first, so a new deploy is picked up, and fall back to the cached
  shell offline. Other requests are served from the cache first.
- The worker is versioned from the build's file list and the public files' contents; a new deploy
  installs a new cache and deletes old ones.
- Registration happens only in production builds. `tests/e2e/offline.spec.ts` checks the offline
  behaviour against `vite preview` and is skipped on the dev server.

Lesson learned: module scripts and stylesheets are requested with `crossorigin`, so they carry an
`Origin` header the precache requests did not. Servers that answer `Vary: Origin` then never matched
in the cache. The worker matches with `ignoreVary`, which is safe because every cached file is static.
