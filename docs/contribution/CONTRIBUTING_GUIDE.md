# Contributing Guide (full)

The root `CONTRIBUTING.md` is the summary. This is the complete guide.

## 1. Kinds of contribution

| Kind                          | Typical PR                                                       | Skills needed                    |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------------- |
| **Learning content**          | New lesson, quiz, or explanation text in a domain                | Subject knowledge, clear writing |
| **Simulator / visualisation** | New interactive component with an engine in `core` or the domain | TypeScript, SVG/Canvas, React    |
| **Engine**                    | Changes to `src/core` (progress, registry, renderer)             | TypeScript, testing              |
| **Accessibility**             | Audits, fixes, screen-reader testing reports                     | WCAG, assistive tech             |
| **Design**                    | Tokens, themes, layout, illustrations (SVG)                      | CSS, design systems              |
| **Docs**                      | Anything under `docs/` or root `*.md`                            | Writing                          |
| **Tooling / CI**              | Scripts, workflows, configs                                      | Node, GitHub Actions             |

## 2. Before you start

1. Read `CLAUDE.md` (it is the shortest accurate description of the architecture and rules).
2. Read `docs/architecture/MODULE_DEPENDENCIES.md` — the import rules are enforced.
3. Search issues. Comment on an issue before starting large work to avoid duplication.
4. For a new lesson/simulator, open a **Learning content proposal** issue first.

## 3. Setting up

See `docs/development/SETUP.md`. In short: Node 24, `npm install`, `npm run dev`.

## 4. Branching and commits

- Branch from `main`: `feat/networking-dns-walkthrough`, `fix/core-progress-migration`, `docs/adr-canvas`.
- Conventional Commits, imperative mood, ≤ 72-char subject.
- Rebase (don't merge) `main` into your branch before opening the PR.

## 5. Authoring learning content

A domain module (`src/domains/<domain>/index.ts`) exports a `DomainModule` (type defined in
`src/core/model` from Phase 2). Each lesson/lab/simulator is a typed object plus a component.

Content rules:

- **Outcome first.** Every lesson starts with "After this you can …".
- **Interact early.** The first interactive element appears within the first screen.
- **Explain, then let them break it.** Simulators expose parameters learners can push to failure.
- **Short.** A lesson is 5–12 minutes. Split otherwise.
- **Prerequisites declared** in the lesson metadata; they feed the learning knowledge graph.
- **Plain language**, define jargon on first use, link to the glossary in `src/data`.
- **Attribution.** Original content only, or clearly attributed CC-BY / public-domain material.
- **Accuracy over cleverness.** Cite RFCs, man pages, papers where relevant.

Each lesson ships with: a component test (renders, headings in order), the quiz answers
tested, and an entry in the domain's a11y spec.

## 6. Building simulators

1. Put the deterministic engine (pure functions / state machine) in the domain's `simulators/<name>/engine.ts`
   with exhaustive unit tests. Engines take a seed; no `Math.random()` directly.
2. Render through `SimulatorHost` (from `src/components/learning`, Phase 2) which supplies
   play/pause/step/reset/speed and the `aria-live` announcer.
3. Choose SVG unless profiling shows Canvas is required. Document the choice in the component.
4. Provide keyboard equivalents for every mouse interaction.
5. Honour `useReducedMotion()`: no autoplay, instant transitions.

## 7. Pull request process

1. `npm run validate` green locally. For UI, also `npm run test:a11y`.
2. Fill in the PR template fully. Screenshots for UI; a short screen recording for simulators.
3. One reviewer approval required; CI must be green.
4. Reviewers check, in order: constraint compliance (free, static, no tracking) → correctness →
   accessibility → tests → code standards → docs.
5. Squash-merge with a Conventional Commit title.

## 8. Review etiquette

- Reviewers: be specific, suggest code, distinguish blocking from nit. Praise good work.
- Authors: respond to every comment; disagree with reasons; don't force-push during review
  (push fix-up commits; squash happens at merge).

## 9. Recognition

All contributors are listed in GitHub's contributor graph. Significant content contributions
are credited in the lesson's metadata (`authors` field) and in `CHANGELOG.md`.

## 10. Licensing

Code: MIT. By submitting a PR you agree your contribution is MIT-licensed. Content you did not
create must be compatible (CC-BY, CC0, public domain) and attributed.
