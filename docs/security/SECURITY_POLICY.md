# Security Policy & Posture

Companion to the root `SECURITY.md` (which covers _how to report_). This document covers
_what we protect and how_.

## Threat model

OPENLAB is a static single-page application served from GitHub Pages. There is no server we
control, no database, no user accounts and no secrets. The assets at risk are:

| Asset                     | Threat                                                 | Impact                                                              |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Learner's browser session | XSS via content, hash params or imported progress JSON | Script execution in origin; could read/modify localStorage progress |
| Learner's progress data   | Malicious import file, prototype pollution             | Corrupted or lost progress (local only)                             |
| Supply chain              | Compromised npm dependency or GitHub Action            | Malicious code in the deployed bundle                               |
| CI/CD                     | Workflow injection, over-privileged `GITHUB_TOKEN`     | Repository tampering, bad deploys                                   |
| Reputation                | Defaced or misleading educational content              | Trust loss                                                          |

Explicitly **not** at risk: server credentials, personal data, payment data — none exist.

## Controls

### Application

- **No `dangerouslySetInnerHTML`** without a sanitiser and a code-review justification. Lesson
  content is authored as typed data / components, not raw HTML.
- **Hash-route and query parameters** are parsed with schema validation before use. Never
  rendered as HTML.
- **Progress import** (`core/progress`): JSON parsed with a safe parser, validated against a
  versioned schema, rejected on unknown keys, size-capped. No `eval`, no `Function()`.
- **localStorage** stores only the progress schema under a namespaced key; nothing sensitive.
- **No third-party scripts** at runtime. No CDN-loaded code. Fonts are self-hosted or system.
- **Content Security Policy** via `<meta http-equiv="Content-Security-Policy">` in `index.html`
  (Phase 1): `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`.
  (`style-src 'unsafe-inline'` is needed for computed SVG/Canvas geometry; revisit if avoidable.)
  Note: GitHub Pages does not let us set HTTP headers, so meta-CSP is the available mechanism and
  `frame-ancestors` in a meta tag is advisory only.
- **Cybersecurity domain simulators** that _demonstrate_ vulnerabilities operate on simulated
  state inside the app, never on the real DOM, real storage or real network.

### Dependencies

- Minimal dependency set; every addition justified in PR (see CODING_STANDARDS).
- `package-lock.json` committed; CI uses `npm ci`.
- Dependabot weekly for npm and monthly for GitHub Actions.
- `npm audit` reviewed on each Dependabot PR; high/critical with a reachable path block release.
- Permitted licenses: MIT, Apache-2.0, BSD-2/3, ISC, 0BSD.

### CI/CD

- Workflows request the minimum permissions (`contents: read`; deploy adds `pages: write`, `id-token: write`).
- Actions pinned to major versions now; to be pinned to SHAs once the first release is cut.
- No secrets exist in the repository or in Actions. The only token is the ephemeral `GITHUB_TOKEN`.
- `pull_request` (not `pull_request_target`) is used, so forks cannot access write permissions.
- No untrusted input (PR titles, issue bodies) is interpolated into `run:` steps.

### Repository

- `main` is protected (to configure after first push): require PR, require CI green, no force-push.
- Private vulnerability reporting enabled (to configure after first push).

## Privacy

- No analytics, telemetry, cookies, fingerprinting or remote logging. Ever.
- GitHub Pages' own server logs are outside our control and are covered by GitHub's privacy statement.
- Progress data never leaves the browser unless the learner explicitly exports it to a file.

## Secure development checklist (per PR)

- [ ] No new network calls (`connect-src 'none'` would block them anyway)
- [ ] No raw HTML rendering
- [ ] User-controllable input validated
- [ ] No new dependency, or audited and justified
- [ ] Workflow changes reviewed for permission scope

## Review cadence

Threat model and controls reviewed at the end of every roadmap phase and after any security report.
