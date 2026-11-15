# OPENLAB — Initialization Report (Phase 0)

**Date:** 2026-11-14
**Phases executed:** 0A → 0G
**Outcome:** Project foundation complete. Nothing committed, nothing pushed, nothing deployed.

---

## 1. Validation results

| Check                                  | Result        | Evidence                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All required documentation files exist | ✅ 25/25      | Scripted existence check, 0 missing                                                                                                                                                                                                                                         |
| All required directories exist         | ✅ 28/28      | Scripted existence check, 0 missing                                                                                                                                                                                                                                         |
| No accidental secrets                  | ✅            | Regex scan for keys/tokens/private keys: only false positives ("design tokens", "password required" in the environment report). No `.env` files.                                                                                                                            |
| No paid service dependencies           | ✅            | Scan for ~25 paid/SaaS names: zero hits. `package.json` runtime deps: react, react-dom, react-router, lucide-react (all MIT/ISC, no network).                                                                                                                               |
| No external API requirements           | ✅            | No `fetch`/`axios`/non-GitHub URLs in any TS/JS/JSON. CSP plan sets `connect-src 'none'`.                                                                                                                                                                                   |
| Mermaid diagrams valid                 | ✅ structural | 11 blocks across 7 files checked for diagram type, direction, bracket/quote balance, subgraph/end pairing, reserved ids, style targets. 19 labels containing `&`/`*` auto-quoted. **Not** rendered with the Mermaid CLI (needs npm); render-check is listed as a follow-up. |
| JSON configs parse                     | ✅ 5/5        | `package.json`, `tsconfig*.json`, `.prettierrc` via `node -e JSON.parse`                                                                                                                                                                                                    |
| YAML has no tabs                       | ✅ 6/6        | Workflows, Dependabot, issue templates                                                                                                                                                                                                                                      |
| Git configuration                      | ✅            | Repo initialised, branch `main`, identity set globally (not invented), 0 commits                                                                                                                                                                                            |
| No files overwritten unexpectedly      | ✅            | Directory was empty at start (0 entries). Every file was created, none replaced.                                                                                                                                                                                            |
| Tooling executed                       | ✅ 2026-11-15 | `npm install` (362 pkgs), `typecheck`, `lint`, `format:check`, Vitest start, Playwright config load and a fixture `vite build` all pass with real output. No application tests exist yet, so no test results are claimed.                                                   |

## 2. Inventory

- Files: 77
- Directories: 35
- Mermaid diagrams: 11 (system architecture, build pipeline, CI/CD pipeline, project knowledge graph, learning knowledge graph, data flow, layered architecture, module dependencies, third-party deps, roadmap, test pyramid)
- ADRs: 7 + template

## 3. Folder tree

```
openlab/
CHANGELOG.md
CLAUDE.md
CODE_OF_CONDUCT.md
CONTRIBUTING.md
DEVELOPMENT_PROGRESS.md
docs
  architecture
    ADR
      0000-template.md
      0001-static-first-no-backend.md
      0002-hash-router.md
      0003-localstorage-persistence.md
      0004-css-modules-and-variables.md
      0005-testing-stack.md
      0006-domain-isolation.md
      0007-svg-first-canvas-fallback.md
      README.md
    ARCHITECTURE.md
    DATA_FLOW.md
    KNOWLEDGE_GRAPH.md
    MODULE_DEPENDENCIES.md
    SYSTEM_ARCHITECTURE.md
  contribution
    CONTRIBUTING_GUIDE.md
  development
    CODING_STANDARDS.md
    ENVIRONMENT_REPORT.md
    SETUP.md
    TESTING.md
  security
    SECURITY_POLICY.md
.editorconfig
eslint.config.js
.gitattributes
.github
  dependabot.yml
  ISSUE_TEMPLATE
    bug_report.yml
    config.yml
    content_proposal.yml
  PULL_REQUEST_TEMPLATE.md
  workflows
    ci.yml
    deploy.yml
.gitignore
LICENSE
.nvmrc
package.json
playwright.config.ts
.prettierignore
.prettierrc
public
  .gitkeep
  README.md
README.md
ROADMAP.md
scripts
  README.md
SECURITY.md
src
  app
    README.md
  components
    README.md
  core
    README.md
  data
    README.md
  domains
    ai-ml
      README.md
    cloud-devops
      README.md
    computer-science
      README.md
    cybersecurity
      README.md
    linux-os
      README.md
    networking
      README.md
    programming
      README.md
    README.md
    system-design
      README.md
  hooks
    README.md
  README.md
  styles
    README.md
  types
    README.md
  utils
    README.md
tests
  accessibility
    README.md
  e2e
    README.md
  integration
    README.md
  README.md
  setup.ts
  unit
    README.md
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

## 4. Architecture summary

Static-first React 19 + TypeScript + Vite single-page app, routed with HashRouter so GitHub
Pages needs no redirect tricks. A framework-agnostic learning engine in `src/core` (content
model, registry, localStorage progress store, search) hosts eight isolated domain plugins in
`src/domains/*`; the ESLint config forbids cross-domain imports. Shared UI (including the
`SimulatorHost` and SVG/Canvas stages) lives in `src/components`, styled with CSS Modules and
design-token CSS variables. Tests: Vitest + React Testing Library for units/components,
Playwright for e2e, axe-core for accessibility. CI validates every PR; a separate workflow
deploys `dist/` to GitHub Pages via OIDC. Zero paid services, zero backend, zero telemetry.
Decisions are recorded in ADR-0001 … ADR-0007.

## 5. Decisions and assumptions made during initialization

| #   | Decision                                                             | Reason                                                                                                                        |
| --- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | MIT license                                                          | Stated in the plan; not contradicted                                                                                          |
| 2   | Hand-authored `package.json` and tool configs, **no `npm install`**  | Makes CI workflows meaningful and Phase 1 start as `npm install`; npm is unavailable anyway                                   |
| 3   | Dependency versions as caret ranges                                  | Exact pins will be produced by `package-lock.json` at first install; pins invented without a registry lookup would be guesses |
| 4   | No `index.html` / `main.tsx`                                         | Brief forbids implementing the homepage; the app entry is Phase 1's first task                                                |
| 5   | Added `.editorconfig`, `.nvmrc`, Dependabot, PR/issue templates      | Low-cost, zero-dependency hygiene that CI and contributors rely on; all free GitHub features                                  |
| 6   | Node engine `>=22.22`, `.nvmrc` = 24                                 | React Router 8 requires Node 22.22+; matches the installed Node 24                                                            |
| 7   | Docs say "Debian/Ubuntu/Kali" instead of "Ubuntu"                    | Machine is Kali 2026.3                                                                                                        |
| 8   | `vite.config.ts` `base` = `/openlab/` with `VITE_BASE_PATH` override | Required for project Pages; override supports custom domains later                                                            |

## 6. Missing dependencies (unchanged from Phase 0A unless noted)

| Dependency          | Status                                                                                                              | Needed for                          | Command                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| npm                 | ❌ **Still missing** — reported installed by owner, but no binary found on PATH, in `/usr`, `~/.local`, or via dpkg | `npm install`, all scripts, Phase 1 | `sudo apt install -y npm` **or** `corepack enable npm && corepack install -g npm@latest` |
| Git identity        | ✅ Set by owner (`user.name`, `user.email`, `init.defaultBranch=main`)                                              | first commit                        | —                                                                                        |
| GitHub CLI          | ❌ Missing (optional)                                                                                               | automated repo creation             | see `SETUP.md` §GitHub; or use the web UI                                                |
| Playwright browsers | ⏳ not installed (expected)                                                                                         | e2e tests, Phase 1+                 | `npx playwright install --with-deps chromium firefox`                                    |

## 7. GitHub setup commands (not executed)

```bash
# --- Option A: GitHub CLI ---
gh auth login
gh repo create openlab --public --source=. --remote=origin \
  --description "Free and Open-Source Interactive Technology Learning Universe"
git push -u origin main
gh api -X POST repos/ADSACHIN14/openlab/pages -f build_type=workflow

# --- Option B: Web UI ---
# 1. https://github.com/new  → name: openlab, Public, no README/.gitignore/license
git remote add origin https://github.com/ADSACHIN14/openlab.git
git push -u origin main
# 2. Settings → Pages → Source: "GitHub Actions"
```

## 8. Remaining manual actions

1. ~~Install npm~~ Done 2026-11-15.
2. ~~Replace `<github-username>`~~ Done: set to `ADSACHIN14` (Pages host `adsachin14.github.io`).
3. Review the files, then approve the first commit (message in `DEVELOPMENT_PROGRESS.md`).
4. Create the GitHub repository and push (§7).
5. Enable GitHub Pages with source = GitHub Actions (§7).
6. After first push: enable branch protection on `main` and private vulnerability reporting (Settings → Security).
7. Optionally install the GitHub CLI.
8. Approve Phase 1 (application shell).

## 9. Known limitations of this initialization

- All npm scripts were executed locally on 2026-11-15 and pass. The GitHub Actions workflows themselves run only after the first push.
- `npm audit` reports 7 moderate findings, all in the typescript-eslint chain with no fixed release yet; accepted as dev-only (see DEVELOPMENT_PROGRESS decisions).
- Mermaid diagrams passed a structural check only. Preview in VS Code / GitHub, or run `npx -y @mermaid-js/mermaid-cli -i <file>` for a definitive render check.
- The `deploy.yml` workflow will fail until Phase 1 adds `index.html`, because `vite build` has no entry point. This is expected and intentional.
