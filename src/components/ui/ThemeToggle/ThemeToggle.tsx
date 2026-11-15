import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePreference } from '@typings/preferences';
import styles from './ThemeToggle.module.css';

const META: Record<ThemePreference, { label: string; Icon: typeof Sun }> = {
  system: { label: 'System theme', Icon: Monitor },
  light: { label: 'Light theme', Icon: Sun },
  dark: { label: 'Dark theme', Icon: Moon },
};

export interface ThemeToggleProps {
  value: ThemePreference;
  next: ThemePreference;
  onChange: (next: ThemePreference) => void;
}

/** Cycles system → light → dark. Stateless: the app provides value and handler. */
export function ThemeToggle({ value, next, onChange }: ThemeToggleProps) {
  const { label, Icon } = META[value];
  const nextLabel = META[next].label.toLowerCase();
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => onChange(next)}
      aria-label={`${label}. Switch to ${nextLabel}`}
      title={`${label} — click for ${nextLabel}`}
    >
      <Icon size={18} aria-hidden="true" focusable="false" />
      <span className={styles.text}>{label.replace(' theme', '')}</span>
    </button>
  );
}
