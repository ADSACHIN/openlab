import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE } from './locales';
import { en } from './messages/en';
import { createTranslator } from './translate';
import type { Translate } from './translate';

export interface I18nValue {
  locale: string;
  t: Translate;
}

// English by default, so components render correctly without a provider (tests, isolated use).
export const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: createTranslator(DEFAULT_LOCALE, en),
});

export const useT = (): Translate => useContext(I18nContext).t;
export const useLocale = (): string => useContext(I18nContext).locale;
