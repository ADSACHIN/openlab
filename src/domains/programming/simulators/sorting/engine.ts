import type { SimulatorEngine } from '@core/model';
import { shuffled } from '@utils/random';

export type Algorithm = 'bubble' | 'insertion' | 'selection';
export type InputKind = 'random' | 'nearly-sorted' | 'reversed';

export interface Snapshot {
  array: readonly number[];
  compare: readonly [number, number] | null;
  swapped: boolean;
  comparisons: number;
  swaps: number;
  /** Indices known to be in final position. */
  settled: readonly number[];
}

export interface SortingState {
  algorithm: Algorithm;
  input: InputKind;
  seed: number;
  trace: readonly Snapshot[];
  index: number;
}
export type SortingAction =
  | { type: 'set-algorithm'; algorithm: Algorithm }
  | { type: 'set-input'; input: InputKind }
  | { type: 'reshuffle' };

export const N = 10;

export function makeInput(kind: InputKind, seed: number): number[] {
  const base = Array.from({ length: N }, (_, i) => i + 1);
  if (kind === 'reversed') return base.reverse();
  if (kind === 'random') return shuffled(base, seed);
  // nearly sorted: swap two adjacent pairs
  const arr = [...base];
  const swap = (i: number) => {
    const a = arr[i];
    const b = arr[i + 1];
    if (a !== undefined && b !== undefined) {
      arr[i] = b;
      arr[i + 1] = a;
    }
  };
  swap(2);
  swap(6);
  return arr;
}

/** Produce the full step trace up front: deterministic, tiny, and trivially steppable. */
export function buildTrace(algorithm: Algorithm, start: readonly number[]): Snapshot[] {
  const a = [...start];
  const out: Snapshot[] = [
    { array: [...a], compare: null, swapped: false, comparisons: 0, swaps: 0, settled: [] },
  ];
  let comparisons = 0;
  let swaps = 0;
  const settled = new Set<number>();
  const snap = (compare: [number, number] | null, swapped: boolean) => {
    out.push({ array: [...a], compare, swapped, comparisons, swaps, settled: [...settled] });
  };
  const swap = (i: number, j: number) => {
    const x = a[i];
    const y = a[j];
    if (x === undefined || y === undefined) return;
    a[i] = y;
    a[j] = x;
    swaps++;
  };
  const less = (i: number, j: number) => {
    comparisons++;
    return (a[i] ?? 0) < (a[j] ?? 0);
  };

  if (algorithm === 'bubble') {
    for (let end = a.length - 1; end > 0; end--) {
      let any = false;
      for (let i = 0; i < end; i++) {
        const sw = less(i + 1, i);
        if (sw) {
          swap(i, i + 1);
          any = true;
        }
        snap([i, i + 1], sw);
      }
      settled.add(end);
      if (!any) {
        for (let k = 0; k <= end; k++) settled.add(k);
        snap(null, false);
        break;
      }
    }
    settled.add(0);
  } else if (algorithm === 'insertion') {
    settled.add(0);
    for (let i = 1; i < a.length; i++) {
      let j = i;
      while (j > 0 && less(j, j - 1)) {
        swap(j, j - 1);
        snap([j - 1, j], true);
        j--;
      }
      if (j > 0) snap([j - 1, j], false);
      for (let k = 0; k <= i; k++) settled.add(k);
    }
  } else {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) {
        const smaller = less(j, min);
        if (smaller) min = j;
        snap([j, min], false);
      }
      if (min !== i) swap(i, min);
      settled.add(i);
      snap([i, min], min !== i);
    }
    settled.add(a.length - 1);
  }
  const final = out[out.length - 1];
  if (final) out[out.length - 1] = { ...final, settled: a.map((_, i) => i), compare: null };
  return out;
}

function init(algorithm: Algorithm, input: InputKind, seed: number): SortingState {
  return { algorithm, input, seed, trace: buildTrace(algorithm, makeInput(input, seed)), index: 0 };
}

export function current(s: SortingState): Snapshot {
  return (
    s.trace[s.index] ??
    s.trace[0] ?? {
      array: [],
      compare: null,
      swapped: false,
      comparisons: 0,
      swaps: 0,
      settled: [],
    }
  );
}

export const sortingEngine: SimulatorEngine<SortingState, SortingAction> = {
  init: (seed) => init('bubble', 'random', seed),
  step: (s) => ({ ...s, index: Math.min(s.index + 1, s.trace.length - 1) }),
  isDone: (s) => s.index >= s.trace.length - 1,
  apply: (s, a) => {
    switch (a.type) {
      case 'set-algorithm':
        return init(a.algorithm, s.input, s.seed);
      case 'set-input':
        return init(s.algorithm, a.input, s.seed);
      case 'reshuffle':
        return init(s.algorithm, s.input, s.seed + 1);
    }
  },
  describe: (s) => {
    const c = current(s);
    const done = s.index >= s.trace.length - 1;
    const head = `${s.algorithm} sort on ${s.input.replace('-', ' ')} input`;
    if (done)
      return `${head} finished: ${String(c.comparisons)} comparisons, ${String(c.swaps)} swaps.`;
    if (!c.compare) return `${head}: ready. ${String(s.trace.length - 1)} steps to go.`;
    const [i, j] = c.compare;
    return `${head}, step ${String(s.index)}: compared positions ${String(i + 1)} and ${String(j + 1)}${c.swapped ? ', swapped' : ''}. ${String(c.comparisons)} comparisons so far.`;
  },
};
