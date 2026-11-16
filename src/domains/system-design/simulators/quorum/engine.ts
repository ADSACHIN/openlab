import type { SimulatorEngine } from '@core/model';

export const N = 3;
export const REPLICAS = ['A', 'B', 'C'] as const;

export type Phase = 'idle' | 'written' | 'read' | 'replicated' | 'read-again';
export const PHASES: readonly Phase[] = ['idle', 'written', 'read', 'replicated', 'read-again'];

export interface QuorumState {
  w: number;
  r: number;
  phase: Phase;
  /** Version held by each replica (index aligned with REPLICAS). */
  versions: readonly number[];
  /** Replicas contacted by the most recent read. */
  contacted: readonly number[];
  readResult: number | null;
}
export type QuorumAction = { type: 'set-w'; w: number } | { type: 'set-r'; r: number };

/** The write reaches the first W replicas before it is acknowledged; the others lag. */
export const writeTargets = (w: number): number[] => Array.from({ length: w }, (_, i) => i);
/** Worst case for the reader: it hears first from the replicas that are furthest behind. */
export const worstCaseReadSet = (r: number): number[] =>
  Array.from({ length: r }, (_, i) => N - 1 - i);

export function readsLatest(w: number, r: number): boolean {
  const written = new Set(writeTargets(w));
  return worstCaseReadSet(r).some((i) => written.has(i));
}

function init(w: number, r: number): QuorumState {
  return { w, r, phase: 'idle', versions: [1, 1, 1], contacted: [], readResult: null };
}

const read = (versions: readonly number[], r: number) => {
  const contacted = worstCaseReadSet(r);
  return { contacted, readResult: Math.max(...contacted.map((i) => versions[i] ?? 0)) };
};

export const quorumEngine: SimulatorEngine<QuorumState, QuorumAction> = {
  init: () => init(1, 1),
  step: (s) => {
    switch (s.phase) {
      case 'idle': {
        const targets = new Set(writeTargets(s.w));
        return {
          ...s,
          phase: 'written',
          versions: s.versions.map((v, i) => (targets.has(i) ? 2 : v)),
          contacted: [],
          readResult: null,
        };
      }
      case 'written':
        return { ...s, phase: 'read', ...read(s.versions, s.r) };
      case 'read':
        return {
          ...s,
          phase: 'replicated',
          versions: s.versions.map(() => 2),
          contacted: [],
          readResult: null,
        };
      case 'replicated':
        return { ...s, phase: 'read-again', ...read(s.versions, s.r) };
      case 'read-again':
        return s;
    }
  },
  isDone: (s) => s.phase === 'read-again',
  apply: (s, a) => {
    const v = a.type === 'set-w' ? a.w : a.r;
    if (!Number.isInteger(v) || v < 1 || v > N) return s;
    return a.type === 'set-w' ? init(v, s.r) : init(s.w, v);
  },
  describe: (s) => {
    const cfg = `N=${String(N)}, W=${String(s.w)}, R=${String(s.r)} (R + W ${s.w + s.r > N ? '>' : '≤'} N)`;
    switch (s.phase) {
      case 'idle':
        return `${cfg}. Every replica holds version 1. Step to write version 2.`;
      case 'written':
        return `${cfg}. Version 2 acknowledged after ${String(s.w)} replica${s.w === 1 ? '' : 's'} stored it; the rest are still on version 1.`;
      case 'read':
      case 'read-again':
        return `${cfg}. Read from ${s.contacted.map((i) => REPLICAS[i] ?? '').join(', ')} returned version ${String(s.readResult)}: ${s.readResult === 2 ? 'latest' : 'stale'}.`;
      case 'replicated':
        return `${cfg}. Background replication has caught up: every replica holds version 2.`;
    }
  },
};
