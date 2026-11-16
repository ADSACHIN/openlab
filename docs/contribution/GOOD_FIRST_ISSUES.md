# Starter issues

Ready to file on GitHub once the repository is public (label `good first issue` or `help wanted`).
Each is scoped so a new contributor can finish it in an evening or a weekend.

| #   | Title                                                  | Labels                            | Where to start                                          | Done when                                                                                                         |
| --- | ------------------------------------------------------ | --------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Add a second UI language                               | `i18n`, `help wanted`             | `docs/contribution/TRANSLATING.md`                      | A reviewed `src/i18n/messages/<locale>.ts`, added to `LOCALES`, plus a language switcher in the header            |
| 2   | Networking: an HTTP request/response lesson            | `content`, `good first issue`     | `npm run new:lesson -- networking http-basics`          | Lesson with outcomes, quiz and an interactive block; prerequisite `networking/tcp-handshake`; numbers tested      |
| 3   | Keyboard shortcuts for the simulator host              | `a11y`, `good first issue`        | `src/components/learning/SimulatorHost`                 | Space toggles play, `.` steps, `r` resets while focus is inside the simulator; documented; tested with user-event |
| 4   | "Update available" notice for a waiting service worker | `pwa`, `help wanted`              | `src/app/registerServiceWorker.ts`                      | When a new worker is waiting, a polite notice with a Reload button; no automatic reload                           |
| 5   | PNG icons for installability                           | `pwa`, `good first issue`         | `public/manifest.webmanifest`                           | 192 and 512 px PNG icons (no new dependency), manifest updated, installability check passes                       |
| 6   | Highlight matched words in search results              | `ui`, `good first issue`          | `src/app/pages/SearchPage.tsx`, `src/core/search`       | Matched tokens wrapped in `<mark>` without HTML injection; unit tested                                            |
| 7   | Move one domain's simulator labels into a catalogue    | `i18n`, `help wanted`             | One domain, e.g. `src/domains/programming`              | Pattern proposed in an ADR; one domain migrated; pseudo-locale test extended                                      |
| 8   | Run the accessibility suite in Firefox in CI           | `ci`, `a11y`                      | `playwright.config.ts`, `.github/workflows/ci.yml`      | Axe project also runs on Firefox; CI time increase noted in the PR                                                |
| 9   | Reduced-motion e2e check                               | `a11y`, `good first issue`        | `tests/e2e`                                             | With reduced motion emulated, Play runs at half rate and no CSS animation runs                                    |
| 10  | Lazy-load the Search, Progress and Paths pages         | `performance`, `good first issue` | `src/app/routes.tsx`, `docs/development/PERFORMANCE.md` | Pages loaded with `React.lazy`; `npm run budget` shows lower initial JavaScript; e2e still green                  |

With the GitHub CLI, each can be filed like this:

```bash
gh issue create --title "Networking: an HTTP request/response lesson" \
  --label "good first issue" --label content \
  --body "See docs/contribution/GOOD_FIRST_ISSUES.md #2"
```
