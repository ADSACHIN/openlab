/** A message is plain text, or plural forms chosen with Intl.PluralRules from the `count` parameter. */
export interface PluralMessage {
  one: string;
  other: string;
  /** Optional extra CLDR categories (few, many, zero, two) for languages that need them. */
  zero?: string;
  two?: string;
  few?: string;
  many?: string;
}
export type Message = string | PluralMessage;
export type Params = Readonly<Record<string, string | number>>;
