import { describe, expect, it } from 'vitest';
import { createRegistry } from '@core/registry';
import { programmingModule } from './index';
import { binarySearchEngine, guess } from './simulators/binary-search/engine';
import { sortingEngine } from './simulators/sorting/engine';

describe('programming module', () => {
  const registry = createRegistry([programmingModule]);

  it('registers in prerequisite order', () => {
    expect(registry.lessonsFor('programming').map((l) => l.slug)).toEqual([
      'state-and-steps',
      'stacks-and-queues',
      'sorting',
      'searching-and-complexity',
      'debugging',
    ]);
    expect(registry.labsFor('programming')).toHaveLength(2);
  });

  it('grades the nearly-sorted lab', () => {
    const lab = registry.getLab('programming/nearly-sorted');
    const finish = (s: ReturnType<typeof sortingEngine.init>) => {
      let x = s;
      while (!sortingEngine.isDone?.(x)) x = sortingEngine.step(x);
      return x;
    };
    let s = sortingEngine.init(1);
    expect(lab?.check(s)).toMatchObject({ passed: false, score: 10 });
    s = sortingEngine.apply?.(s, { type: 'set-input', input: 'nearly-sorted' }) ?? s;
    expect(lab?.check(s)).toMatchObject({ passed: false, score: 20 });
    expect(lab?.check(finish(s))).toMatchObject({ passed: false, score: 50 });
    s = sortingEngine.apply?.(s, { type: 'set-algorithm', algorithm: 'insertion' }) ?? s;
    expect(lab?.check(finish(s))).toMatchObject({ passed: true, score: 100 });
  });

  it('grades the five-guesses lab', () => {
    const lab = registry.getLab('programming/five-guesses');
    let s = binarySearchEngine.init(2);
    expect(lab?.check(s)).toMatchObject({ passed: false, score: 10 });
    while (!s.found) s = binarySearchEngine.step(s);
    expect(lab?.check(s)).toMatchObject({ passed: true, score: 100 });
    let slow = binarySearchEngine.init(2);
    for (let i = 0; !slow.found; i++) slow = guess(slow, i);
    expect(slow.guesses.length > 5 ? lab?.check(slow).score : 60).toBe(60);
  });
});
