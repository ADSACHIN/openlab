import { describe, expect, it } from 'vitest';
import type { SimulatorEngine } from '@core/model/types';
import {
  MAX_SETUP_CHARS,
  MAX_STEPS,
  appendAction,
  appendSteps,
  decodeSetup,
  encodeSetup,
  replayLog,
  totalSteps,
} from './share';
import type { ActionLog } from './share';

interface S {
  n: number;
  label: string;
}
type A = { type: 'add'; by: number } | { type: 'label'; text: string };
const engine: SimulatorEngine<S, A> = {
  init: () => ({ n: 0, label: '' }),
  step: (s) => ({ ...s, n: s.n + 1 }),
  isDone: (s) => s.n >= 100,
  apply: (s, a) => (a.type === 'add' ? { ...s, n: s.n + a.by } : { ...s, label: a.text }),
  describe: (s) => String(s.n),
};

describe('shareable setups', () => {
  it('merges consecutive steps and keeps actions in order', () => {
    let log: ActionLog = [];
    log = appendSteps(log, 2);
    log = appendSteps(log, 3);
    log = appendAction(log, { type: 'add', by: 10 });
    log = appendSteps(log, 0);
    log = appendSteps(log, 1);
    expect(log).toEqual([5, { a: { type: 'add', by: 10 } }, 1]);
    expect(totalSteps(log)).toBe(6);
  });

  it('round-trips through a URL-safe encoding, including non-ASCII text', () => {
    const log: ActionLog = [3, { a: { type: 'label', text: 'naïve café 👍 <b>' } }, 2];
    const encoded = encodeSetup(log);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeSetup(encoded ?? '')).toEqual(log);
  });

  it('replays to exactly the live state', () => {
    let live = engine.init(1);
    let log: ActionLog = [];
    for (const step of [
      () => engine.step(live),
      () => engine.apply?.(live, { type: 'add', by: 7 }) ?? live,
      () => engine.step(live),
    ]) {
      const before = live;
      live = step();
      log =
        live.n === before.n + 1 ? appendSteps(log, 1) : appendAction(log, { type: 'add', by: 7 });
    }
    expect(replayLog(engine, 1, log)).toEqual(live);
    expect(replayLog(engine, 1, [500])).toEqual({ n: 100, label: '' });
  });

  it('rejects malformed, oversized or suspicious input without throwing', () => {
    const enc = (v: unknown) =>
      btoa(JSON.stringify(v)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    for (const bad of [
      '',
      'not base64!',
      '%%%',
      'x'.repeat(MAX_SETUP_CHARS + 1),
      enc({ a: 1 }),
      enc('[1,2'),
      enc([0]),
      enc([1.5]),
      enc([-1]),
      enc([MAX_STEPS + 1]),
      enc([MAX_STEPS, 1]),
      enc([{ b: 1 }]),
      enc([{ a: 1, __proto__x: 2 }]),
      enc([[1]]),
      enc([null]),
    ]) {
      expect(decodeSetup(bad), bad.slice(0, 30)).toBeNull();
    }
    expect(decodeSetup(enc(JSON.parse('[{"a":1,"__proto__":{"x":1}}]')))).toBeNull();
    expect(
      encodeSetup(
        Array.from({ length: 2000 }, (_, i) => ({
          a: { type: 'label', text: `entry ${String(i)}` },
        })),
      ),
    ).toBeNull();
  });

  it('replay returns null when an action throws or produces a non-state', () => {
    const fragile: SimulatorEngine<S, A> = {
      ...engine,
      apply: (s, a) => (a.type === 'add' ? { ...s, n: s.n + a.by } : (undefined as unknown as S)),
    };
    expect(replayLog(fragile, 1, [{ a: { type: 'label', text: 'x' } }])).toBeNull();
    const throwing: SimulatorEngine<S, A> = {
      ...engine,
      apply: () => {
        throw new Error('boom');
      },
    };
    expect(replayLog(throwing, 1, [{ a: {} }])).toBeNull();
    const noApply: SimulatorEngine<S, A> = {
      init: (seed) => engine.init(seed),
      step: (s) => engine.step(s),
      describe: (s) => engine.describe(s),
    };
    expect(replayLog(noApply, 1, [{ a: {} }])).toBeNull();
  });
});
