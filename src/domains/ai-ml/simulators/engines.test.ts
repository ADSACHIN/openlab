import { describe, expect, it } from 'vitest';
import {
  RATES,
  START,
  TARGET,
  converges,
  f,
  gradientEngine,
  stepsToTarget,
} from './gradient/engine';
import {
  MAX_EPOCHS,
  accuracy,
  makePoints,
  perceptronEngine,
  predict,
  stepPerceptron,
} from './perceptron/engine';
import type { PerceptronState } from './perceptron/engine';
import {
  CANDIDATES,
  SAMPLES,
  drawn,
  probabilities,
  samplingEngine,
  softmax,
} from './sampling/engine';
import {
  SAMPLE,
  bestPair,
  initialWords,
  tokenCount,
  tokenize,
  tokenizerEngine,
  vocabulary,
} from './tokenizer/engine';

function finish<S>(
  engine: { init: (seed: number) => S; step: (s: S) => S; isDone?: (s: S) => boolean },
  from?: S,
  max = 10_000,
): S {
  let s = from ?? engine.init(1);
  for (let i = 0; i < max && !engine.isDone?.(s); i++) s = engine.step(s);
  return s;
}

describe('perceptron', () => {
  it('converges on separable data with every point correct', () => {
    const s = finish(perceptronEngine);
    expect(s.converged).toBe(true);
    expect(s.epoch).toBeLessThan(MAX_EPOCHS);
    expect(accuracy(s.points, s.w)).toBe(1);
  });

  it('never converges on XOR, and no straight line gets every point right', () => {
    const xor = perceptronEngine.apply?.(perceptronEngine.init(1), {
      type: 'set-dataset',
      dataset: 'xor',
    });
    const s: PerceptronState = finish(perceptronEngine, xor);
    expect(s.converged).toBe(false);
    expect(s.epoch).toBe(MAX_EPOCHS);
    const pts = makePoints('xor');
    let best = 0;
    for (let a = 0; a < 360; a += 2) {
      const t = (a * Math.PI) / 180;
      for (let b = -1.5; b <= 1.5; b += 0.05)
        best = Math.max(best, accuracy(pts, [Math.cos(t), Math.sin(t), b]));
    }
    expect(best).toBeLessThan(1);
    expect(best).toBeLessThanOrEqual(0.8);
  });

  it('predicts with the sign of w·x + b and updates only on mistakes', () => {
    expect(predict([1, 0, 0], { x: 0.5, y: 0 })).toBe(1);
    expect(predict([1, 0, 0], { x: -0.5, y: 0 })).toBe(-1);
    const s0 = perceptronEngine.init(1);
    const s1 = stepPerceptron(s0);
    expect(s1.index).toBe(1);
    expect(s1.updates).toBeLessThanOrEqual(1);
  });
});

describe('gradient descent', () => {
  it('converges exactly for 0 < lr < 0.1 on this bowl', () => {
    expect(f(...START)).toBe(26);
    expect(RATES.filter(converges)).toEqual([0.01, 0.02, 0.05, 0.08, 0.09]);
    expect(converges(0.1)).toBe(false);
    expect(converges(0.11)).toBe(false);
  });

  it('within 30 steps: 0.08 and 0.09 reach the target; smaller rates crawl; 0.1 bounces; 0.11 diverges', () => {
    const within30 = RATES.filter((lr) => {
      const k = stepsToTarget(lr, 30);
      return k !== null && k <= 30;
    });
    expect(within30).toEqual([0.08, 0.09]);
    expect(stepsToTarget(0.05, 30)).toBeNull();
    expect(stepsToTarget(0.1, 1000)).toBeNull();
    const bounce = finish(
      gradientEngine,
      gradientEngine.apply?.(gradientEngine.init(1), { type: 'set-lr', lr: 0.1 }),
    );
    expect(bounce.path.at(-1)?.[1]).toBeCloseTo(1, 10);
    const diverge = finish(
      gradientEngine,
      gradientEngine.apply?.(gradientEngine.init(1), { type: 'set-lr', lr: 0.11 }),
    );
    const last = diverge.path.at(-1) ?? [0, 0];
    expect(f(last[0], last[1])).toBeGreaterThan(1e6);
    expect(TARGET).toBe(0.01);
  });
});

describe('BPE tokenizer', () => {
  it('starts at 95 tokens and follows the textbook first merges', () => {
    expect(tokenCount(initialWords())).toBe(5 * 4 + 2 * 6 + 6 * 7 + 3 * 7);
    expect(tokenCount(initialWords())).toBe(95);
    let s = tokenizerEngine.init(1);
    const counts: number[] = [tokenCount(s.words)];
    while (!tokenizerEngine.isDone?.(s)) {
      s = tokenizerEngine.step(s);
      counts.push(tokenCount(s.words));
    }
    expect(s.merges.slice(0, 5).map(([a, b]) => a + b)).toEqual(['es', 'est', 'est_', 'lo', 'low']);
    for (let i = 1; i < counts.length; i++)
      expect(counts[i]).toBeLessThan(counts[i - 1] ?? Infinity);
    // Under 50 tokens first happens after 6 merges.
    expect(counts.findIndex((c) => c < 50)).toBe(6);
    expect(counts[6]).toBe(48);
  });

  it('splits unseen words into learned pieces', () => {
    let s = tokenizerEngine.init(1);
    for (let i = 0; i < 6; i++) s = tokenizerEngine.step(s);
    expect(tokenize(SAMPLE, s.merges)).toEqual(['low', 'est_', 'n', 'ew', 'e', 'r', '_']);
    expect(vocabulary(s.words).length).toBeGreaterThan(0);
    expect(bestPair(initialWords())?.count).toBe(9);
  });
});

describe('sampling and temperature', () => {
  it('softmax sums to 1 and matches the lesson numbers', () => {
    for (const t of [0.1, 0.5, 1, 1.5, 2])
      expect(probabilities(t).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(probabilities(0.1)[0]).toBeGreaterThan(0.999);
    expect(probabilities(1)[0]).toBeCloseTo(0.498, 3);
    expect(probabilities(2)[0]).toBeCloseTo(0.327, 3);
    expect(softmax([1000, 1000], 1)).toEqual([0.5, 0.5]);
    expect(CANDIDATES[0]?.token).toBe('mat');
  });

  it('low temperature repeats the top word; high temperature spreads out', () => {
    const run = (t: number) =>
      finish(
        samplingEngine,
        samplingEngine.apply?.(samplingEngine.init(1), { type: 'set-temperature', temperature: t }),
      );
    const cold = run(0.1);
    const hot = run(2);
    expect(drawn(cold)).toBe(SAMPLES);
    expect(cold.counts[0]).toBe(SAMPLES);
    expect(hot.counts.filter((c) => c > 0).length).toBeGreaterThanOrEqual(4);
  });
});

describe('claims the AI & ML lessons make', () => {
  it('the perceptron settles "within a few epochs" on the separable data', () => {
    const s = finish(perceptronEngine);
    expect(s.converged).toBe(true);
    expect(s.epoch).toBeLessThanOrEqual(3);
  });

  it('at temperature 2, "keyboard" and "moon" both appear within the 50 samples', () => {
    const hot = finish(
      samplingEngine,
      samplingEngine.apply?.(samplingEngine.init(1), { type: 'set-temperature', temperature: 2 }),
    );
    const at = (token: string) => hot.counts[CANDIDATES.findIndex((c) => c.token === token)] ?? 0;
    expect(at('keyboard')).toBeGreaterThan(0);
    expect(at('moon')).toBeGreaterThan(0);
  });
});
