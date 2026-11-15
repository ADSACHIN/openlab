import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_KEY,
  isPreferences,
  loadPreferences,
  nextTheme,
  savePreferences,
} from './preferences';

describe('preferences', () => {
  it('falls back to defaults when nothing is stored', () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('saves and reloads', () => {
    expect(savePreferences({ schemaVersion: 1, theme: 'dark', motion: 'reduced' })).toBe(true);
    expect(loadPreferences()).toEqual({ schemaVersion: 1, theme: 'dark', motion: 'reduced' });
  });

  it('rejects unknown keys and bad values', () => {
    expect(isPreferences({ schemaVersion: 1, theme: 'dark', motion: 'system', extra: 1 })).toBe(
      false,
    );
    expect(isPreferences({ schemaVersion: 1, theme: 'neon', motion: 'system' })).toBe(false);
    expect(isPreferences({ schemaVersion: 2, theme: 'dark', motion: 'system' })).toBe(false);
    expect(isPreferences(null)).toBe(false);
    expect(isPreferences('dark')).toBe(false);
  });

  it('ignores corrupt stored data', () => {
    window.localStorage.setItem(`openlab:${PREFERENCES_KEY}`, '{"theme":"dark"}');
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('cycles themes system → light → dark → system', () => {
    expect(nextTheme('system')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('system');
  });
});
