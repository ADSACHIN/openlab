import type { SimulatorEngine } from '@core/model';

/** The word counts from Sennrich et al. (2016), the paper that brought BPE to NLP. */
export const CORPUS: Readonly<Record<string, number>> = { low: 5, lower: 2, newest: 6, widest: 3 };
export const END = '_';
export const MAX_MERGES = 10;
export const SAMPLE = 'lowest newer';

export type Segmentation = Readonly<Record<string, readonly string[]>>;

export interface TokenizerState {
  merges: readonly (readonly [string, string])[];
  words: Segmentation;
}
export type TokenizerAction = never;

export function initialWords(): Segmentation {
  return Object.fromEntries(Object.keys(CORPUS).map((w) => [w, [...w.split(''), END]]));
}

export function pairCounts(words: Segmentation): Map<string, number> {
  const counts = new Map<string, number>();
  for (const [w, syms] of Object.entries(words)) {
    const freq = CORPUS[w] ?? 0;
    for (let i = 0; i < syms.length - 1; i++) {
      const key = `${syms[i] ?? ''} ${syms[i + 1] ?? ''}`;
      counts.set(key, (counts.get(key) ?? 0) + freq);
    }
  }
  return counts;
}

/** Most frequent pair; ties broken alphabetically so the result is deterministic. */
export function bestPair(words: Segmentation): { pair: [string, string]; count: number } | null {
  let best: { key: string; count: number } | null = null;
  for (const [key, count] of pairCounts(words)) {
    if (!best || count > best.count || (count === best.count && key < best.key))
      best = { key, count };
  }
  if (!best || best.count < 2) return null;
  const [a = '', b = ''] = best.key.split(' ');
  return { pair: [a, b], count: best.count };
}

export function applyMerge(syms: readonly string[], [a, b]: readonly [string, string]): string[] {
  const out: string[] = [];
  for (let i = 0; i < syms.length; i++) {
    if (syms[i] === a && syms[i + 1] === b) {
      out.push(a + b);
      i++;
    } else out.push(syms[i] ?? '');
  }
  return out;
}

export function tokenCount(words: Segmentation): number {
  return Object.entries(words).reduce((n, [w, syms]) => n + (CORPUS[w] ?? 0) * syms.length, 0);
}

export function vocabulary(words: Segmentation): string[] {
  return [...new Set(Object.values(words).flat())].sort();
}

/** Tokenise new text by replaying the learned merges in order, as real BPE tokenisers do. */
export function tokenize(text: string, merges: readonly (readonly [string, string])[]): string[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((w) =>
      merges.reduce<string[]>((syms, m) => applyMerge(syms, m), [...w.split(''), END]),
    );
}

export const tokenizerEngine: SimulatorEngine<TokenizerState> = {
  init: () => ({ merges: [], words: initialWords() }),
  step: (s) => {
    const best = bestPair(s.words);
    if (!best || s.merges.length >= MAX_MERGES) return s;
    const words = Object.fromEntries(
      Object.entries(s.words).map(([w, syms]) => [w, applyMerge(syms, best.pair)]),
    );
    return { merges: [...s.merges, best.pair], words };
  },
  isDone: (s) => s.merges.length >= MAX_MERGES || bestPair(s.words) === null,
  describe: (s) => {
    const last = s.merges[s.merges.length - 1];
    const head = last
      ? `Merge ${String(s.merges.length)}: "${last[0]}" + "${last[1]}" → "${last[0] + last[1]}".`
      : 'Every word starts as single characters plus an end marker.';
    return `${head} The corpus is now ${String(tokenCount(s.words))} tokens with a vocabulary of ${String(vocabulary(s.words).length)} symbols.`;
  },
};
