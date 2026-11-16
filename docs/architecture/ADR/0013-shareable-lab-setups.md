# ADR-0013: Share lab setups as replayable action logs in the URL

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** project owner

## Context

Learners and teachers want to send a lab in a specific state ("look at this subnet", "start from
here"). There is no backend, so the setup must travel in the link itself. Some simulator states are
large (the shell's whole filesystem, a sorting trace), and every link is untrusted input.

## Decision

Share the learner's **history**, not the state. Engines are deterministic (ADR-0006, seeded), so
the history replayed from `init(seed)` reproduces the state exactly:

- `SimulatorHost` records a log: a positive integer means that many steps, `{ a }` is one action.
  Consecutive steps merge. Reset clears the log.
- The lab page offers "Copy link to this setup", which encodes the log as base64url JSON in the hash
  query: `#/domains/<id>/labs/<slug>?setup=…`. The link is also shown for manual copying.
- On load, `decodeSetup` validates strictly: at most 4,000 characters, the base64url alphabet only,
  valid UTF-8 and JSON, at most 500 entries, step counts from 1 to 20,000 in total, and every action
  object has exactly one key `a`. `replayLog` turns any exception or non-object result into
  "not restorable", and the lab starts fresh with a notice.
- A per-simulator error boundary contains anything that still goes wrong, with a Reset button.

## Alternatives considered

| Option                         | Pros                                | Cons                                                                 |
| ------------------------------ | ----------------------------------- | -------------------------------------------------------------------- |
| Serialise the state            | Simple                              | Large for some simulators; every state shape needs its own validator |
| Store setups on a server       | Short links                         | Violates no-backend and privacy constraints                          |
| Replayable action log (chosen) | Small, exact, one generic validator | Very long sessions exceed the link limit (the learner is told)       |

## Consequences

- Works for every simulator without per-simulator code.
- Hostile links: `tests/integration/share-fuzz.test.ts` replays 925 random and junk logs across all
  37 simulators; none throws out of replay. React escapes any text an action carries, so a link
  cannot inject markup.
- Engines must keep validating `apply` input (most already did); the fuzz test guards that.
- The link encodes actions, which include anything the learner typed into a simulator (for example
  shell commands). The UI states that the link reproduces the exact setup.
