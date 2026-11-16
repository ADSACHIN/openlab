import { describe, expect, it } from 'vitest';
import {
  HIT_MS,
  KEYS,
  MISS_MS,
  averageLatency,
  cacheEngine,
  hitRatioFor,
  requestStream,
  zipfWeights,
} from './cache/engine';
import {
  BASE_SPEEDS,
  DURATION,
  averageLatency as lbLatency,
  capacity,
  initLb,
  lbEngine,
  speedsFor,
  tickLb,
} from './load-balancer/engine';
import type { Algorithm, LbState } from './load-balancer/engine';
import {
  ARRIVAL_TICKS,
  BURST_EXTRA,
  PER_CONSUMER,
  initQueue,
  isQueueDone,
  littlesL,
  tickQueue,
} from './queue/engine';
import type { QueueState } from './queue/engine';
import { N, quorumEngine, readsLatest } from './quorum/engine';

function finishLb(algorithm: Algorithm, rate: number, servers: number): LbState {
  let s = initLb(algorithm, rate, servers);
  while (s.tick < DURATION) s = tickLb(s);
  return s;
}

function finishQueue(rate: number, consumers: number): QueueState {
  let s = initQueue(rate, consumers);
  while (!isQueueDone(s)) s = tickQueue(s);
  return s;
}

describe('load balancer', () => {
  it('has the capacity the lesson states', () => {
    expect(BASE_SPEEDS).toEqual([3, 3, 1]);
    expect(capacity(speedsFor(3))).toBe(3.5);
    expect(capacity(speedsFor(5))).toBe(6.5);
  });

  it('is deterministic and conserves requests', () => {
    const a = finishLb('round-robin', 3, 3);
    expect(finishLb('round-robin', 3, 3)).toEqual(a);
    for (const alg of ['round-robin', 'least-connections', 'random'] as const) {
      const s = finishLb(alg, 3, 3);
      const queued = s.servers.reduce((n, sv) => n + sv.queue.length, 0);
      expect(s.completed + s.dropped + queued).toBe(3 * DURATION);
    }
  });

  it('round robin overloads the slow server; least connections does not', () => {
    const rr = finishLb('round-robin', 3, 3);
    const lc = finishLb('least-connections', 3, 3);
    expect(rr.dropped).toBeGreaterThan(0);
    expect(lc.dropped).toBe(0);
    expect(lbLatency(lc)).toBeLessThan(lbLatency(rr));
  });

  it('above capacity, every algorithm drops; scaling out fixes it', () => {
    for (const alg of ['round-robin', 'least-connections', 'random'] as const)
      expect(finishLb(alg, 5, 3).dropped).toBeGreaterThan(0);
    expect(finishLb('least-connections', 5, 5).dropped).toBe(0);
    expect(finishLb('round-robin', 5, 5).dropped).toBeGreaterThan(0);
    expect(
      lbEngine.apply?.(initLb('random', 3, 3), { type: 'set-servers', count: 9 }).servers,
    ).toHaveLength(3);
  });
});

describe('cache', () => {
  it('Zipf traffic is skewed as the lesson states', () => {
    const w = zipfWeights(KEYS);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    const top4 = w.slice(0, 4).reduce((a, b) => a + b, 0);
    expect(top4).toBeCloseTo(0.579, 3);
    expect(requestStream(5)).toEqual(requestStream(5));
  });

  it('average latency follows hit ratio', () => {
    expect(HIT_MS).toBe(1);
    expect(MISS_MS).toBe(50);
    expect(averageLatency(90, 10)).toBeCloseTo(5.9, 10);
    expect(averageLatency(0, 10)).toBe(50);
  });

  it('a bigger cache never lowers the hit ratio here, with diminishing returns', () => {
    const ratios = Array.from({ length: KEYS + 1 }, (_, size) => hitRatioFor(size));
    expect(ratios[0]).toBe(0);
    for (let i = 1; i < ratios.length; i++)
      expect(ratios[i]).toBeGreaterThanOrEqual(ratios[i - 1] ?? 0);
    const gainFirst4 = (ratios[4] ?? 0) - (ratios[0] ?? 0);
    const gainLast4 = (ratios[20] ?? 0) - (ratios[16] ?? 0);
    expect(gainFirst4).toBeGreaterThan(3 * gainLast4);
  });

  it('steps through the stream and resets on resize', () => {
    let s = cacheEngine.init(1);
    while (!cacheEngine.isDone?.(s)) s = cacheEngine.step(s);
    expect(s.hits + s.misses).toBe(200);
    expect(s.hits / 200).toBe(hitRatioFor(4));
    expect(cacheEngine.apply?.(s, { type: 'set-size', size: 6 })).toMatchObject({
      size: 6,
      index: 0,
      hits: 0,
    });
  });
});

describe('queue', () => {
  it("satisfies Little's law exactly over a full run", () => {
    for (const [rate, consumers] of [
      [5, 3],
      [3, 2],
      [8, 6],
      [1, 1],
    ] as const) {
      const s = finishQueue(rate, consumers);
      expect(s.queue).toHaveLength(0);
      expect(s.processed).toBe(s.arrived);
      expect(s.areaUnderQueue).toBe(s.totalTimeInSystem);
      const L = s.areaUnderQueue / s.tick;
      const lambda = s.arrived / s.tick;
      const W = s.totalTimeInSystem / s.processed;
      expect(L).toBeCloseTo(littlesL(lambda, W), 10);
    }
    expect(littlesL(4, 2)).toBe(8);
  });

  it('grows without bound when consumers are too few, and absorbs the burst otherwise', () => {
    const under = finishQueue(5, 2);
    expect(PER_CONSUMER * 2).toBeLessThan(5);
    expect(under.tick).toBeGreaterThan(ARRIVAL_TICKS);
    expect(under.peak).toBeGreaterThan(3 * BURST_EXTRA);
    const ok = finishQueue(5, 3);
    expect(ok.peak).toBeLessThanOrEqual(3 * BURST_EXTRA);
    expect(ok.tick).toBeLessThanOrEqual(ARRIVAL_TICKS + 1);
  });
});

describe('quorum', () => {
  it('reads the latest write in the worst case exactly when R + W > N', () => {
    for (let w = 1; w <= N; w++)
      for (let r = 1; r <= N; r++) expect(readsLatest(w, r)).toBe(r + w > N);
  });

  it('the engine shows a stale read for W=1, R=1 and then convergence', () => {
    let s = quorumEngine.init(1);
    const results: (number | null)[] = [];
    while (!quorumEngine.isDone?.(s)) {
      s = quorumEngine.step(s);
      results.push(s.readResult);
    }
    expect(results).toEqual([null, 1, null, 2]);
    const strong = quorumEngine.apply?.(quorumEngine.init(1), { type: 'set-w', w: 2 });
    const strong2 = strong ? quorumEngine.apply?.(strong, { type: 'set-r', r: 2 }) : undefined;
    let x = strong2 ?? quorumEngine.init(1);
    x = quorumEngine.step(quorumEngine.step(x));
    expect(x.readResult).toBe(2);
  });
});

describe('numbers the lessons and labs rely on', () => {
  it('cache: 60% first reached at size 6; a full-size cache still misses each key once', () => {
    expect(hitRatioFor(5)).toBeLessThan(0.6);
    expect(hitRatioFor(6)).toBeGreaterThanOrEqual(0.6);
    expect(hitRatioFor(4)).toBeCloseTo(0.445, 10);
    expect(new Set(requestStream(5)).size).toBe(KEYS);
    expect(hitRatioFor(KEYS)).toBe(1 - KEYS / 200);
  });

  it('load balancer at 5 per tick: least connections needs 4 servers; round robin drops even with 6', () => {
    expect(finishLb('least-connections', 5, 3).dropped).toBeGreaterThan(0);
    expect(finishLb('least-connections', 5, 4).dropped).toBe(0);
    expect(finishLb('round-robin', 5, 6).dropped).toBeGreaterThan(0);
    expect(finishLb('random', 5, 6).dropped).toBeGreaterThan(0);
  });
});

describe("Little's law readout mid-run", () => {
  it('differs while messages are still waiting, as the lesson says', () => {
    let s = initQueue(5, 3);
    for (let i = 0; i < 25; i++) s = tickQueue(s);
    expect(s.queue.length).toBeGreaterThan(0);
    const L = s.areaUnderQueue / s.tick;
    const lw = (s.arrived / s.tick) * (s.totalTimeInSystem / s.processed);
    expect(Math.abs(L - lw)).toBeGreaterThan(0.1);
  });
});
