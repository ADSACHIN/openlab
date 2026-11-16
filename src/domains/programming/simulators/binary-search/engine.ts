import type { SimulatorEngine } from '@core/model';
import { mulberry32 } from '@utils/random';

export interface Guess {
  index: number;
  value: number;
  result: 'low' | 'high' | 'found';
}
export interface BinarySearchState {
  items: readonly number[];
  target: number;
  lo: number;
  hi: number;
  guesses: readonly Guess[];
  found: boolean;
}
export interface BinarySearchAction {
  type: 'guess';
  index: number;
}

/** 2^5 - 1, so binary search never needs more than five probes. */
export const SIZE = 31;

export function makeItems(seed: number): { items: number[]; target: number } {
  const rnd = mulberry32(seed);
  const items: number[] = [];
  let v = 1 + Math.floor(rnd() * 3);
  for (let i = 0; i < SIZE; i++) {
    items.push(v);
    v += 1 + Math.floor(rnd() * 3);
  }
  const target = items[Math.floor(rnd() * SIZE)] ?? items[0] ?? 0;
  return { items, target };
}

export function guess(s: BinarySearchState, index: number): BinarySearchState {
  if (s.found || index < 0 || index >= s.items.length) return s;
  const value = s.items[index] ?? 0;
  if (value === s.target)
    return {
      ...s,
      found: true,
      lo: index,
      hi: index,
      guesses: [...s.guesses, { index, value, result: 'found' }],
    };
  if (value < s.target)
    return {
      ...s,
      lo: Math.max(s.lo, index + 1),
      guesses: [...s.guesses, { index, value, result: 'low' }],
    };
  return {
    ...s,
    hi: Math.min(s.hi, index - 1),
    guesses: [...s.guesses, { index, value, result: 'high' }],
  };
}

export const binarySearchEngine: SimulatorEngine<BinarySearchState, BinarySearchAction> = {
  init: (seed) => {
    const { items, target } = makeItems(seed);
    return { items, target, lo: 0, hi: SIZE - 1, guesses: [], found: false };
  },
  // Playing performs textbook binary search: always probe the middle of [lo, hi].
  step: (s) => (s.found || s.lo > s.hi ? s : guess(s, Math.floor((s.lo + s.hi) / 2))),
  isDone: (s) => s.found || s.lo > s.hi,
  apply: (s, a) => guess(s, a.index),
  describe: (s) => {
    const last = s.guesses[s.guesses.length - 1];
    const range = `Candidates: positions ${String(s.lo + 1)} to ${String(s.hi + 1)} (${String(Math.max(0, s.hi - s.lo + 1))} left).`;
    if (!last)
      return `Find ${String(s.target)} in a sorted list of ${String(SIZE)} numbers. ${range}`;
    if (last.result === 'found')
      return `Found ${String(s.target)} at position ${String(last.index + 1)} in ${String(s.guesses.length)} guesses.`;
    return `Guess ${String(s.guesses.length)}: position ${String(last.index + 1)} holds ${String(last.value)}, which is too ${last.result}. ${range}`;
  },
};
