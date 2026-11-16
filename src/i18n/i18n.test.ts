import { describe, expect, it } from 'vitest';
import { LOCALES, createTranslator, en, interpolate, pickLocale, pseudoLocalize } from './index';
import type { Messages } from './index';

describe('i18n', () => {
  const t = createTranslator('en', en);

  it('looks up, interpolates and formats numbers for the locale', () => {
    expect(t('sim.play')).toBe('Play');
    expect(t('domain.lessonsDone', { done: 1, total: 6 })).toBe('1 / 6 done');
    expect(t('quiz.score', { correct: 2, total: 3 })).toBe('You got 2 of 3 correct.');
    expect(t('search.indexed', { count: 1234 })).toBe('1,234 lessons and labs indexed.');
    expect(createTranslator('de', en)('search.indexed', { count: 1234 })).toBe(
      '1.234 lessons and labs indexed.',
    );
    expect(interpolate('{a} and {missing}', { a: 'x' }, new Intl.NumberFormat('en'))).toBe(
      'x and {missing}',
    );
  });

  it('chooses plural forms with Intl.PluralRules', () => {
    expect(t('lab.attempts', { count: 1 })).toBe('1 attempt');
    expect(t('lab.attempts', { count: 3 })).toBe('3 attempts');
    expect(t('search.results', { count: 1, query: 'tls' })).toBe('1 result for “tls”.');
    expect(t('search.results', { count: 0, query: 'x' })).toBe('0 results for “x”.');
  });

  it('every locale provides every key with the same placeholders', () => {
    const placeholders = (m: unknown) =>
      [...JSON.stringify(m).matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort();
    for (const [locale, messages] of Object.entries(LOCALES)) {
      expect(Object.keys(messages).sort(), locale).toEqual(Object.keys(en).sort());
      for (const key of Object.keys(en) as (keyof Messages)[])
        expect(placeholders(messages[key]), `${locale}:${key}`).toEqual(placeholders(en[key]));
    }
  });

  it('picks the best available locale', () => {
    expect(pickLocale(['fr-CA', 'en-GB'])).toBe('en');
    expect(pickLocale(['es-MX', 'es'], ['en', 'es'])).toBe('es');
    expect(pickLocale(['zz'])).toBe('en');
    expect(pickLocale([])).toBe('en');
  });

  it('pseudo-localisation wraps text and keeps placeholders', () => {
    const p = createTranslator('en', pseudoLocalize(en));
    expect(p('sim.play')).toBe('⟦Play⟧');
    expect(p('lab.attempts', { count: 2 })).toBe('⟦2 attempts⟧');
  });
});

describe('locale-aware numbers inside UI strings', () => {
  it('formats simulator speed options for the locale', () => {
    expect(createTranslator('en', en)('sim.speedOption', { speed: 0.5 })).toBe('×0.5');
    expect(createTranslator('de', en)('sim.speedOption', { speed: 0.5 })).toBe('×0,5');
  });
});
