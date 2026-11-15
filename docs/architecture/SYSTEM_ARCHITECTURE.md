# System Architecture

## Overall system

There is exactly one runtime component: the learner's browser. Everything else is build-time
or hosting.

```mermaid
flowchart LR
  subgraph Dev["Developer machine"]
    Src["Source<br/>React · TS · CSS Modules"]
    Local["Vite dev server<br/>Vitest · Playwright"]
    Src --> Local
  end

  subgraph GitHub["GitHub (free tier)"]
    Repo[("Git repository<br/>main")]
    CI["GitHub Actions<br/>ci.yml"]
    Deploy["GitHub Actions<br/>deploy.yml"]
    Pages["GitHub Pages<br/>static CDN"]
    Repo --> CI
    Repo --> Deploy
    Deploy -->|"upload dist/"| Pages
  end

  subgraph Browser["Learner's browser (runtime)"]
    Shell["App shell<br/>HashRouter"]
    Engine["Learning engine<br/>registry · progress · search"]
    Domains["Domain modules<br/>lessons · labs · simulators"]
    Viz["SVG / Canvas<br/>visualisations"]
    LS[("localStorage<br/>progress")]
    Shell --> Engine
    Shell --> Domains
    Domains --> Viz
    Engine <--> LS
  end

  Src -->|git push| Repo
  Pages -->|"HTML · JS · CSS · assets"| Browser
```

No arrows leave the browser after initial load. `connect-src 'none'` in the CSP makes that a
guarantee rather than a convention.

## Components

| Component         | Technology             | Responsibility                                              | Cost                       |
| ----------------- | ---------------------- | ----------------------------------------------------------- | -------------------------- |
| Source repository | GitHub (public)        | Version control, issues, PRs, Dependabot                    | Free                       |
| CI                | GitHub Actions         | Typecheck, lint, format, unit, build, e2e, a11y on every PR | Free (public repo minutes) |
| CD                | GitHub Actions → Pages | Build `dist/` and publish on push to `main`                 | Free                       |
| Hosting / CDN     | GitHub Pages           | Serve static files over HTTPS                               | Free                       |
| Runtime           | Browser                | Everything the learner experiences                          | Free                       |
| Persistence       | `localStorage`         | Progress and preferences                                    | Free                       |

Total recurring cost: **$0**.

## Build pipeline

```mermaid
flowchart LR
  TS["TypeScript<br/>tsc -b"] --> V["Vite build<br/>Rollup"]
  V --> C1["index.html"]
  V --> C2["assets/react-*.js<br/>vendor chunk"]
  V --> C3["assets/app-*.js"]
  V --> C4["assets/&lt;domain&gt;-*.js<br/>lazy per domain"]
  V --> C5["assets/*.css"]
  V --> C6["static from public/"]
  C1 & C2 & C3 & C4 & C5 & C6 --> Dist[("dist/")]
```

Each domain is a lazy route chunk, so a learner studying networking never downloads the AI/ML
module.

## CI/CD deployment pipeline

```mermaid
flowchart TB
  PR["Pull request<br/>or push to main"] --> Q

  subgraph CI["ci.yml"]
    Q["quality job<br/>npm ci · typecheck · lint · format:check · vitest --coverage"]
    B["build job<br/>npm run build → dist/ artifact"]
    E["e2e job<br/>download dist · playwright install · vite preview · playwright test<br/>chromium · firefox · mobile · accessibility(axe)"]
    Q -->|pass| B -->|pass| E
  end

  E -->|"PR: status check"| Merge{"Merge to main"}
  Merge --> D

  subgraph CD["deploy.yml (push to main)"]
    D["build job<br/>npm ci · npm run build · .nojekyll · upload-pages-artifact"]
    P["deploy job<br/>deploy-pages (OIDC, environment: github-pages)"]
    D --> P
  end

  P --> Live["https://adsachin.github.io/openlab/"]

  style Live fill:#2d6a4f,color:#fff
```

Properties:

- `ci.yml` has `contents: read` only. Forked PRs get no write access (`pull_request` event).
- `deploy.yml` uses OIDC (`id-token: write`) and the `github-pages` environment; no stored secrets.
- `concurrency` cancels superseded CI runs but never cancels an in-flight deploy.
- Pages source must be set to **GitHub Actions** (not a branch) once, manually.

## Environments

| Environment   | URL                                   | Trigger                            |
| ------------- | ------------------------------------- | ---------------------------------- |
| Local dev     | `http://localhost:5173/openlab/`      | `npm run dev`                      |
| Local preview | `http://localhost:4173/openlab/`      | `npm run build && npm run preview` |
| CI preview    | ephemeral, inside the e2e job         | every PR                           |
| Production    | `https://adsachin.github.io/openlab/` | push to `main`                     |

There is no staging environment. PR previews can be added later with a free Pages-per-branch
pattern if ever needed; not planned.

## Failure modes

| Failure                  | Effect             | Mitigation                                                         |
| ------------------------ | ------------------ | ------------------------------------------------------------------ |
| GitHub Pages outage      | Site unavailable   | Nothing to do; `dist/` can be served from any static host          |
| Bad deploy               | Broken site        | Re-run `deploy.yml` from a known-good commit (`workflow_dispatch`) |
| localStorage unavailable | Progress not saved | Store degrades to in-memory; UI shows a notice                     |
| Large simulator too slow | Jank               | Canvas fallback, reduced-motion path, web worker (Phase 6)         |
