import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { MotionPreference, Preferences, ThemePreference } from '@typings/preferences';
import { loadPreferences, savePreferences } from '@core/preferences/preferences';
import { isStorageAvailable } from '@core/storage/safeStorage';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useReducedMotion } from '@hooks/useReducedMotion';
import { PreferencesContext } from './PreferencesContext';
import type { PreferencesContextValue } from './PreferencesContext';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [persisted] = useState(isStorageAvailable);
  const osDark = useMediaQuery('(prefers-color-scheme: dark)');
  const osReducedMotion = useReducedMotion();

  const resolvedTheme: 'light' | 'dark' =
    preferences.theme === 'system' ? (osDark ? 'dark' : 'light') : preferences.theme;
  const reducedMotion = osReducedMotion || preferences.motion === 'reduced';

  // Reflect preferences on <html> so CSS tokens switch; persist afterwards.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = preferences.theme;
    if (preferences.motion === 'reduced') root.dataset.motion = 'reduced';
    else delete root.dataset.motion;
    savePreferences(preferences);
  }, [preferences]);

  const setTheme = useCallback((theme: ThemePreference) => {
    setPreferences((p) => ({ ...p, theme }));
  }, []);
  const setMotion = useCallback((motion: MotionPreference) => {
    setPreferences((p) => ({ ...p, motion }));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, resolvedTheme, reducedMotion, setTheme, setMotion, persisted }),
    [preferences, resolvedTheme, reducedMotion, setTheme, setMotion, persisted],
  );

  return <PreferencesContext value={value}>{children}</PreferencesContext>;
}
