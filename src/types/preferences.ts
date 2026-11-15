export type ThemePreference = 'system' | 'light' | 'dark';
export type MotionPreference = 'system' | 'reduced';

export interface Preferences {
  schemaVersion: 1;
  theme: ThemePreference;
  motion: MotionPreference;
}
