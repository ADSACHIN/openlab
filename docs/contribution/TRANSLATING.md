# Translating OPENLAB

OPENLAB has an i18n **foundation** (ADR-0010): the app shell and shared components read every
user-visible string from a typed catalogue. English is the only complete locale today.

## What is translatable now

| Area                                                                                                             | Where                           | Status                               |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------ |
| App shell, pages, shared components (navigation, buttons, simulator controls, quizzes, progress, search, errors) | `src/i18n/messages/<locale>.ts` | Ready: add a locale                  |
| Domain content (lessons, labs, simulator labels)                                                                 | `src/domains/<id>/…`            | Not yet: needs per-domain catalogues |
| Domain catalogue (titles, taglines)                                                                              | `src/data/domains.ts`           | Not yet                              |

## Adding a UI locale

1. Copy `src/i18n/messages/en.ts` to `src/i18n/messages/<locale>.ts` (a BCP 47 tag such as `es` or
   `pt-BR`) and type it as `Messages`:

   ```ts
   import type { Messages } from './en';
   export const es: Messages = {
     'app.skipLink': 'Saltar al contenido principal' /* … */,
   };
   ```

   A missing key is a **compile error**.

2. Add it to `LOCALES` in `src/i18n/locales.ts`.
3. Keep every `{placeholder}` exactly. `src/i18n/i18n.test.ts` checks that each locale uses the same
   placeholders as English.
4. Plurals use `{ one, other }`, plus `zero`, `two`, `few` or `many` where your language needs them.
   The form is chosen with `Intl.PluralRules` from the `count` parameter.
5. Numbers passed as parameters are formatted with `Intl.NumberFormat` for the locale automatically.
6. Run `npm run validate`. The pseudo-locale test (`tests/integration/i18n.test.tsx`) also proves no
   shell string escaped the catalogue.

The locale is picked from the browser's language preferences (`pickLocale`), and `<html lang>`
follows it. Add a visible language switcher together with the second locale.

## Reviewing translations

Machine translation is not accepted without review by a fluent speaker. Prefer plain, friendly
language that matches the English tone, and keep technical terms in the form learners will meet
elsewhere (often the English term).
