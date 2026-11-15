# ADR-0007: SVG first, Canvas as a measured fallback

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** project owner

## Context

Interactive visualisations are the product. They must be accessible (screen readers, keyboard),
themeable, crisp on any display, and testable — but some (packet storms, large grids, particle
simulations) need thousands of moving elements at 60 fps.

## Decision

Default to **SVG** rendered by React. Use **Canvas** only when profiling shows SVG cannot hold
the frame budget, and then always provide an equivalent textual description, an `aria-live`
summary and keyboard controls. WebGL/WebAssembly are deferred to Phase 6.

## Alternatives considered

| Option                                            | Pros                                                | Cons                                                                               |
| ------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| SVG everywhere                                    | Accessible, styleable, testable                     | Slow beyond ~1–2k animated nodes                                                   |
| Canvas everywhere                                 | Fast                                                | Opaque to assistive tech, no CSS theming, harder to test                           |
| Charting/diagram library (D3 full, vis.js, Konva) | Lots of features                                    | Dependency weight; D3's selection model fights React; most needs are custom anyway |
| SVG first + Canvas fallback (chosen)              | Best default for a11y, escape hatch for performance | Two rendering paths to maintain in a few components                                |

## Consequences

- Visualisation components live in `src/components/viz` with `SvgStage` and `CanvasStage` sharing one controls/announcer contract.
- Small D3 utility modules (`d3-scale`, `d3-shape`) may be considered later via ADR if hand-rolled math becomes a burden; not included now.
- Every visual carries a text alternative; this is a review gate.
