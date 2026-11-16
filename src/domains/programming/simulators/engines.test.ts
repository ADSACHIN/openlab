import { describe, expect, it } from 'vitest';
import { binarySearchEngine, guess, makeItems } from './binary-search/engine';
import { buildTrace, current, makeInput, sortingEngine } from './sorting/engine';
import { stackQueueEngine } from './stack-queue/engine';
import { BUGGY_PROGRAM, SUM_PROGRAM, createTracerEngine } from './tracer/engine';

function runAll<S>(
  engine: { init: (seed: number) => S; step: (s: S) => S; isDone?: (s: S) => boolean },
  seed = 1,
  max = 1000,
): S {
  let s = engine.init(seed);
  for (let i = 0; i < max && !engine.isDone?.(s); i++) s = engine.step(s);
  return s;
}

describe('tracer', () => {
  it('runs the sum program to 10 and the buggy one to 6', () => {
    const ok = runAll(createTracerEngine(SUM_PROGRAM));
    expect(ok.output).toEqual(['10']);
    expect(ok.env).toEqual({ total: 10, i: 5 });
    expect(ok.steps).toBe(2 + 4 * 3 + 1 + 1);
    const bug = runAll(createTracerEngine(BUGGY_PROGRAM));
    expect(bug.output).toEqual(['6']);
    expect(
      createTracerEngine(SUM_PROGRAM).describe(createTracerEngine(SUM_PROGRAM).init(1)),
    ).toMatch(/Next line 1: total = 0/);
  });
});

describe('stack & queue', () => {
  it('is LIFO and FIFO respectively, with overflow/underflow messages', () => {
    const e = stackQueueEngine;
    let s = e.init(1);
    s = e.apply?.(s, { type: 'pop' }) ?? s;
    expect(s.lastEvent).toContain('underflow');
    for (let i = 0; i < 3; i++) s = e.apply?.(s, { type: 'push' }) ?? s;
    for (let i = 0; i < 3; i++) s = e.apply?.(s, { type: 'enqueue' }) ?? s;
    expect(e.apply?.(s, { type: 'pop' }).lastEvent).toBe('Popped 3 — the most recently pushed.');
    expect(e.apply?.(s, { type: 'dequeue' }).lastEvent).toBe('Dequeued 4 — the earliest enqueued.');
    const end = runAll(e);
    expect(end.stack).toEqual([]);
    expect(end.queue).toEqual([]);
  });
});

describe('sorting', () => {
  it('every algorithm sorts every input and traces are deterministic', () => {
    for (const algorithm of ['bubble', 'insertion', 'selection'] as const) {
      for (const input of ['random', 'nearly-sorted', 'reversed'] as const) {
        const t1 = buildTrace(algorithm, makeInput(input, 7));
        const t2 = buildTrace(algorithm, makeInput(input, 7));
        expect(t1[t1.length - 1]?.array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(t1).toEqual(t2);
      }
    }
  });

  it('insertion sort wins on nearly sorted input; bubble and selection do not', () => {
    const cmp = (algorithm: 'bubble' | 'insertion' | 'selection') => {
      const t = buildTrace(algorithm, makeInput('nearly-sorted', 1));
      return t[t.length - 1]?.comparisons ?? 0;
    };
    expect(cmp('insertion')).toBeLessThan(cmp('bubble'));
    expect(cmp('insertion')).toBeLessThan(cmp('selection'));
    expect(cmp('selection')).toBe(45);
  });

  it('steps through the trace and resets on configuration changes', () => {
    let s = sortingEngine.init(3);
    expect(current(s).comparisons).toBe(0);
    s = sortingEngine.step(s);
    expect(s.index).toBe(1);
    s = sortingEngine.apply?.(s, { type: 'set-algorithm', algorithm: 'insertion' }) ?? s;
    expect(s.index).toBe(0);
    expect(s.algorithm).toBe('insertion');
    const end = runAll(sortingEngine, 3);
    expect(sortingEngine.describe(end)).toMatch(/finished/);
  });
});

describe('binary search', () => {
  it('generates a sorted list containing the target and halves the range', () => {
    const { items, target } = makeItems(5);
    expect([...items].sort((a, b) => a - b)).toEqual(items);
    expect(items).toContain(target);
    const end = runAll(binarySearchEngine, 5);
    expect(end.found).toBe(true);
    expect(end.guesses.length).toBeLessThanOrEqual(5);
    const s = binarySearchEngine.init(5);
    const g = guess(s, 0);
    expect(g.lo === 1 || g.found).toBe(true);
    expect(guess(g, 99)).toBe(g);
  });
});

describe('programming engine guarantees', () => {
  it('bubble needs 17 and insertion 11 comparisons on nearly sorted input', () => {
    const last = (a: 'bubble' | 'insertion') =>
      buildTrace(a, makeInput('nearly-sorted', 1)).at(-1)?.comparisons;
    expect(last('bubble')).toBe(17);
    expect(last('insertion')).toBe(11);
  });

  it('auto-play binary search never exceeds five probes for any seed', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const end = runAll(binarySearchEngine, seed);
      expect(end.found).toBe(true);
      expect(end.guesses.length).toBeLessThanOrEqual(5);
    }
  });
});
