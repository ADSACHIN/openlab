# Contributing to OPENLAB

Thank you for considering a contribution. OPENLAB is built by learners for learners, and
every improvement — a typo fix, a new simulator, an accessibility audit — matters.

This file is the short version. The full guide, with workflows, content authoring rules and
review criteria, is in [docs/contribution/CONTRIBUTING_GUIDE.md](docs/contribution/CONTRIBUTING_GUIDE.md).

## Ways to contribute

| Type                          | Where to start                                                 |
| ----------------------------- | -------------------------------------------------------------- |
| Report a bug                  | Open an issue using the **Bug report** template                |
| Suggest a lesson or simulator | Open an issue using the **Learning content proposal** template |
| Fix or build something        | Pick an issue labelled `good first issue` or `help wanted`     |
| Improve accessibility         | Issues labelled `a11y`                                         |
| Review docs                   | Anything under `docs/`                                         |

## Ground rules

1. **Zero-cost promise.** Never introduce a paid service, API key, backend requirement,
   authentication requirement or tracking script. PRs that do will be declined.
2. **Static-first.** Everything must work from a plain `dist/` folder on GitHub Pages.
3. **Accessibility is a requirement**, not a feature. Keyboard, screen reader and
   reduced-motion support are reviewed on every UI PR.
4. **Domains stay isolated.** A domain module must not import from another domain.
   Shared logic goes in `src/core` or `src/components`.
5. **Tests accompany code.** New logic ships with unit tests; new UI ships with
   component tests; new pages ship with an accessibility test.
6. **Be kind.** See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Development workflow

```bash
# 1. Fork and clone
git clone https://github.com/<you>/openlab.git && cd openlab

# 2. Install
npm install

# 3. Branch
git switch -c feat/<domain>-<short-description>

# 4. Develop
npm run dev

# 5. Validate before pushing
npm run validate        # typecheck + lint + format + unit tests
npm run test:e2e        # when touching routes or pages

# 6. Push and open a PR against main
```

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <summary>

feat(networking): add TCP three-way handshake simulator
fix(core): persist progress when tab is backgrounded
docs(architecture): add ADR-0007 for canvas rendering
test(a11y): add axe audit for lesson layout
chore(deps): bump vite to 7.2
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
Scopes: a domain name (`networking`, `linux-os`, …), `core`, `app`, `components`, `docs`, `ci`.

## Pull request checklist

- [ ] Follows [CODING_STANDARDS.md](docs/development/CODING_STANDARDS.md)
- [ ] `npm run validate` passes locally
- [ ] No new dependencies, or the PR explains why one is necessary
- [ ] No paid services, API keys, backends or trackers
- [ ] Accessibility checked (keyboard + screen reader + `prefers-reduced-motion`)
- [ ] Docs / CHANGELOG updated when behaviour changes
- [ ] `DEVELOPMENT_PROGRESS.md` updated for roadmap-level work

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
