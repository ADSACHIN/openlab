import type { SimulatorEngine } from '@core/model';

export type Policy = 'fifo' | 'lru';
export interface PagingState {
  policy: Policy;
  frames: readonly (number | null)[];
  refs: readonly number[];
  index: number;
  faults: number;
  /** Per frame: time loaded (FIFO) or last used (LRU). */
  stamps: readonly number[];
  lastEvent: string;
}
export type PagingAction =
  { type: 'set-policy'; policy: Policy } | { type: 'set-frames'; count: number };

export const REFERENCE_STRING: readonly number[] = [
  7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1,
];

export function initPaging(policy: Policy, frameCount: number): PagingState {
  return {
    policy,
    frames: Array.from({ length: frameCount }, () => null),
    refs: REFERENCE_STRING,
    index: 0,
    faults: 0,
    stamps: Array.from({ length: frameCount }, () => -1),
    lastEvent: 'No references yet.',
  };
}

export function access(s: PagingState): PagingState {
  const page = s.refs[s.index];
  if (page === undefined) return s;
  const t = s.index;
  const hit = s.frames.indexOf(page);
  const frames = [...s.frames];
  const stamps = [...s.stamps];
  if (hit !== -1) {
    if (s.policy === 'lru') stamps[hit] = t;
    return {
      ...s,
      index: t + 1,
      frames,
      stamps,
      lastEvent: `Page ${String(page)}: hit in frame ${String(hit)}.`,
    };
  }
  let victim = frames.indexOf(null);
  let evicted: number | null = null;
  if (victim === -1) {
    victim = stamps.indexOf(Math.min(...stamps));
    evicted = frames[victim] ?? null;
  }
  frames[victim] = page;
  stamps[victim] = t;
  return {
    ...s,
    index: t + 1,
    frames,
    stamps,
    faults: s.faults + 1,
    lastEvent: `Page ${String(page)}: fault${evicted === null ? '' : `, evicted page ${String(evicted)} (${s.policy.toUpperCase()})`} into frame ${String(victim)}.`,
  };
}

export const pagingEngine: SimulatorEngine<PagingState, PagingAction> = {
  init: () => initPaging('fifo', 3),
  step: access,
  isDone: (s) => s.index >= s.refs.length,
  apply: (s, a) =>
    a.type === 'set-policy'
      ? initPaging(a.policy, s.frames.length)
      : a.count >= 1 && a.count <= 6
        ? initPaging(s.policy, a.count)
        : s,
  describe: (s) =>
    `${s.lastEvent} ${String(s.faults)} faults after ${String(s.index)} of ${String(s.refs.length)} references (${s.policy.toUpperCase()}, ${String(s.frames.length)} frames).`,
};
