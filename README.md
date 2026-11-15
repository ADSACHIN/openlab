<div align="center">

# OPENLAB

**Free and Open-Source Interactive Technology Learning Universe**

Learn technology by _doing_ — interactive visualizations, simulators, lessons and labs.
Zero cost. No account. No tracking. Runs entirely in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status: Phase 0](https://img.shields.io/badge/status-phase%201%20%E2%80%94%20app%20shell-blue)](ROADMAP.md)
[![Static Site](https://img.shields.io/badge/hosting-GitHub%20Pages-222)](docs/architecture/SYSTEM_ARCHITECTURE.md)

</div>

---

## What is OPENLAB?

OPENLAB is a publicly accessible learning platform where anyone can explore technology
through hands-on experiences instead of passive reading. Every lesson pairs explanation
with something you can poke at: a packet travelling through a network, a Linux shell you
can type into, a sorting algorithm you can step through, a load balancer you can overload.

Everything runs client-side as a static site. There is no backend, no database, no login,
no paid API and no telemetry. Your progress lives in your own browser's `localStorage`.

## Learning Domains

| Domain               | What you will explore                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| **Networking**       | OSI/TCP-IP layers, packet flow, DNS, routing, subnetting, TLS handshakes         |
| **Linux & OS**       | Shell, filesystem, processes, permissions, scheduling, memory                    |
| **Cybersecurity**    | Threat models, cryptography, auth flows, web vulnerabilities, defensive thinking |
| **Programming**      | Data structures, algorithms, paradigms, debugging — visualised step by step      |
| **System Design**    | Scaling, caching, queues, consistency, load balancing, trade-offs                |
| **Computer Science** | Logic gates, CPU, compilers, automata, complexity                                |
| **AI & ML**          | Perceptrons, gradient descent, tokenisation, attention — interactively           |
| **Cloud & DevOps**   | CI/CD, containers, infrastructure as code, observability                         |

> **Status:** Phase 1 (application shell) is built: navigation, theming, domain catalogue. No learning modules are implemented yet.
> See [ROADMAP.md](ROADMAP.md) and [DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md).

## Principles

1. **Free forever** — MIT licensed, hosted on GitHub Pages, no paid services anywhere.
2. **Static-first** — a plain `dist/` folder is the whole deployment.
3. **Client-side only** — all simulation and processing happens in the browser.
4. **Privacy by default** — no accounts, no analytics, no third-party trackers.
5. **Accessible & responsive** — keyboard navigable, screen-reader friendly, mobile-ready.
6. **Modular by domain** — each learning domain is an isolated, independently growable module.

## Technology Stack

| Concern                   | Choice                                            |
| ------------------------- | ------------------------------------------------- |
| UI                        | React 19 + TypeScript                             |
| Build                     | Vite                                              |
| Routing                   | React Router (HashRouter — works on static hosts) |
| Styling                   | CSS Modules + CSS custom properties               |
| Icons                     | Lucide React                                      |
| Visualisation             | SVG and Canvas                                    |
| Persistence               | `localStorage`                                    |
| Unit / component tests    | Vitest + React Testing Library                    |
| E2E / accessibility tests | Playwright + axe-core                             |
| Quality                   | ESLint, Prettier, strict TypeScript               |
| CI/CD                     | GitHub Actions → GitHub Pages                     |

See [docs/architecture/](docs/architecture/) for full design documentation and ADRs.

## Quick Start (development)

```bash
git clone https://github.com/ADSACHIN/openlab.git
cd openlab
npm install
npm run dev
```

Full instructions, prerequisites and troubleshooting: [docs/development/SETUP.md](docs/development/SETUP.md).

## Project Layout

```
src/
  app/          application shell, routing, providers
  core/         learning engine: lessons, labs, simulators, progress
  components/   shared UI components
  domains/      one folder per learning domain (isolated)
  data/         static content & catalogues
  hooks/        shared React hooks
  styles/       design tokens, global CSS
  types/        shared TypeScript types
  utils/        pure helper functions
tests/          unit · integration · e2e · accessibility
docs/           architecture · development · security · contribution
```

## Documentation Map

| Document                                                                             | Purpose                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------- |
| [ROADMAP.md](ROADMAP.md)                                                             | Phased delivery plan                        |
| [DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md)                                   | Living log of what is done and what is next |
| [CHANGELOG.md](CHANGELOG.md)                                                         | Release history                             |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                                   | How to contribute                           |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)                                             | Community standards                         |
| [SECURITY.md](SECURITY.md)                                                           | Reporting vulnerabilities                   |
| [CLAUDE.md](CLAUDE.md)                                                               | Guidance for AI-assisted development        |
| [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)               | Architecture overview                       |
| [docs/architecture/SYSTEM_ARCHITECTURE.md](docs/architecture/SYSTEM_ARCHITECTURE.md) | System diagram & deployment                 |
| [docs/architecture/KNOWLEDGE_GRAPH.md](docs/architecture/KNOWLEDGE_GRAPH.md)         | Project and learning knowledge graphs       |
| [docs/architecture/DATA_FLOW.md](docs/architecture/DATA_FLOW.md)                     | Application data flow                       |
| [docs/architecture/MODULE_DEPENDENCIES.md](docs/architecture/MODULE_DEPENDENCIES.md) | Allowed import directions                   |
| [docs/architecture/ADR/](docs/architecture/ADR/)                                     | Architecture decision records               |
| [docs/development/SETUP.md](docs/development/SETUP.md)                               | Local setup                                 |
| [docs/development/CODING_STANDARDS.md](docs/development/CODING_STANDARDS.md)         | Code conventions                            |
| [docs/development/TESTING.md](docs/development/TESTING.md)                           | Testing strategy                            |
| [docs/security/SECURITY_POLICY.md](docs/security/SECURITY_POLICY.md)                 | Security posture                            |

## Contributing

Contributions of every kind are welcome — content, code, design, accessibility review,
translations. Start with [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 OPENLAB Contributors
