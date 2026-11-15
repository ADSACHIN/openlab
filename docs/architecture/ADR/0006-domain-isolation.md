# ADR-0006: Domain modules are isolated plugins over a core engine

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** project owner

## Context

Eight learning domains will be built by different contributors over a long time. Cross-domain
imports would create a tangle that makes lazy loading, parallel work and removal impossible.
Shared behaviour (progress, navigation, simulator controls, a11y announcements) must be
implemented once.

## Decision

`src/core` defines the `DomainModule` contract and the engine (registry, progress, search).
Each `src/domains/<name>` exports one `DomainModule` and may import `core`, `components`,
`hooks`, `utils`, `types` — **never another domain**. `src/app` is the only place that imports
domains, to register them. The rule is enforced by ESLint `no-restricted-imports`.

## Alternatives considered

| Option                                | Pros                   | Cons                                                               |
| ------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| Free-form imports                     | No rules to learn      | Tangle, no lazy boundaries, fear of change                         |
| Monorepo packages per domain          | Hard boundaries        | Workspace tooling overhead, slower installs, overkill at this size |
| Isolated folders + lint rule (chosen) | Clear, cheap, enforced | Needs discipline for shared code to flow into `core`/`components`  |

## Consequences

- Each domain is a lazy route chunk; the home page stays light.
- Cross-domain _learning_ relationships are expressed as metadata (prerequisite ids), not imports; the knowledge graph is built from metadata.
- New domain = new folder + one line in the app's registry list.
- Shared concepts discovered inside a domain must be promoted to `core`/`components` before reuse.
