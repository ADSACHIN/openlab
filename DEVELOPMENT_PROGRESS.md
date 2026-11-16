# Development Progress

Living log. Newest entries at the top of each section. Update at the end of every work session.
Phase definitions: [ROADMAP.md](ROADMAP.md).

## Current status

| Item                                              | State                                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Phase                                             | **6 — Advanced labs: complete**; all roadmap phases done                                            |
| Phases 0–3 + three Phase 4 domains + lazy loading | Complete locally; deployment waits on the GitHub push                                               |
| Next                                              | Owner to decide (commit and push first; then starter issues or new content)                         |
| Live deployment                                   | None yet                                                                                            |
| Git                                               | `main` at `a9210fd`; Phases 4–6 uncommitted (auto-mode blocks `git commit`; owner commits manually) |
| GitHub remote                                     | `origin` → github.com/ADSACHIN/openlab (push blocked on credentials)                                |

## Blockers / manual actions required

| #   | Action                                                                       | Owner         | Status  |
| --- | ---------------------------------------------------------------------------- | ------------- | ------- |
| 1   | Install npm — done 2026-11-15 (npm 12.2.0 via apt after `apt update`)        | Project owner | ✅ Done |
| 2   | First commit `004a900` made 2026-11-15 after approval                        | Done          | ✅ Done |
| 7   | Commit Phase 1 work (awaiting approval)                                      | Project owner | ⏳ Open |
| 3   | Create GitHub repository `openlab` (gh CLI or web UI) and push               | Project owner | ⏳ Open |
| 4   | Enable GitHub Pages with source = GitHub Actions                             | Project owner | ⏳ Open |
| 5   | Replace `<github-username>` placeholders — set to `ADSACHIN14` on 2026-11-14 | Claude Code   | ✅ Done |
| 6   | (Optional) Install GitHub CLI                                                | Project owner | ⏳ Open |

## Log

### 2026-11-16 — Phase 6: advanced labs complete

- **Learning paths**: `src/core/paths` (prerequisite closure, global topological order, summary, suggested cross-domain goals) and `#/paths` with a goal picker, suggestions, ordered steps with progress and "Next up"; goal is in the URL; "Path to this lesson" on lessons with prerequisites. The Containers path is 5 lessons across 2 domains, about 43 minutes (tested). A test exposed "1 domains"; the summary is now pluralised per part.
- **Shareable lab setups (ADR-0013)**: `src/utils/share` (action log, base64url encoding, strict decoding with size/entry/step caps, replay that never throws), `SimulatorHost` records history and accepts `initialLog`, a per-simulator error boundary, and "Copy link to this setup" on labs with a visible fallback link. Fuzzing: 925 junk logs across all 37 simulators, none escapes replay. The helpers live in utils because components may not import core runtime code.
- **WebAssembly (ADR-0012)**: evaluated and deferred. `npm run bench` (opt-in timing via `VITE_BENCH=1`; Vitest 5 no longer exports `bench`) shows the slowest engine at 0.063 ms per step against a 16.7 ms frame. Revisit criteria recorded.
- **Budget**: initial JS 103.4 / 110 KB gz; lazy-loading three pages is listed as a starter issue to restore headroom.
- **Totals**: 228 Vitest tests (+1 opt-in timing check); Playwright 81 on the dev server (+1 production-only skip, zero console errors) and 38 on the production preview.

### 2026-11-16 — Phase 5: community & polish complete

- **Performance budget**: `scripts/lib/budget.mjs` and `npm run budget`, run in CI after the build. Initial JS 100.4 of 110 KB gzipped, initial CSS 4.9 of 10 KB, largest lazy chunk 13.2 of 16 KB, build about 610 of 900 KB. Initial assets are read from the built `index.html`.
- **Offline (ADR-0011)**: build-generated `sw.js` precaches every file (27); network-first navigations with a cached-shell fallback, cache-first assets; manifest linked. The new e2e test found a real bug: crossorigin requests carry `Origin`, so `Vary: Origin` responses never matched the precache. Fixed with `ignoreVary` plus a regression assertion. `tests/e2e/offline.spec.ts` goes offline and opens a domain not yet visited (production only).
- **i18n foundation (ADR-0010)**: `src/i18n` (typed catalogue, `Intl.PluralRules`, `Intl.NumberFormat`, English default context, `<html lang>`), about 125 keys. App shell, every page and the shared components were migrated with the English text unchanged. A pseudo-locale integration test proves header, footer, hero, lesson chrome, quiz and simulator controls use the catalogue; it caught the untranslated speed options, which are now locale-formatted (×0,5 in German).
- **Generators**: `npm run new:lesson|new:simulator -- <domain> <slug>` validate input, never overwrite, and Prettier-format their output. Verified by generating into Networking and running typecheck, lint, the format check, the generated test, and a registry-plus-render test, then deleting the samples. The first version produced unformatted files that would have failed CI.
- **Docs**: `AUTHORING_GUIDE.md`, `TRANSLATING.md`, `PERFORMANCE.md`, `GOOD_FIRST_ISSUES.md` (10 issues), ADR-0010 and ADR-0011; module dependencies, security policy, contributing, setup and CLAUDE.md updated.
- **Decision**: scripts are `.mjs` with JSDoc types, because this machine's Node (Debian build) has no TypeScript type stripping (`process.features.typescript === false`); `tsc` checks them via `tsconfig.node.json` with `checkJs`.
- **Totals**: 209 Vitest tests; Playwright 77 on the dev server (plus 1 production-only skip, zero console errors) and 36 on the production preview, including offline.

### 2026-11-16 — Phase 4e–g: System Design, Cloud & DevOps, AI & ML; Phase 4 complete

- **Shared**: seeded RNG moved to `src/utils/random.ts` (domains may not import each other) with a pure `nextRandom` so engines keep RNG state in their own state; Programming updated, results unchanged.
- **System Design**: load balancer (round robin / least connections / random over speeds 3, 3, 1; capacity 3.5 req/tick), LRU cache under Zipf(20) traffic (top 4 ≈ 58% of requests; 60% hit ratio first at size 6; full-size cache still 90% because of 20 cold misses), message queue with a burst (Little’s law L = λW verified exactly over a drained run), replication quorum (stale exactly when R + W ≤ N, checked for all 9 settings). Labs: 5 req/tick with zero drops on the fewest servers (least connections on 4; round robin drops even on 6), right-size the cache.
- **Cloud & DevOps**: commit graph (fast-forward vs two-parent merge), CI/CD job graph (11 → 8 time units by parallelising; failing unit test skips build/E2E/deploy), Docker layer cache (48 s → 17 s for a source edit; 17 s proven optimal over every valid order), error budget (99.9% = 43.2 min/30 days; this month runs out on day 19). Containers lesson depends on `linux-os/processes`. Labs: merge a feature, fast-and-safe pipeline, cache-friendly Dockerfile.
- **AI & ML**: perceptron (separable data converges in 2 epochs; XOR never converges, brute force shows no line gets every point), gradient descent on x² + 10y² (converges iff 0 < lr < 0.1; 0.08/0.09 reach loss < 0.01 within 30 steps; 0.1 oscillates; 0.11 diverges), BPE on the Sennrich corpus (95 → 48 tokens in 6 merges), softmax temperature (mat ≈ 49.8% at T=1, 32.7% at T=2, > 99.9% at T=0.1). Perceptron lesson depends on `computer-science/logic-gates`. Labs: tune the learning rate, compress the corpus with the minimum merges. Catalogue copy changed from "neural networks / attention" to what is actually taught; attention deferred.
- **Corrections caught before shipping**: Little’s-law prose claimed L = λW mid-run (true only once drained; screenshot showed 17.6 vs 18.2); SLO exhaustion day was 19 not 11 in my own test; tokenizer lab check was a placeholder; perceptron `<dl>` contained a `<p>` (axe); "Learning rate"/"Temperature" locators also matched page titles; lazy-loading e2e misread `domain-linux-os--IvjgpHb.js` in production; skip-link e2e pressed Tab before render.
- **Totals**: 38 lessons, 37 simulators, 17 labs. 190 Vitest; 77 Playwright on dev (zero console errors); 35 e2e on the production preview. First-load app JS 61 KB (20 KB gz); domain chunks 25–35 KB each.

### 2026-11-16 — Phase 4d: Cybersecurity domain built

- `src/domains/cybersecurity`: dependency-free **SHA-256** (passes NIST FIPS 180-4 vectors including the two-block case); **Caesar** cipher with a 26-key brute-force attacker scoring English words; **password estimator** (length × log₂ pool, grapheme-accurate length, common-password list, brute-force time at 10¹⁰ guesses/s); **dictionary attack** on four leaked accounts (unsalted: 10 hashes, duplicates visible; salted: 40 hashes; both crack the same 3 weak passwords); **SQL injection** against an in-memory table via a small tokenizer and precedence-correct WHERE parser (`admin' --`, `' OR '1'='1`, O'Brien syntax error) with a parameterized mode; **XSS** simulator that renders markup as text only and models script-tag, event-handler and javascript: URL vectors.
- Lessons: encryption and keyspace, passwords and entropy, hashing and salting, SQL injection (first cross-domain prerequisite → `programming/state-and-steps`), cross-site scripting. Labs: bypass the vulnerable login (then watch parameterized queries stop it), neutralise an XSS payload by escaping output.
- Numbers pinned by tests: 26 keys; 37.6 / 72.3 / 117.5 naive bits; 9,012 years; 44 bits ⇒ 15 minutes fast vs 28 years slow; 10 vs 40 hashes; AES-128 ≈ 10¹⁹ years at 10¹² keys/s stated in prose.
- New core option: `controls: 'reset'` hides Play/Step/Speed for learner-driven simulators (terminal, permission bits, subnet planner, SQL login). Fixed the Play/Pause icon reading the stale `running` flag.
- Caught by testing: the domain was initially **not registered** (a Prettier-wrapped line made an insert miss silently) yet all unit tests passed; `tests/unit/all-modules.test.ts` now compares `src/domains/*/index.ts` against `MODULE_LOADERS`. Edit scripts now throw when an anchor is not found.
- e2e: three Cybersecurity journeys, a cross-domain lazy-loading assertion (opening SQL injection fetches `cybersecurity` + `programming` only), and a check that the XSS lab never creates a `<script>` in the page. Playwright workers capped at 2: at 3 the ~60-test suite produced false timeouts under load.
- Totals: 140 Vitest; 57 Playwright on dev (zero console errors); 27 e2e on the production preview with CSP.

### 2026-11-16 — Phase 4c: Computer Science domain built; two latent bugs fixed

- `src/domains/computer-science`: **8-bit register** (unsigned, two's complement, hex; counting wraps 255 → 0), **logic gates** (AND, OR, NOT, NAND, NOR, XOR with live truth table), **4-bit ripple-carry adder** (full adders chained by carries, one column per step, overflow shown), **tiny CPU** (accumulator machine; LDA/ADD/SUB/STA/JMP/JZ/OUT/HLT; each step is one fetch, decode or execute phase; editable data cell; 200-instruction runaway guard), **DFA** recognising binary multiples of 3.
- Lessons: bits and two's complement, logic gates, adders, how a CPU runs, finite automata. Labs: overflow to zero (A + B = 16), reprogram the countdown to 5 (30 instructions).
- Every number in the lessons is pinned by a test: 1011 = 11, FF = 255, 11111111 = −1, NAND/XOR tables and NAND universality, full 16 × 16 adder sweep, 9 + 8 → 0001 carry 1, 5 + 3 carry chain, countdown from 3 = 18 instructions = 54 steps, DFA agrees with n mod 3 for n ≤ 1024.
- Catalogue copy for the domain no longer promises a compilers topic.
- **Fixed — conditional `use()`**: `useDomains` skipped `use()` once loaded; React logs an error when a component that suspended through `use()` stops calling it. It now always calls `use()` with a pre-fulfilled promise. Found because the warning was in dev-server output that earlier test runs filtered out.
- **Fixed — CSP console error**: `frame-ancestors` is ignored in a meta CSP and Chromium logs an error on every production page. Removed; `docs/security/SECURITY_POLICY.md` corrected (it had called the directive "advisory").
- **Fixed — adder layout**: carry-out digit was drawn off-canvas; caught in screenshot review.
- Accessibility: adder labels moved outside their selects so the accessible name is "A", not "A 9 (1001)".
- Tests: `tests/e2e/lazy-loading.spec.ts` now fails on any browser console error. 121 Vitest, 26 e2e + 26 axe (dev), 23 e2e (production preview with CSP).

### 2026-11-16 — Lazy domain loading (ADR-0009)

- `src/app/moduleStore.ts`: on-demand loading with shared in-flight requests, transitive loading of cross-domain dependencies, cycle-safe, closed-set registry snapshots, retry after failure. `useDomains(ids | 'all')` suspends pages via React `use()`; `PageLoading` is the Suspense fallback.
- Home reads registered ids only; domain/lesson/lab pages load one domain; search and progress load all.
- Build: app JS 148 → 60 KB (49 → 20 KB gz); domain chunks 27–35 KB each, named `domain-<id>-<hash>.js`; domain CSS split as well.
- Tests: 8 store unit tests, `tests/unit/all-modules.test.ts` validates every domain together, `tests/e2e/lazy-loading.spec.ts` asserts fetched domain code. Verified against the dev server and the production preview (with CSP).

### 2026-11-15 — Phase 4b: Programming domain built

- `src/domains/programming`: seeded PRNG helper; **code tracer** engine driven by a tiny line table (each line is a pure `run(env)`), with a correct sum program and an off-by-one variant for the debugging lesson; **stack/queue** engine with a scripted demo; **sorting** engine that precomputes the whole trace (bubble/insertion/selection × random/nearly-sorted/reversed) so stepping is trivial and deterministic; **binary search** engine with textbook auto-play and manual probes.
- Lessons: state and steps, stacks and queues, sorting, searching and Big-O, debugging — each with quiz. Labs: nearly-sorted data under 20 comparisons (insertion), find the target in five guesses.
- Corrections found by tests before commit: binary search list is 31 items (2⁵−1) so “five probes” is a true worst case (32 can need 6); the Big-O quiz now asks about 1,023 items; the nearly-sorted lab threshold is ≤ 12 comparisons because bubble sort with early exit (17) passed the old < 20 bound; the stack/queue auto-play now terminates; the tracer lesson says 16 steps, not 15. New tests pin these (200-seed binary search sweep, exact comparison counts).
- Tests: engines (tracer outputs 10 vs 6, LIFO/FIFO, all 9 sort configurations sort and are deterministic, insertion beats others on nearly sorted, selection = 45 comparisons), module grading; three Playwright journeys; axe on a Programming lesson and lab.

### 2026-11-15 — Phase 4a: Linux & OS domain built

- `src/domains/linux-os/lib/vfs.ts`: immutable path-keyed virtual filesystem with owner/other permission checks, mkdir/write/remove/chmod, coreutils-style error strings; seeded home machine (`/etc`, `/home/learner/.ssh`, `/proc`, `/var/log`…).
- Simulators: **terminal** (help, pwd, ls -la, cd, cat, echo with > and >>, mkdir, touch, rm -r, chmod octal, stat, whoami, hostname, clear; command history with arrow keys), **permission-bits** (3×3 toggles, octal/symbolic readout, directory semantics, presets), **round-robin scheduler** (three-process workload, Gantt timeline, context switches, response/waiting averages), **paging** (textbook reference string, FIFO 15 faults vs LRU 12 with 3 frames).
- Lessons: shell basics, filesystem tree, permissions, processes & scheduler, virtual memory — each with quiz and embedded simulator. Labs: secure the SSH key (600/700), tune the quantum (≤ 6 ms and ≤ 4 switches).
- Tests: vfs, engines (session replay, scheduler timeline, textbook paging counts), module grading; three Playwright journeys; axe on a Linux lesson and lab.
- Note: the terminal reconstructs past prompts by replaying `cd` commands; only the current cwd is state.

### 2026-11-15 — Phase 3: Networking domain built

- `src/domains/networking`: `lib/ipv4.ts` (pure address maths), six engines with tests (layer explorer, encapsulation, DNS referral chain, TCP handshake with seeded ISNs and mistake counting, TLS 1.3 flight sequence, subnet planner), six SVG views, a shared `SequenceDiagram` component, six lessons with outcomes/prerequisites/quizzes, two graded labs, module test.
- Registered in `src/app/modules.ts`; Networking shows as Available in the catalogue; search and progress now have real content.
- `InlineText` gained `**bold**` support (still no HTML interpretation).
- Tests: 72 Vitest; Playwright adds a five-test networking journey (lesson + quiz + completion, both labs, search) and axe now audits a lesson and a lab route.
- Build: app chunk 87 KB (gzip 29 KB). All domains ship in one chunk for now; per-domain lazy loading is deferred until a second domain exists (noted in ROADMAP).
- Known content limits: lessons are intentionally compact first versions; diagrams are static SVG sequence/box drawings rather than animated packet flows.

### 2026-11-15 — Phase 2: learning engine built

- `src/core/model`: `DomainModule`, `Lesson`, `Lab`, `SimulatorDefinition/Engine`, `ContentBlock` union, `Quiz`; `define*` helpers derive ids. Core imports only the `ReactNode` _type_. ADR-0008 records the typed-blocks decision.
- `src/core/registry`: validates ownership, slugs, duplicate ids, dangling prerequisites, unknown simulators, quiz integrity; topological lesson order with cycle path reporting; `routes()`, `prerequisitesOf`, `dependentsOf`.
- `src/core/progress`: strict v1 schema (unknown keys rejected, prototype-pollution safe), `createProgressStore` with subscribe/debounced persist/flush, lab attempts with best score, quiz results, last visited, export/import (replace or merge, 256 KB cap, version check).
- `src/core/search`: tokeniser, weighted prefix index, AND semantics.
- Components: `LessonRenderer`, `InlineText`, `CodeBlock`, `Callout`, `Quiz`, `SimulatorHost`, `ContentList`, `viz/SvgStage`; hook `useAnimationFrame`.
- App: `RegistryProvider`, `ProgressProvider` (flush on pagehide/visibilitychange), `RouteTracker`, pages Lesson/Lab/Search/Progress, Domain page lists content with completion, Home shows "continue" and derives availability from the registry. `App` accepts injected modules/store for tests.
- Tests: 56 Vitest (unit, component, integration via `tests/fixtures/exampleModule.tsx`), a11y spec now covers search and progress routes.
- React Compiler lint rules (react-hooks 7) shaped the design: no ref writes in render, no setState in effects; the frame loop keeps an authoritative state ref and announces from the loop.
- Decisions: interfaces use property-function types (unbound-method rule); `View` is a plain render function so heterogeneous simulators fit one registry; `src/app/modules.ts` is empty until Phase 3, so production behaviour is unchanged apart from the new Search/Progress pages.

### 2026-11-15 — Phase 1: application shell built

- `index.html` (no inline scripts, SVG favicon, noscript notice), `src/app/main.tsx`, `App.tsx`, `routes.tsx`.
- Layout: sticky header with brand, primary nav, theme toggle; skip link; focusable `<main>`; footer with the no-tracking promise.
- Theming: `src/styles/tokens.css` light/dark/system via `data-theme`, OS fallback through `prefers-color-scheme`; reduced motion via media query and `data-motion` override.
- Preferences: `src/core/storage/safeStorage.ts` (only module touching localStorage, defensive) + `src/core/preferences` (versioned schema, strict guard). App-level `PreferencesProvider` reflects to `<html>`.
- Pages: home (hero + 8-domain catalogue from `src/data/domains.ts`), domain placeholder (`#/domains/:id`), 404. Class-based `ErrorBoundary` (the one sanctioned class component).
- Components: `DomainCard`, `DomainIcon`, `StatusBadge`, `ThemeToggle` (stateless; app wires state). `cx()` util for CSS Module classes under `noUncheckedIndexedAccess`.
- Security: production-only CSP meta injected by a Vite plugin (dev needs HMR websocket and Fast Refresh inline script).
- Tests: 21 Vitest (unit + component), 6 Playwright e2e, 6 axe audits (3 routes × light/dark) — all pass locally in Chromium. Chromium installed via `npx playwright install chromium` (no sudo needed).
- Build: `dist/` = 21 KB app JS + 255 KB React vendor chunk + 11.5 KB CSS (gzip 8.2 / 81 / 3 KB).
- Decisions: path alias for `src/types` is `@typings/*` because TypeScript reserves `@types/`; `role="list"` kept on the catalogue `<ul>` (Safari drops list semantics with `list-style: none`) with a justified lint disable; removed `passWithNoTests`.
- Not done: push and first Pages deployment (no GitHub repository yet).

### 2026-11-15 — Tooling validated with real installs

- npm 12.2.0 confirmed on PATH; `npm install` run for the first time (362 packages, `package-lock.json` created).
- First install surfaced 13 audit findings (2 critical in Vitest 3's tinypool) and a toolchain one major behind. Upgraded, after checking registry peer ranges:
  Vite 7→8.3 (Rolldown), @vitejs/plugin-react 5→6.3, Vitest 3→5.1, coverage-v8 5.1, React 19.3, React Router 7→8.5, lucide-react 0.55→1.73, jsdom 27→31, jest-dom 6→7, react-hooks plugin 6→7, react-refresh plugin 0.4→0.5, globals 16→17, axe-core/playwright 4.14, Playwright 1.65.
- Kept ESLint 9.39 and TypeScript 5.9 deliberately (see decisions). Audit now: 0 critical/high, 7 moderate, all in typescript-eslint with no fixed release yet.
- Vite 8 breakages fixed: `manualChunks` object → Rolldown `codeSplitting`; Vitest config merged into `vite.config.ts` (single file, as Vitest recommends) and `vitest.config.ts` removed.
- Added `src/vite-env.d.ts` so `tsc -b` has an input; added `tests/setup.ts` to `tsconfig.app.json`; ran Prettier once over all files.
- Node engine floor raised to `>=22.22.0` (React Router 8 requirement). `.nvmrc` stays 24.
- Verified (real output, not claimed): `typecheck` ✅, `lint` ✅, `format:check` ✅, `vitest run --passWithNoTests` ✅, `playwright test --list` loads config ✅, and a throwaway fixture built with the project `vite.config.ts` under Vite 8 ✅ (correct `/openlab/` base, CSS Modules, separate React vendor chunk).
- `test.passWithNoTests: true` set in `vite.config.ts` so `npm run validate` and CI stay green until Phase 1 adds the first test (comment marks it for removal).
- Still no application code, tests, commits or remote.

### 2026-11-14 — Phase 0 executed

**Phase 0A — Environment discovery**

- Workspace confirmed empty. OS is Kali Linux Rolling 2026.3 (Debian-based), not Ubuntu.
- Node 24.21.0 and Git 2.53.0 present. npm, npx and gh absent. Git identity was unset.
- Report: `docs/development/ENVIRONMENT_REPORT.md`.
- Owner subsequently set Git `user.name`, `user.email`, `init.defaultBranch=main`. ✅
- Owner reported npm installed, but it is not on PATH and no binary was found. ⚠️ Still open.

**Phase 0B — Architecture**

- Static-first React/TS/Vite SPA on HashRouter, GitHub Pages deploy, localStorage persistence.
- Domain-isolated module architecture with a core learning engine.
- ADRs 0001–0007 written.

**Phase 0C — Documentation**

- Root: README, CLAUDE, ROADMAP, DEVELOPMENT_PROGRESS, CHANGELOG, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE (MIT), SECURITY.
- `docs/architecture`: ARCHITECTURE, SYSTEM_ARCHITECTURE, KNOWLEDGE_GRAPH, DATA_FLOW, MODULE_DEPENDENCIES, ADR/.
- `docs/development`: ENVIRONMENT_REPORT, SETUP, CODING_STANDARDS, TESTING, INITIALIZATION_REPORT.
- `docs/security/SECURITY_POLICY.md`, `docs/contribution/CONTRIBUTING_GUIDE.md`.
- Mermaid diagrams: system architecture, project knowledge graph, learning knowledge graph, data flow, CI/CD pipeline.

**Phase 0D — Structure**

- Full `src/`, `tests/`, `scripts/`, `public/`, `.github/workflows/` tree with README placeholders.
- Tooling: `package.json`, `tsconfig*.json`, `vite.config.ts` (Vite + Vitest), `playwright.config.ts`, `eslint.config.js`, `.prettierrc`, `.editorconfig`, `.nvmrc`.
- No application source, homepage or learning modules (by design).

**Phase 0E — Git**

- `.gitignore`, `.gitattributes` created. `git init` on `main`. Nothing committed.

**Phase 0F — GitHub**

- Repository creation, remote, push and Pages commands prepared in `docs/development/SETUP.md` §GitHub. Not executed.

**Phase 0G — Quality control**

- Validation results in `docs/development/INITIALIZATION_REPORT.md`.

## Decisions made in Phase 0

| Decision            | Choice                                          | Rationale / ADR                                                                                                                                              |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| License             | MIT                                             | Maximally permissive for an educational project                                                                                                              |
| Router              | HashRouter                                      | Works on GitHub Pages without 404 tricks — ADR-0002                                                                                                          |
| Styling             | CSS Modules + variables                         | Zero runtime, scoped, themeable — ADR-0004                                                                                                                   |
| State persistence   | localStorage via `core/progress` only           | No backend, privacy — ADR-0003                                                                                                                               |
| Test stack          | Vitest + RTL + Playwright + axe                 | Vite-native, fast, a11y built in — ADR-0005                                                                                                                  |
| Package manifest    | Hand-authored in Phase 0 (no `npm install` run) | npm unavailable; keeps Phase 1 start as `npm install`                                                                                                        |
| Dependency versions | Caret ranges, not exact pins                    | Will be resolved and locked by `package-lock.json` at first install                                                                                          |
| ESLint major        | Stay on 9.x for now                             | `eslint-plugin-jsx-a11y` (accessibility is a hard constraint) has no ESLint 10 release; lint tooling never ships to users. Revisit when jsx-a11y supports 10 |
| TypeScript major    | Stay on 5.9                                     | `typescript-eslint` 8.72 supports TypeScript < 6.1 only                                                                                                      |
| Audit residue       | Accept 7 moderate findings in typescript-eslint | Dev-only, no fixed release exists (only canary); re-check on each Dependabot PR                                                                              |
| Vitest config       | Single `vite.config.ts` with `test` block       | Vitest 5 + Vite 8 types reject `mergeConfig` across the two; single file is the documented recommendation                                                    |
| Vendor chunking     | Rolldown `codeSplitting` groups                 | Vite 8 replaced Rollup; `manualChunks` object form is gone                                                                                                   |

## Suggested first commit message

```
chore: initialise OPENLAB project foundation (Phase 0)

- Add architecture documentation with Mermaid diagrams and ADRs 0001-0007
- Add project, contribution, security and development documentation
- Add domain-based directory structure for src/, tests/, scripts/, public/
- Add Vite, TypeScript, ESLint, Prettier, Vitest and Playwright configuration
- Add GitHub Actions workflows for CI and GitHub Pages deployment
- Add MIT license

No application code or learning modules yet; see ROADMAP.md.
```
