import type { Messages } from './messages/en';
import type { Message } from './types';

/**
 * Pseudo-localisation for tests: wraps every message in ⟦…⟧ and keeps
 * placeholders intact. Any UI text that appears without brackets was not
 * routed through the catalogue.
 */
export function pseudoLocalize(messages: Messages): Messages {
  const wrap = (s: string) => `⟦${s}⟧`;
  const map = (m: Message): Message =>
    typeof m === 'string'
      ? wrap(m)
      : (Object.fromEntries(
          Object.entries(m).map(([k, v]) => [k, typeof v === 'string' ? wrap(v) : v]),
        ) as Message);
  return Object.fromEntries(Object.entries(messages).map(([k, v]) => [k, map(v)])) as Messages;
}
