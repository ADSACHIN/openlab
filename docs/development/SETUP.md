# Local Development Setup

## Prerequisites

| Tool                  | Minimum                                  | Check            | Install (Debian / Ubuntu / Kali)                                                      |
| --------------------- | ---------------------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| Node.js               | 22.22 (24 LTS recommended, see `.nvmrc`) | `node --version` | `sudo apt install nodejs` or a version manager (nvm/fnm)                              |
| npm                   | 10+                                      | `npm --version`  | `sudo apt install npm` **or** `corepack enable npm && corepack install -g npm@latest` |
| Git                   | 2.40+                                    | `git --version`  | `sudo apt install git`                                                                |
| GitHub CLI (optional) | any                                      | `gh --version`   | see §GitHub below                                                                     |

Any OS works. Debian-family commands are shown because that is what the project was initialised on
(Kali Linux 2026.3; see `ENVIRONMENT_REPORT.md`).

### Git identity

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

## Install and run

```bash
git clone https://github.com/ADSACHIN14/openlab.git
cd openlab
npm install                      # creates package-lock.json on first run
npm run dev                      # http://localhost:5173/openlab/
```

> **Phase 0 note:** no application entry point exists yet, so `npm run dev` will serve nothing
> until Phase 1 adds `index.html` and `src/app/main.tsx`. `npm install` and `npm run lint`
> already work.

### Playwright browsers (for e2e / a11y tests)

```bash
npx playwright install --with-deps chromium firefox   # ~500 MB; sudo may be prompted for OS deps
```

## Scripts

| Command                                         | Purpose                                     |
| ----------------------------------------------- | ------------------------------------------- |
| `npm run dev`                                   | Vite dev server with HMR                    |
| `npm run build`                                 | Type-check then production build to `dist/` |
| `npm run preview`                               | Serve `dist/` locally                       |
| `npm run typecheck`                             | `tsc -b --noEmit`                           |
| `npm run lint` / `lint:fix`                     | ESLint                                      |
| `npm run format` / `format:check`               | Prettier                                    |
| `npm run test` / `test:watch` / `test:coverage` | Vitest                                      |
| `npm run test:e2e` / `test:e2e:ui`              | Playwright                                  |
| `npm run test:a11y`                             | Playwright accessibility project only       |
| `npm run validate`                              | Everything CI runs except e2e               |

## VS Code

Recommended extensions (not enforced): ESLint, Prettier, Vitest, Playwright Test, CSS Modules,
Mermaid Markdown preview. Settings worth enabling: format on save with Prettier as default formatter.

## Environment variables

None are required. Optional:

| Variable              | Default                   | Use                                           |
| --------------------- | ------------------------- | --------------------------------------------- |
| `VITE_BASE_PATH`      | `/openlab/`               | Set to `/` for a custom domain or root deploy |
| `PLAYWRIGHT_BASE_URL` | unset (starts dev server) | Point Playwright at an existing server        |

Never add a variable that holds a secret. This project has no secrets.

## GitHub

### Create the repository and push (first time)

**Option A — GitHub CLI** (install first if missing: https://github.com/cli/cli/blob/trunk/docs/install_linux.md)

```bash
gh auth login                                    # browser flow, choose HTTPS or SSH
gh repo create openlab --public --source=. --remote=origin --description "Free and Open-Source Interactive Technology Learning Universe"
git push -u origin main
```

**Option B — Web UI (no gh needed)**

1. https://github.com/new → name `openlab`, **Public**, no README / .gitignore / license (they already exist locally).
2. Then:

```bash
git remote add origin https://github.com/ADSACHIN14/openlab.git   # or git@github.com:ADSACHIN14/openlab.git
git push -u origin main
```

### Enable GitHub Pages

**With gh:**

```bash
gh api -X POST repos/ADSACHIN14/openlab/pages -f build_type=workflow
```

**Web UI:** Repository → Settings → Pages → _Build and deployment_ → Source: **GitHub Actions**.

The `deploy.yml` workflow then publishes `dist/` on every push to `main`.
Site URL: `https://adsachin14.github.io/openlab/`.

### Placeholders to replace

Search for `ADSACHIN14` in `package.json`, `README.md`, `CHANGELOG.md`,
`.github/ISSUE_TEMPLATE/config.yml` and this file.

## Troubleshooting

| Symptom                                      | Fix                                                         |
| -------------------------------------------- | ----------------------------------------------------------- |
| `npm: command not found` right after install | Open a new terminal, or `hash -r`; confirm `which npm`      |
| Blank page on GitHub Pages                   | Check `base` in `vite.config.ts` equals `/<repo-name>/`     |
| Routes 404 on refresh                        | They shouldn't with HashRouter; make sure URLs contain `#/` |
| Playwright cannot launch browser             | `npx playwright install --with-deps`                        |
| `tsc` complains about `node_modules/.tmp`    | Run `npm run build` once; the folder is created on demand   |
