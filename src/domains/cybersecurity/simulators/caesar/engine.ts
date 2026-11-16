import type { SimulatorEngine } from '@core/model';

export const ALPHABET = 26;

export function shiftText(text: string, shift: number): string {
  const k = ((shift % ALPHABET) + ALPHABET) % ALPHABET;
  return text.replace(/[a-z]/gi, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + k) % ALPHABET) + base);
  });
}

const COMMON = new Set([
  'the',
  'and',
  'at',
  'attack',
  'dawn',
  'is',
  'a',
  'to',
  'of',
  'in',
  'we',
  'meet',
  'noon',
  'secret',
  'go',
]);

/** How many words of the candidate are common English words: a crude but effective plaintext detector. */
export function englishScore(candidate: string): number {
  return candidate
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => COMMON.has(w)).length;
}

export interface CaesarState {
  plaintext: string;
  key: number;
  /** Keys tried so far by the brute-force attacker (0..26). */
  tried: number;
  best: { key: number; score: number } | null;
}
export type CaesarAction =
  { type: 'set-key'; key: number } | { type: 'set-plaintext'; text: string };

export const ciphertextOf = (s: CaesarState): string => shiftText(s.plaintext, s.key);

export const caesarEngine: SimulatorEngine<CaesarState, CaesarAction> = {
  init: () => ({ plaintext: 'attack at dawn', key: 3, tried: 0, best: null }),
  // Each step is the attacker trying one more key: decrypt with it and score the result.
  step: (s) => {
    if (s.tried >= ALPHABET) return s;
    const candidate = shiftText(ciphertextOf(s), -s.tried);
    const score = englishScore(candidate);
    const best = !s.best || score > s.best.score ? { key: s.tried, score } : s.best;
    return { ...s, tried: s.tried + 1, best };
  },
  isDone: (s) => s.tried >= ALPHABET,
  apply: (s, a) => {
    if (a.type === 'set-key')
      return Number.isInteger(a.key) && a.key >= 0 && a.key < ALPHABET
        ? { ...s, key: a.key, tried: 0, best: null }
        : s;
    return { ...s, plaintext: a.text.slice(0, 60), tried: 0, best: null };
  },
  describe: (s) => {
    const c = ciphertextOf(s);
    if (s.tried === 0) return `Ciphertext "${c}". The attacker has tried no keys yet.`;
    const last = s.tried - 1;
    const guess = shiftText(c, -last);
    const bestText = s.best
      ? ` Best so far: key ${String(s.best.key)} with ${String(s.best.score)} English words.`
      : '';
    return `Tried key ${String(last)}: "${guess}".${bestText} ${String(s.tried)} of ${String(ALPHABET)} keys tried.`;
  },
};
