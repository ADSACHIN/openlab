# src/domains

One folder per learning domain. Each exports a single `DomainModule` object (defined in `src/core`) describing its lessons, labs, simulators and routes.
**Isolation rule:** a domain never imports from another domain (enforced by ESLint `no-restricted-imports`). Share code via `src/core` or `src/components`.
Internal layout per domain: `index.ts` (module export) · `lessons/` · `labs/` · `simulators/` · `components/` (domain-private UI) · `data/`.
