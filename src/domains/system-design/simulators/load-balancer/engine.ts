import type { SimulatorEngine } from '@core/model';
import { nextRandom } from '@utils/random';

export type Algorithm = 'round-robin' | 'least-connections' | 'random';

export interface Request {
  id: number;
  remaining: number;
  arrived: number;
}
export interface Server {
  /** Work units processed per tick. */
  speed: number;
  queue: readonly Request[];
}
export interface LbState {
  algorithm: Algorithm;
  /** New requests per tick. */
  rate: number;
  servers: readonly Server[];
  tick: number;
  nextId: number;
  rr: number;
  rng: number;
  completed: number;
  dropped: number;
  totalLatency: number;
}
export type LbAction =
  | { type: 'set-algorithm'; algorithm: Algorithm }
  | { type: 'set-rate'; rate: number }
  | { type: 'set-servers'; count: number };

export const BASE_SPEEDS: readonly number[] = [3, 3, 1];
export const EXTRA_SPEED = 3;
export const QUEUE_CAP = 6;
export const DURATION = 40;
/** Each request needs 1, 2 or 3 work units, uniformly: 2 on average. */
export const MEAN_WORK = 2;
export const SEED = 11;

export function speedsFor(count: number): number[] {
  return [
    ...BASE_SPEEDS,
    ...Array.from({ length: Math.max(0, count - BASE_SPEEDS.length) }, () => EXTRA_SPEED),
  ];
}

/** Requests per tick the pool can sustain on average. */
export function capacity(speeds: readonly number[]): number {
  return speeds.reduce((a, b) => a + b, 0) / MEAN_WORK;
}

export function initLb(algorithm: Algorithm, rate: number, serverCount: number): LbState {
  return {
    algorithm,
    rate,
    servers: speedsFor(serverCount).map((speed) => ({ speed, queue: [] })),
    tick: 0,
    nextId: 1,
    rr: 0,
    rng: SEED,
    completed: 0,
    dropped: 0,
    totalLatency: 0,
  };
}

export function tickLb(s: LbState): LbState {
  if (s.tick >= DURATION) return s;
  const queues = s.servers.map((sv) => [...sv.queue]);
  let { rr, rng, nextId, dropped, completed, totalLatency } = s;

  for (let i = 0; i < s.rate; i++) {
    const w = nextRandom(rng);
    rng = w.state;
    const work = 1 + Math.floor(w.value * 3);
    let target: number;
    if (s.algorithm === 'round-robin') {
      target = rr % queues.length;
      rr++;
    } else if (s.algorithm === 'least-connections') {
      target = 0;
      queues.forEach((q, j) => {
        if (q.length < (queues[target]?.length ?? Infinity)) target = j;
      });
    } else {
      const r = nextRandom(rng);
      rng = r.state;
      target = Math.floor(r.value * queues.length);
    }
    const q = queues[target];
    if (!q || q.length >= QUEUE_CAP) dropped++;
    else q.push({ id: nextId, remaining: work, arrived: s.tick });
    nextId++;
  }

  const servers = s.servers.map((sv, j) => {
    const q = queues[j] ?? [];
    let units = sv.speed;
    while (units > 0 && q.length > 0) {
      const head = q[0];
      if (!head) break;
      const used = Math.min(units, head.remaining);
      units -= used;
      if (used === head.remaining) {
        q.shift();
        completed++;
        totalLatency += s.tick + 1 - head.arrived;
      } else {
        q[0] = { ...head, remaining: head.remaining - used };
      }
    }
    return { speed: sv.speed, queue: q };
  });

  return { ...s, servers, tick: s.tick + 1, nextId, rr, rng, completed, dropped, totalLatency };
}

export const averageLatency = (s: LbState): number =>
  s.completed === 0 ? 0 : s.totalLatency / s.completed;

export const lbEngine: SimulatorEngine<LbState, LbAction> = {
  init: () => initLb('round-robin', 3, 3),
  step: tickLb,
  isDone: (s) => s.tick >= DURATION,
  apply: (s, a) => {
    switch (a.type) {
      case 'set-algorithm':
        return initLb(a.algorithm, s.rate, s.servers.length);
      case 'set-rate':
        return a.rate >= 1 && a.rate <= 6 ? initLb(s.algorithm, a.rate, s.servers.length) : s;
      case 'set-servers':
        return a.count >= 3 && a.count <= 6 ? initLb(s.algorithm, s.rate, a.count) : s;
    }
  },
  describe: (s) =>
    `Tick ${String(s.tick)} of ${String(DURATION)}, ${s.algorithm}, ${String(s.rate)} requests per tick: ${String(s.completed)} completed, ${String(s.dropped)} dropped, queues ${s.servers.map((sv) => String(sv.queue.length)).join('/')}.`,
};
