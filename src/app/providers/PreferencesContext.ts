import { createContext, useContext } from 'react';
import type { MotionPreference, Preferences, ThemePreference } from '@typings/preferences';

export interface PreferencesContextValue {
  preferences: Preferences;
  /** Theme after resolving "system" against the OS. */
  resolvedTheme: 'light' | 'dark';
  /** True when either the OS or the in-app setting asks for reduced motion. */
  reducedMotion: boolean;
  setTheme: (theme: ThemePreference) => void;
  setMotion: (motion: MotionPreference) => void;
  /** False when localStorage is unavailable; the UI can tell the user settings won't persist. */
  persisted: boolean;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
}
