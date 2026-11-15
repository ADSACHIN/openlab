# ADR-0003: Persist learner progress in localStorage only

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** project owner

## Context

Learners want to see what they have completed. ADR-0001 forbids a backend and the mission
forbids mandatory accounts and tracking. The data is small (lesson ids, lab results, preferences).

## Decision

Progress is stored in `localStorage` under a single namespaced, schema-versioned key, accessed
only via `src/core/progress`. Export to and import from a JSON file provide portability.
IndexedDB is not used initially; the API is designed so a later swap does not touch callers.

## Alternatives considered

| Option                | Pros                                              | Cons                                                            |
| --------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| localStorage (chosen) | Synchronous, simple, universally supported, ~5 MB | Per-browser only, string-only, can be cleared                   |
| IndexedDB             | Larger, structured, async                         | More code; overkill for < 100 KB; async boot path               |
| URL-encoded state     | Shareable                                         | Not for persistence; used later for sharing lab state (Phase 6) |
| Cloud sync (any)      | Cross-device                                      | Violates ADR-0001 and the no-auth rule                          |

## Consequences

- Progress is private by construction and never leaves the device unless exported.
- A schema version with migrations is mandatory from day one.
- All reads/writes are defensive (try/catch for quota and private mode) and the UI must degrade to an in-memory store.
- Imported JSON is untrusted input: validated, size-capped, unknown keys rejected.
