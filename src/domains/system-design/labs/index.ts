import { defineLab } from '@core/model';
import { hitRatioFor } from '../simulators/cache/engine';
import type { CacheState } from '../simulators/cache/engine';
import { DURATION } from '../simulators/load-balancer/engine';
import type { LbState } from '../simulators/load-balancer/engine';

export const TARGET_RATE = 5;
export const TARGET_HIT_RATIO = 0.6;

export const balanceLab = defineLab({
  slug: 'handle-five-per-tick',
  domainId: 'system-design',
  title: 'Handle 5 requests per tick',
  summary: 'Serve the load without dropping anything, on as few servers as possible.',
  estimatedMinutes: 4,
  prerequisites: ['system-design/scaling-and-load-balancing'],
  simulatorId: 'system-design/load-balancer',
  goal: `At ${String(TARGET_RATE)} requests per tick, finish all 40 ticks with zero dropped requests using the fewest servers that can do it.`,
  instructions: [
    {
      type: 'paragraph',
      text: 'Change the rate, the algorithm and the server count, then run to the end. Changing any of them restarts the run.',
    },
  ],
  check: (state) => {
    const s = state as LbState;
    if (s.rate !== TARGET_RATE)
      return {
        passed: false,
        message: `Set the rate to ${String(TARGET_RATE)} requests per tick.`,
        score: 0,
      };
    if (s.tick < DURATION) return { passed: false, message: 'Run all 40 ticks first.', score: 10 };
    if (s.dropped > 0)
      return {
        passed: false,
        message: `${String(s.dropped)} requests dropped with ${s.algorithm} on ${String(s.servers.length)} servers.${s.algorithm !== 'least-connections' ? ' Adding servers alone may not fix it — look at the slow one.' : ''}`,
        score: 30,
      };
    if (s.servers.length > 4)
      return {
        passed: false,
        message: `No drops with ${String(s.servers.length)} servers. Can you do it with fewer?`,
        score: 70,
      };
    return {
      passed: true,
      message: `Zero drops on ${String(s.servers.length)} servers with ${s.algorithm}: routing by load handled what extra hardware alone could not.`,
      score: 100,
    };
  },
});

export const cacheLab = defineLab({
  slug: 'right-size-the-cache',
  domainId: 'system-design',
  title: 'Right-size the cache',
  summary: 'Reach a 60% hit ratio with the smallest cache that achieves it.',
  estimatedMinutes: 3,
  prerequisites: ['system-design/caching'],
  simulatorId: 'system-design/lru-cache',
  goal: 'Run all 200 requests and finish with a hit ratio of at least 60%, using the smallest cache that reaches it.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Changing the size restarts the run. Memory costs money: the right answer is the smallest size that meets the target.',
    },
  ],
  check: (state) => {
    const s = state as CacheState;
    if (s.index < s.stream.length)
      return { passed: false, message: 'Run all 200 requests first.', score: 10 };
    const ratio = s.hits / s.stream.length;
    const pct = (x: number) => `${(100 * x).toFixed(1)}%`;
    if (ratio < TARGET_HIT_RATIO)
      return {
        passed: false,
        message: `Size ${String(s.size)} reached ${pct(ratio)}. Not enough yet.`,
        score: 30,
      };
    const smaller = hitRatioFor(s.size - 1);
    if (s.size > 0 && smaller >= TARGET_HIT_RATIO)
      return {
        passed: false,
        message: `${pct(ratio)} meets the target, but size ${String(s.size - 1)} would too (${pct(smaller)}).`,
        score: 70,
      };
    return {
      passed: true,
      message: `Size ${String(s.size)} gives ${pct(ratio)}; size ${String(s.size - 1)} would give only ${pct(smaller)}.`,
      score: 100,
    };
  },
});
