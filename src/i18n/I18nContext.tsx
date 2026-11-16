import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { I18nContext } from './context';
import { LOCALES } from './locales';
import { en } from './messages/en';
import type { Messages } from './messages/en';
import { createTranslator } from './translate';

export interface I18nProviderProps {
  locale: string;
  /** Override the catalogue (pseudo-localisation in tests). Defaults to LOCALES[locale]. */
  messages?: Messages;
  children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const catalogue = messages ?? LOCALES[locale] ?? en;
  const value = useMemo(
    () => ({ locale, t: createTranslator(locale, catalogue) }),
    [locale, catalogue],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
