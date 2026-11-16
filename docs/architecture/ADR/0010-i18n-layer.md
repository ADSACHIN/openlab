# ADR-0010: A small typed i18n layer for UI text

- **Status:** Accepted
- **Date:** 2026-11-16
- **Deciders:** project owner

## Context

Phase 5 calls for an i18n foundation. UI strings were hard-coded across pages and shared
components. The constraints are no unnecessary dependencies, strict TypeScript, and components that
keep working in isolation (component tests render them without app providers).

## Decision

Add `src/i18n` as a foundation layer that components, hooks and app may import (it imports only
React and types):

- `messages/en.ts`: the English catalogue, `as const satisfies Record<string, Message>`. `MessageKey`
  is derived from it, and every other locale is typed `Messages`, so a missing key is a compile error.
- `translate.ts`: `createTranslator(locale, messages)` with `{name}` interpolation, plural forms via
  `Intl.PluralRules`, and numbers formatted via `Intl.NumberFormat`.
- `context.ts` and `I18nContext.tsx`: `useT()` with an **English default**, and `I18nProvider`, which
  sets `<html lang>`. The app picks the locale from `navigator.languages`.
- `pseudo.ts`: a pseudo-locale (⟦…⟧) used by an integration test to prove shell text flows through
  the catalogue.

Scope: app shell, pages and shared components. Domain content (lessons, labs, simulator labels) is
out of scope for this ADR.

## Alternatives considered

| Option                     | Pros                                                             | Cons                                                               |
| -------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| i18next or FormatJS        | Mature, full ICU                                                 | Dependency weight, runtime parsing, more than needed today         |
| Hard-coded English         | Nothing to build                                                 | Every later translation means touching every component             |
| Small typed layer (chosen) | About 1.8 KB gzipped, compile-time key checking, platform `Intl` | No ICU select or ordinal syntax yet; can be added or swapped later |

## Consequences

- New UI text must use `t('key')`. Tests that match English text keep working, because English is
  the default and strings were moved verbatim.
- Adding a language is a data change plus one line in `LOCALES` (see `TRANSLATING.md`).
- Content translation needs a per-domain catalogue pattern: a future ADR.
