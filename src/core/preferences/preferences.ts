import type { MotionPreference, Preferences, ThemePreference } from '@typings/preferences';
import { readJson, writeJson } from '@core/storage/safeStorage';

export const PREFERENCES_KEY = 'preferences:v1';

export const DEFAULT_PREFERENCES: Preferences = {
  schemaVersion: 1,
  theme: 'system',
  motion: 'system',
};

const THEMES: readonly ThemePreference[] = ['system', 'light', 'dark'];
const MOTIONS: readonly MotionPreference[] = ['system', 'reduced'];

export function isThemePreference(v: unknown): v is ThemePreference {
  return typeof v === 'string' && (THEMES as readonly string[]).includes(v);
}

export function isMotionPreference(v: unknown): v is MotionPreference {
  return typeof v === 'string' && (MOTIONS as readonly string[]).includes(v);
}

/** Strict shape check: unknown keys are rejected so corrupt data never leaks in. */
export function isPreferences(v: unknown): v is Preferences {
  if (typeof v !== 'object' || v === null) return false;
  const keys = Object.keys(v);
  if (keys.length !== 3) return false;
  const o = v as Record<string, unknown>;
  return o.schemaVersion === 1 && isThemePreference(o.theme) && isMotionPreference(o.motion);
}

export function loadPreferences(): Preferences {
  return readJson(PREFERENCES_KEY, isPreferences) ?? DEFAULT_PREFERENCES;
}

export function savePreferences(p: Preferences): boolean {
  return writeJson(PREFERENCES_KEY, p);
}

/** Cycle order used by the theme toggle button. */
export function nextTheme(current: ThemePreference): ThemePreference {
  const i = THEMES.indexOf(current);
  return THEMES[(i + 1) % THEMES.length] ?? 'system';
}
