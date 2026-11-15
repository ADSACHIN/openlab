# Development Progress

Living log. Newest entries at the top of each section. Update at the end of every work session.
Phase definitions: [ROADMAP.md](ROADMAP.md).

## Current status

| Item            | State                                     |
| --------------- | ----------------------------------------- |
| Phase           | **0 — Foundation**                        |
| Phase 0 status  | Complete, awaiting first-commit approval  |
| Next phase      | 1 — Application Shell (awaiting approval) |
| Live deployment | None yet                                  |
| Git             | Initialised on `main`, **no commits**     |
| GitHub remote   | Not created                               |

## Blockers / manual actions required

| #   | Action                                                                       | Owner         | Status  |
| --- | ---------------------------------------------------------------------------- | ------------- | ------- |
| 1   | Install npm — done 2026-11-15 (npm 12.2.0 via apt after `apt update`)        | Project owner | ✅ Done |
| 2   | Approve and run the first commit                                             | Project owner | ⏳ Open |
| 3   | Create GitHub repository `openlab` (gh CLI or web UI) and push               | Project owner | ⏳ Open |
| 4   | Enable GitHub Pages with source = GitHub Actions                             | Project owner | ⏳ Open |
| 5   | Replace `<github-username>` placeholders — set to `ADSACHIN14` on 2026-11-14 | Claude Code   | ✅ Done |
| 6   | (Optional) Install GitHub CLI                                                | Project owner | ⏳ Open |

## Log

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
