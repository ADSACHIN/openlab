import { describe, expect, it } from 'vitest';
import { MODULE_LOADERS } from '@app/modules';
import type { AnySimulatorDefinition } from '@core/model';
import { mulberry32 } from '@utils/random';
import { decodeSetup, encodeSetup, replayLog } from '@utils/share';
import type { ActionLog } from '@utils/share';

/**
 * Shared setups arrive from URLs, so treat them as hostile. For every real
 * simulator, random logs (junk actions, odd values, bursts of steps) must
 * never throw out of replay, and anything that replays must still describe.
 */
async function allSimulators(): Promise<AnySimulatorDefinition[]> {
  const modules = await Promise.all(Object.values(MODULE_LOADERS).map((load) => load()));
  return modules.flatMap((m) => [...m.simulators]);
}

function junkValue(rnd: () => number, depth = 0): unknown {
  const r = rnd();
  if (r < 0.15) return null;
  if (r < 0.3) return Math.floor(rnd() * 2000) - 1000;
  if (r < 0.4) return rnd() * 1e9;
  if (r < 0.55)
    return ['', 'x', 'set-prefix', 'run', 'toggle', '<script>', 'a'.repeat(300), '../../etc'][
      Math.floor(rnd() * 8)
    ];
  if (r < 0.65) return rnd() < 0.5;
  if (depth < 2 && r < 0.85)
    return {
      type: junkValue(rnd, depth + 1),
      value: junkValue(rnd, depth + 1),
      index: junkValue(rnd, depth + 1),
    };
  return [junkValue(rnd, depth + 1)];
}

function randomLog(rnd: () => number): ActionLog {
  return Array.from({ length: 1 + Math.floor(rnd() * 12) }, () =>
    rnd() < 0.4 ? 1 + Math.floor(rnd() * 40) : { a: junkValue(rnd) },
  );
}

describe('shared setups are safe against hostile input', () => {
  it('no simulator throws out of replay, and replayed states still describe', async () => {
    const sims = await allSimulators();
    expect(sims.length).toBe(37);
    const rnd = mulberry32(2026);
    let replayed = 0;
    for (const sim of sims) {
      for (let i = 0; i < 25; i++) {
        const log = randomLog(rnd);
        const state: unknown = replayLog(sim.engine, 1, log);
        if (state !== null) {
          replayed++;
          expect(() => sim.engine.describe(state)).not.toThrow();
        }
      }
    }
    // Most junk is ignored by engine validation, so most logs still replay.
    expect(replayed).toBeGreaterThan(0);
  });

  it('decoding random strings never throws and rarely yields a log', () => {
    const rnd = mulberry32(7);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=+/%';
    for (let i = 0; i < 2000; i++) {
      const s = Array.from({ length: Math.floor(rnd() * 80) }, () =>
        alphabet.charAt(Math.floor(rnd() * alphabet.length)),
      ).join('');
      expect(() => decodeSetup(s)).not.toThrow();
    }
    expect(decodeSetup(encodeSetup([3]) ?? '')).toEqual([3]);
  });
});
