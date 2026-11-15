# Security Policy

OPENLAB is a static, client-side web application with no backend, no accounts and no
server-side data. The attack surface is therefore small, but not zero. We take reports
seriously.

## Supported Versions

Only the latest deployment on the `main` branch (what is live on GitHub Pages) is supported.

| Version                          | Supported |
| -------------------------------- | --------- |
| `main` / latest Pages deployment | ✅        |
| Anything else                    | ❌        |

## Reporting a Vulnerability

**Please do not open a public issue for security problems.**

Use GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability**.
3. Describe the issue, steps to reproduce, and impact.

You will receive an acknowledgement within **7 days** and a resolution target within **30 days**
for confirmed issues. We will credit reporters in the CHANGELOG unless you prefer otherwise.

## What counts as a security issue here

- Cross-site scripting (XSS) via lesson content, URL hash parameters or imported progress data.
- Prototype pollution or unsafe deserialisation of `localStorage` payloads.
- Dependency vulnerabilities with a reachable exploit path in the built bundle.
- CI/CD workflow weaknesses (e.g. injection via PR titles, over-privileged tokens).
- Content Security Policy bypasses.

## Out of scope

- Issues requiring a compromised browser or operating system.
- Clickjacking on GitHub Pages (we do not control headers there; see the security policy doc).
- Simulated vulnerabilities **inside the Cybersecurity learning modules** — they are intentional
  teaching content and sandboxed to the simulator.

## Security posture

Full details, threat model and controls: [docs/security/SECURITY_POLICY.md](docs/security/SECURITY_POLICY.md).
