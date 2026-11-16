import { describe, expect, it } from 'vitest';
import { createRegistry } from '@core/registry';
import { systemDesignModule } from './index';
import { access, initCache } from './simulators/cache/engine';
import { DURATION, initLb, tickLb } from './simulators/load-balancer/engine';
import type { Algorithm } from './simulators/load-balancer/engine';

describe('system-design module', () => {
  const registry = createRegistry([systemDesignModule]);

  it('registers in prerequisite order', () => {
    expect(registry.lessonsFor('system-design').map((l) => l.slug)).toEqual([
      'scaling-and-load-balancing',
      'caching',
      'queues-and-backpressure',
      'replication-and-consistency',
    ]);
  });

  it('grades the load-balancing lab', () => {
    const lab = registry.getLab('system-design/handle-five-per-tick');
    const run = (alg: Algorithm, rate: number, servers: number) => {
      let s = initLb(alg, rate, servers);
      while (s.tick < DURATION) s = tickLb(s);
      return s;
    };
    expect(lab?.check(initLb('round-robin', 3, 3))).toMatchObject({ passed: false, score: 0 });
    expect(lab?.check(initLb('round-robin', 5, 3))).toMatchObject({ passed: false, score: 10 });
    expect(lab?.check(run('round-robin', 5, 6))).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(run('least-connections', 5, 5))).toMatchObject({ passed: false, score: 70 });
    expect(lab?.check(run('least-connections', 5, 4))).toMatchObject({ passed: true, score: 100 });
  });

  it('grades the cache lab', () => {
    const lab = registry.getLab('system-design/right-size-the-cache');
    const run = (size: number) => {
      let s = initCache(size);
      while (s.index < s.stream.length) s = access(s);
      return s;
    };
    expect(lab?.check(initCache(6))).toMatchObject({ passed: false, score: 10 });
    expect(lab?.check(run(5))).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(run(8))).toMatchObject({ passed: false, score: 70 });
    expect(lab?.check(run(6))).toMatchObject({
      passed: true,
      message: 'Size 6 gives 60.5%; size 5 would give only 51.5%.',
    });
  });
});
