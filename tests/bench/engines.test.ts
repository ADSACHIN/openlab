import { describe, expect, it } from 'vitest';
import { MODULE_LOADERS } from '@app/modules';

/**
 * Evidence for ADR-0012 (WebAssembly). Opt-in timing, never part of the normal
 * suite or CI: run with `npm run bench` (sets VITE_BENCH=1).
 *
 * For each engine: init(1) plus up to 200 steps, repeated; reports the median
 * cost per step and checks the worst engine fits comfortably in one 60 fps frame.
 */
const FRAME_MS = 1000 / 60;
const STEPS = 200;
const REPEATS = 25;

describe.runIf(import.meta.env.VITE_BENCH === '1')('engine cost per step', () => {
  it('every engine steps far faster than one animation frame', async () => {
    const modules = await Promise.all(Object.values(MODULE_LOADERS).map((load) => load()));
    const rows: { id: string; perStepMs: number; steps: number }[] = [];
    for (const m of modules) {
      for (const sim of m.simulators) {
        const samples: number[] = [];
        let steps = 0;
        for (let r = 0; r < REPEATS; r++) {
          const start = performance.now();
          let s: unknown = sim.engine.init(1);
          let n = 0;
          for (; n < STEPS && !(sim.engine.isDone?.(s) ?? false); n++) s = sim.engine.step(s);
          sim.engine.describe(s);
          samples.push(performance.now() - start);
          steps = Math.max(1, n);
        }
        samples.sort((a, b) => a - b);
        rows.push({
          id: sim.id,
          perStepMs: (samples[Math.floor(REPEATS / 2)] ?? 0) / steps,
          steps,
        });
      }
    }
    rows.sort((a, b) => b.perStepMs - a.perStepMs);
    console.log(
      [
        'engine (slowest first)                         ms/step   steps',
        ...rows.map(
          (r) =>
            `${r.id.padEnd(46)} ${r.perStepMs.toFixed(4).padStart(8)}   ${String(r.steps).padStart(5)}`,
        ),
      ].join('\n'),
    );
    expect(rows.length).toBe(37);
    expect(rows[0]?.perStepMs ?? Infinity).toBeLessThan(FRAME_MS / 4);
  }, 120_000);
});
