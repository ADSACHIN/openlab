import { en } from './messages/en';
import type { Messages } from './messages/en';

/** Locales with a complete UI catalogue. Add a locale here and in messages/ (see docs/contribution/TRANSLATING.md). */
export const LOCALES: Readonly<Record<string, Messages>> = { en };
export const DEFAULT_LOCALE = 'en';

/** Best available locale for the browser's preference list: exact tag first, then base language. */
export function pickLocale(
  preferred: readonly string[],
  available: readonly string[] = Object.keys(LOCALES),
): string {
  for (const tag of preferred) {
    const lower = tag.toLowerCase();
    const exact = available.find((a) => a.toLowerCase() === lower);
    if (exact) return exact;
    const base = available.find((a) => a.toLowerCase() === lower.split('-')[0]);
    if (base) return base;
  }
  return DEFAULT_LOCALE;
}
