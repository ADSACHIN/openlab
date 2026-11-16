# ADR-0012: Defer WebAssembly until a simulator measurably needs it

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** project owner

## Context

The roadmap's Phase 6 lists "WebAssembly-powered simulators where JS is too slow". Building a
WebAssembly module needs a compiler toolchain (Rust with wasm-pack, AssemblyScript, or similar),
which means new dependencies, a second language for contributors, and extra CI work. The project's
hard constraints forbid unnecessary dependencies. The question is whether any simulator is too slow.

## Evidence

`npm run bench` (`tests/bench/engines.test.ts`) times every one of the 37 engines: `init(1)` plus up
to 200 steps, 25 repeats, median. Measured on 2026-11-16 on the development laptop:

| Engine                                                        | Cost per step (including its init) |
| ------------------------------------------------------------- | ---------------------------------- |
| Slowest: `cybersecurity/hash-cracker` (SHA-256 in JavaScript) | 0.063 ms                           |
| Next: `ai-ml/bpe-tokenizer`                                   | 0.013 ms                           |
| 30 of 37 engines                                              | below 0.003 ms                     |

A 60 fps frame is 16.7 ms. The fastest playback in any simulator is under one step per frame, so the
slowest engine uses well under 1% of a frame. The heavy work in the UI is SVG rendering, which
WebAssembly would not speed up.

## Decision

Do not add WebAssembly now. Keep the timing check (opt-in, never in CI) so the decision can be
revisited with data.

Revisit when any of these is true:

1. A proposed simulator's step costs more than 4 ms (a quarter frame) in JavaScript after reasonable
   optimisation, measured with `npm run bench`.
2. A simulator needs millions of operations per frame (for example a cellular automaton or particle
   system at scale) that cannot be precomputed.
3. A lab needs an existing native library (a real compiler, a real SQL engine) where porting to
   TypeScript is unrealistic.

When that happens, the WebAssembly module must stay inside one domain chunk, load lazily, keep the
engine interface pure and deterministic, and work under the existing CSP (`script-src 'self'` needs
`'wasm-unsafe-eval'` added for WebAssembly compilation; that change needs its own security review).

## Consequences

- No new toolchain or dependency; contributors keep one language.
- The roadmap item is closed as "evaluated and deferred", not silently dropped.
- The timing check documents the performance envelope and catches a regression if someone runs it.
