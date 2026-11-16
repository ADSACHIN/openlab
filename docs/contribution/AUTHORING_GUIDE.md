# Authoring Guide: lessons, simulators and labs

This is the practical companion to `CONTRIBUTING_GUIDE.md`. It describes how content is built in
OPENLAB today, with the rules the test suite enforces and the mistakes that have already happened.

The reference implementation is `src/domains/networking`.

## 1. Start from the generators

```bash
npm run new:lesson -- <domain> <slug>        # e.g. npm run new:lesson -- networking http-basics
npm run new:simulator -- <domain> <slug>     # e.g. npm run new:simulator -- networking arp-table
```

Both validate the domain and the slug, refuse to overwrite anything, and format their output with
the project's Prettier config. The generated files pass typecheck, lint and tests unchanged, so you
start from green and replace the `TODO`s. They print the line you need to paste to register the new
piece.

## 2. Lessons

A lesson is a `defineLesson({...})` object: metadata plus an ordered list of typed content blocks
(`paragraph`, `heading`, `list`, `callout`, `code`, `interactive`, `quiz`). Prose supports only
`` `code` `` spans and `**bold**`; no HTML is ever interpreted (ADR-0008).

Checklist:

- **Outcomes first.** Two to four "after this you can …" statements.
- **Interact early.** An `interactive` block within the first screen.
- **Short.** 5–12 minutes; split otherwise.
- **Prerequisites** are lesson ids and may cross domains (`linux-os/processes`). A cross-domain
  prerequisite makes the other domain's chunk load too, so add one only when it genuinely helps.
- **A quiz** with two or three questions whose explanations teach, not just confirm.
- **Every number is tested.** If prose says "48 seconds", "6 merges" or "about a third", a unit test
  computes it from the engine. This rule exists because prose numbers were wrong several times
  (binary search over 32 items, a 15-step trace that took 16, Little's law claimed to hold mid-run).
- **Claims are tested too.** "Round robin drops requests here; least connections does not" is a
  test, not a hope.

## 3. Simulators

A simulator is a pure **engine** plus a React **view**:

| Engine function        | Rule                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `init(seed)`           | Deterministic. Randomness only through `@utils/random` (`mulberry32`, or `nextRandom` when RNG state lives in the engine state). |
| `step(state)`          | One unit of time. Return the same object when nothing changes.                                                                   |
| `apply(state, action)` | Learner input. Validate, and return `state` unchanged for invalid input.                                                         |
| `isDone(state)`        | Optional. Stops Play and shows "Finished".                                                                                       |
| `describe(state)`      | One or two sentences for the screen-reader live region, describing what a sighted user sees.                                     |

Views:

- Render inside `SvgStage` (it supplies `role="img"`, a title and a description) or plain semantic
  HTML. Canvas only when SVG is measurably too slow (ADR-0007).
- Every control is a real `<button>`, `<input>` or `<select>` with a visible label. Put labels
  **beside** form controls, not around them: a label wrapping a `<select>` makes its accessible name
  include the selected option ("A 9 (1001)" instead of "A").
- A `<dl>` may contain only `<div>`, `<dt>` and `<dd>` (axe enforces this).
- Respect `reducedMotion` (the host already halves auto-play speed).
- If time has no meaning (a shell, a form, a slider), set `controls: 'reset'` in `defineSimulator`
  so the host hides Play, Step and Speed.

## 4. Labs

A lab pairs a simulator with a goal and a pure `check(state)` returning `{ passed, message, score }`.

- **Choose thresholds from measurements of every alternative.** The nearly-sorted lab was meant to
  reward insertion sort (11 comparisons), but bubble sort with early exit (17) passed the first
  threshold of "under 20". Probe each option, set the bar between them, and pin both numbers in tests.
- Messages for each failing case should say what to try next, not just "wrong".
- Prefer goals that need understanding over goals that pressing Play solves.
- Write the grading test (`module.test.ts`) before the e2e test.

## 5. Register and test

1. Add the lesson, lab or simulator to the domain's `index.ts` (and `simulators/index.ts`).
2. New domains are registered as a **lazy loader** in `src/app/modules.ts`; never import
   `@domains/*` statically from `src/app` (ADR-0009). `tests/unit/all-modules.test.ts` fails if a
   domain folder has no loader.
3. Add lesson and lab routes to `tests/accessibility/routes.a11y.spec.ts` when they introduce a new
   kind of UI.
4. Add an e2e journey for each lab in `tests/e2e/<domain>.spec.ts`. Use exact or scoped locators:
   page titles often contain the same words as control labels ("Tune the learning rate" vs
   "Learning rate").
5. Run `npm run validate`, then the browser suites (see `docs/development/TESTING.md`). Treat any
   browser console error as a failure.

## 6. Text that is not content

UI chrome (buttons, headings, status messages in shared components and pages) goes through the
i18n catalogue: `useT()`, with keys in `src/i18n/messages/en.ts`. Lesson, lab and simulator text in a
domain is content and stays with the domain for now (see `TRANSLATING.md`).

## 7. Safety for security content

Simulated attacks operate only on simulated state. Never insert learner input into the page as HTML,
never call real networks, never touch real storage. Lessons that teach attacks say plainly that
attacking systems without authorisation is illegal. See `docs/security/SECURITY_POLICY.md`.
