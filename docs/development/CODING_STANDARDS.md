# Coding Standards

Enforced by tooling where possible (`eslint.config.js`, `.prettierrc`, `tsconfig.app.json`).
Everything else is enforced in code review.

## TypeScript

- `strict: true` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Do not loosen.
- No `any`. Use `unknown` and narrow. No non-null assertions (`!`) outside tests.
- Prefer `type` aliases for data shapes, `interface` for extensible contracts (e.g. `DomainModule`).
- Discriminated unions over boolean flags. `satisfies` over `as`.
- `import type { … }` for type-only imports (enforced).
- Export named symbols only; no default exports except where a framework requires one (config files).

## React

- Function components only, named `PascalCase`, file `ComponentName.tsx`.
- One component per file. Co-locate `ComponentName.module.css` and `ComponentName.test.tsx`.
- Props type is `ComponentNameProps`, declared directly above the component.
- No business logic in components: call into `src/core` or hooks.
- Effects are a last resort. Derive state during render where possible.
- Lists need stable keys from data, never array index, unless the list is static.
- Never call `localStorage`, `fetch` or `window` APIs directly from a component; go through
  a hook or `src/core`.

## Styling

- CSS Modules for every component. Class names in `camelCase` in CSS (`localsConvention: camelCaseOnly`).
- All values from design tokens in `src/styles/tokens.css` (`var(--space-3)`, `var(--color-accent)`).
  Hard-coded colours, font sizes or spacing in a module are a review blocker.
- Mobile-first media queries. Breakpoints are tokens too.
- Respect `prefers-reduced-motion`: every animation is wrapped in `@media (prefers-reduced-motion: no-preference)`
  or gated by `useReducedMotion()`.
- Light and dark themes via `[data-theme]` on `<html>`; never hard-code a theme.

## Visualisations

- **SVG** for diagrams, graphs, anything a screen reader should be able to traverse. Give every
  meaningful element a `<title>`/`aria-label`, and the `<svg>` a `role="img"` + description.
- **Canvas** only when SVG is measurably too slow (thousands of moving items). Always pair a
  canvas with an off-screen text description and keyboard controls for the same state.
- Animation loops use `useAnimationFrame` and must be pausable, steppable and resettable.
- Simulations are deterministic: same inputs + same seed = same output. Use the seeded RNG from `src/utils`.

## Accessibility (WCAG 2.2 AA target)

- Semantic HTML first. `<button>` for actions, `<a>` for navigation. No `div` click handlers.
- Every interactive element is keyboard reachable and has a visible focus ring (tokens provide it).
- Colour contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components. Never convey meaning by colour alone.
- Images and visualisations have text alternatives. Decorative images use `alt=""`.
- Live updates in simulators are announced through an `aria-live="polite"` region, throttled.
- `eslint-plugin-jsx-a11y` strict rules are on; do not disable them inline without a comment explaining why.

## Files and naming

| Thing              | Convention                    | Example                       |
| ------------------ | ----------------------------- | ----------------------------- |
| Component          | `PascalCase.tsx`              | `SimulatorHost.tsx`           |
| Hook               | `useCamelCase.ts`             | `useReducedMotion.ts`         |
| Util / core module | `camelCase.ts`                | `progressStore.ts`            |
| Types              | `camelCase.ts` in `src/types` | `learning.ts`                 |
| CSS Module         | `Name.module.css`             | `Card.module.css`             |
| Test               | `Name.test.ts(x)`             | `Card.test.tsx`               |
| E2E spec           | `journey.spec.ts`             | `lesson-navigation.spec.ts`   |
| Domain folder      | `kebab-case`                  | `linux-os`                    |
| Route path         | `kebab-case`                  | `#/networking/packet-journey` |

## Imports

Order (Prettier does not sort; keep it tidy manually or via editor):

1. React / third-party
2. `@core`, `@components`, `@hooks`, `@utils`, `@types`, `@data`
3. Relative imports within the same folder
4. CSS Module import last

Domains never import other domains (ESLint error).

## Comments and docs

- Write _why_, not _what_. Code says what.
- Public functions in `src/core` and `src/utils` have a JSDoc block with a one-line summary.
- `// TODO(name): …` with a linked issue number. No orphan TODOs.
- Architectural changes get an ADR in `docs/architecture/ADR/`.

## Git

- Conventional Commits. Small, atomic commits. Rebase on `main` before opening a PR.
- Branch names: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Never commit `node_modules`, `dist`, coverage output, or anything with a secret (there are none).

## Dependencies

Adding a runtime dependency requires, in the PR description:

1. What platform API or existing code was considered first.
2. Bundle size impact (`npm run build` output before/after).
3. License compatibility (MIT/Apache-2.0/BSD/ISC only).
