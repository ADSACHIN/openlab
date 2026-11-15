import { describe, expect, it } from 'vitest';
import { CycleError, topologicalOrder } from './graph';

describe('topologicalOrder', () => {
  it('puts dependencies first and keeps input order for ties', () => {
    const deps: Record<string, string[]> = { a: [], b: ['a'], c: ['a'], d: ['b', 'c'] };
    expect(topologicalOrder(['d', 'c', 'b', 'a'], (n) => deps[n] ?? [])).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });

  it('reports the cycle path', () => {
    const deps: Record<string, string[]> = { a: ['b'], b: ['c'], c: ['a'] };
    expect(() => topologicalOrder(['a'], (n) => deps[n] ?? [])).toThrow(CycleError);
    try {
      topologicalOrder(['a'], (n) => deps[n] ?? []);
    } catch (e) {
      expect((e as CycleError).cycle).toEqual(['a', 'b', 'c', 'a']);
    }
  });
});
