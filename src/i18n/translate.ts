import type { MessageKey, Messages } from './messages/en';
import type { Message, Params } from './types';

export type Translate = (key: MessageKey, params?: Params) => string;

/** Fill `{name}` placeholders; numbers are formatted for the locale. Unknown placeholders are left visible. */
export function interpolate(
  template: string,
  params: Params | undefined,
  numberFormat: Intl.NumberFormat,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const v = params[name];
    if (v === undefined) return match;
    return typeof v === 'number' ? numberFormat.format(v) : v;
  });
}

function select(message: Message, params: Params | undefined, plural: Intl.PluralRules): string {
  if (typeof message === 'string') return message;
  const count = params?.count;
  const category = typeof count === 'number' ? plural.select(count) : 'other';
  return message[category] ?? message.other;
}

export function createTranslator(locale: string, messages: Messages): Translate {
  const plural = new Intl.PluralRules(locale);
  const numberFormat = new Intl.NumberFormat(locale);
  return (key, params) => interpolate(select(messages[key], params, plural), params, numberFormat);
}
