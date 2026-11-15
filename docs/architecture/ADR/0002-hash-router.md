# ADR-0002: Use HashRouter for routing on GitHub Pages

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** project owner

## Context

GitHub Pages serves static files and returns its own 404 page for unknown paths. A
`BrowserRouter` SPA breaks on refresh or deep link (`/networking/osi` → 404) unless a
`404.html` redirect hack rewrites the URL, which is fragile, flashes, and hurts accessibility.

## Decision

Use React Router's `HashRouter`. All routes live after `#` (`/openlab/#/networking/osi`).
The server only ever serves `index.html`.

## Alternatives considered

| Option                                      | Pros                                                                        | Cons                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| BrowserRouter + `404.html` redirect trick   | Clean URLs                                                                  | Flash of 404, extra navigation entry, depends on a hack, breaks on some hosts |
| BrowserRouter + pre-rendered page per route | Clean URLs, works without JS                                                | Build complexity, every new lesson needs a pre-render step                    |
| HashRouter (chosen)                         | Zero config on any static host, deep links and refresh always work, no hack | URLs contain `#`; hash is not sent to servers (irrelevant here — no server)   |

## Consequences

- Deep links and reloads work on GitHub Pages, local preview and any static host.
- SEO for individual lessons is weak; acceptable for a learning app whose entry point is the home page. Can be revisited if search discoverability becomes a goal.
- Analytics-free by nature: the hash never reaches GitHub's logs.
- `vite.config.ts` `base` must still equal `/openlab/` for asset paths.
