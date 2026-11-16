import { describe, expect, it } from 'vitest';
import { mulberry32, nextRandom, shuffled } from './random';

describe('random', () => {
  it('is deterministic and in [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const xs = Array.from({ length: 1000 }, () => a());
    expect(Array.from({ length: 1000 }, () => b())).toEqual(xs);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
  });

  it('pure and closure forms produce the same sequence', () => {
    const closure = mulberry32(7);
    let state = 7;
    for (let i = 0; i < 50; i++) {
      const r = nextRandom(state);
      state = r.state;
      expect(r.value).toBe(closure());
    }
  });

  it('shuffles deterministically without losing items', () => {
    const s = shuffled([1, 2, 3, 4, 5, 6, 7, 8], 3);
    expect([...s].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(shuffled([1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual(s);
  });
});
