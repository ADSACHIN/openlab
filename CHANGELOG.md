# Changelog

All notable changes to OPENLAB are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Fixed

- The lazy-loading e2e test misread chunk names whose content hash starts with "-" in production.
- An invalid `<dl>` structure in the perceptron view (axe: definition-list).
- A race in the skip-link e2e test (Tab pressed before the app rendered).

- The Play/Pause icon could show Pause next to the word "Play" after a run finished on its own.

- Production builds logged a console error on every page: `frame-ancestors` is ignored in a
  meta-delivered CSP. Removed it; the security policy now documents why.
- Lazy loading called `use()` conditionally, which React warns about; it now always calls `use()`.

### Added

- Phase 6: learning paths across domains (`#/paths`, "Path to this lesson" links), shareable lab
  setups as replayable action logs with strict validation and fuzz tests, a per-simulator error
  boundary, and an opt-in engine timing check (`npm run bench`). WebAssembly evaluated and deferred
  (ADR-0012).

- Phase 5: offline support (service worker and manifest), an i18n foundation for UI text with a
  pseudo-locale test, a CI performance budget, `new:lesson` and `new:simulator` generators,
  authoring and translation guides, and starter issues.

- System Design, Cloud & DevOps and AI & ML domains (Phase 4e–g), completing all eight domains:
  38 lessons, 37 simulators and 17 graded labs. Cross-domain prerequisites now link Cloud & DevOps
  to Linux & OS and AI & ML to Computer Science.
- Shared seeded random-number helpers in `src/utils/random.ts` (pure `nextRandom` for engine state).

- Cybersecurity domain (Phase 4d): Caesar cipher with brute force, password entropy estimator,
  dictionary attack on salted and unsalted SHA-256 hashes, SQL injection against a small SQL
  interpreter (with the parameterized fix), and a simulated XSS comment box that never injects
  HTML; five lessons and two graded labs. First cross-domain prerequisite (SQL injection →
  Programming).
- Simulators can hide playback controls (`controls: 'reset'`) when time has no meaning.

- Computer Science domain (Phase 4c): 8-bit register with two's complement and hex, logic gates
  with truth tables, 4-bit ripple-carry adder, tiny accumulator CPU with fetch–decode–execute, and a
  divisible-by-3 finite automaton; five lessons with quizzes and two graded labs.

- Lazy domain loading (ADR-0009): each domain is its own chunk, downloaded on first use; first-load
  app JavaScript dropped from 148 KB to 60 KB. Accessible loading state while a domain downloads.

- Programming domain (Phase 4b): line-by-line code tracer with a deliberately buggy variant,
  stack/queue playground, sorting visualiser (bubble, insertion, selection on random, nearly
  sorted and reversed input), binary search; five lessons with quizzes and two graded labs.

- Linux & OS domain (Phase 4a): sandbox shell with an immutable virtual filesystem and real
  permission checks, permission-bits explorer, round-robin scheduler, FIFO/LRU paging; five lessons
  with quizzes and two graded labs (secure an SSH key, tune the quantum).

- Networking domain (Phase 3): six lessons (OSI layers, encapsulation, IP addressing, DNS, TCP
  handshake, TLS 1.3), six simulators, two graded labs, quizzes; InlineText now renders **bold**.

- Learning engine (Phase 2): typed content model, validating module registry with prerequisite
  graph, versioned progress store with JSON export/import, lesson renderer, simulator host,
  SVG stage, client-side search, and domain/lesson/lab/search/progress pages.

- Application shell (Phase 1): HashRouter routing, responsive layout with skip link, light/dark/system
  theme with reduced-motion support, home page domain catalogue, domain placeholder pages, 404 page,
  error boundary, production Content Security Policy, and the first unit, component, e2e and
  accessibility tests.
- Project foundation (Phase 0): documentation, architecture decision records, directory
  structure, tooling configuration, CI/CD workflow definitions, MIT license.

[Unreleased]: https://github.com/ADSACHIN/openlab/compare/main...HEAD
