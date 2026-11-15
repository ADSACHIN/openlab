# ADR-0001: Static-first, client-side only, no backend

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** project owner

## Context

OPENLAB must be free to run forever, free to use, and must not depend on anyone paying a
hosting bill or rotating a credential. The mission statement rules out paid APIs, hosting,
databases and mandatory authentication, and requires no tracking.

## Decision

The product is a static single-page application. All logic — routing, rendering, simulation,
quiz grading, search and persistence — executes in the learner's browser. The deployment
artefact is the `dist/` folder, published to GitHub Pages. No server component is permitted
as a requirement; a future _optional_ enhancement must degrade gracefully when absent.

## Alternatives considered

| Option                                 | Pros                                                    | Cons                                                                      |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| Next.js / SSR on a free-tier host      | SEO, dynamic features                                   | Free tiers change or vanish; needs an account/credit card; vendor lock-in |
| Serverless functions for progress sync | Cross-device progress                                   | Needs a database and auth → cost and privacy burden                       |
| Static SPA (chosen)                    | $0, no ops, trivially forkable, privacy by construction | No cross-device sync without export/import; no server-side search         |

## Consequences

- GitHub Pages is sufficient hosting; any static host works as a fallback.
- Learner progress is per-browser; export/import JSON provides portability (ADR-0003).
- Content and simulators must be small enough to ship as lazy chunks.
- The security surface shrinks to XSS and supply chain (see `docs/security/SECURITY_POLICY.md`).
