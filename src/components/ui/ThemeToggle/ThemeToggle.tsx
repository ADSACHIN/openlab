import { Monitor, Moon, Sun } from 'lucide-react';
import { useT } from '@i18n';
import type { ThemePreference } from '@typings/preferences';
import styles from './ThemeToggle.module.css';

const ICONS: Record<ThemePreference, typeof Sun> = { system: Monitor, light: Sun, dark: Moon };

export interface ThemeToggleProps {
  value: ThemePreference;
  next: ThemePreference;
  onChange: (next: ThemePreference) => void;
}

/** Cycles system → light → dark. Stateless: the app provides value and handler. */
export function ThemeToggle({ value, next, onChange }: ThemeToggleProps) {
  const t = useT();
  const Icon = ICONS[value];
  const current = t(`theme.${value}`);
  const nextLabel = t(`theme.${next}.lower`);
  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => onChange(next)}
      aria-label={t('theme.toggleLabel', { current, next: nextLabel })}
      title={t('theme.toggleTitle', { current, next: nextLabel })}
    >
      <Icon size={18} aria-hidden="true" focusable="false" />
      <span className={styles.text}>{t(`theme.${value}.short`)}</span>
    </button>
  );
}
