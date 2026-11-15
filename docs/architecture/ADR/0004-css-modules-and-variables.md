# ADR-0004: CSS Modules + CSS custom properties, no UI framework

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** project owner

## Context

The app needs scoped component styles, a themeable design system (light/dark, reduced motion),
small bundles, and strong accessibility defaults — without adding runtime dependencies.

## Decision

Component styles are CSS Modules (`*.module.css`, built in to Vite). All design values are CSS
custom properties defined in `src/styles/tokens.css` and switched by `[data-theme]`. No CSS-in-JS,
no Tailwind, no component library.

## Alternatives considered

| Option                                        | Pros                                                            | Cons                                                                                          |
| --------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| CSS Modules + variables (chosen)              | Zero runtime, native cascade, trivially themeable, works in SVG | Manual discipline for tokens; no utility classes                                              |
| Tailwind                                      | Fast prototyping                                                | Build plugin + config; class soup in visualisation-heavy components; weak fit for SVG styling |
| CSS-in-JS (styled-components, Emotion)        | Co-located, dynamic                                             | Runtime cost, extra dependency, SSR concerns irrelevant here                                  |
| Component library (MUI, Chakra, Radix Themes) | Accessible primitives for free                                  | Large bundle, design lock-in, dependency surface against the "no unnecessary deps" rule       |

## Consequences

- Accessibility of interactive primitives (tabs, dialogs, menus) must be hand-built and tested; this is a known cost accepted for control and size.
- Tokens are the single source of truth; hard-coded values are a lint/review failure.
- SVG visualisations share the same variables as the UI, so theming is uniform.
