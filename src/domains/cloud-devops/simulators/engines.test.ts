import { describe, expect, it } from 'vitest';
import {
  CACHE_FRIENDLY_ORDER,
  NAIVE_ORDER,
  dockerEngine,
  firstInvalidated,
  rebuildSeconds,
  validate,
} from './docker/engine';
import { applyGit, gitEngine, history, initGit, isAncestor } from './git/engine';
import type { GitAction, GitState } from './git/engine';
import { finishPipeline, initPipeline } from './pipeline/engine';
import { INCIDENTS, PERIOD_DAYS, TARGETS, budgetMinutes, sloEngine, stepSlo } from './slo/engine';

const run = (actions: GitAction[], from: GitState = initGit()) => actions.reduce(applyGit, from);

describe('git', () => {
  it('fast-forwards when main has not moved', () => {
    const s = run([
      { type: 'branch', name: 'feature' },
      { type: 'checkout', name: 'feature' },
      { type: 'commit' },
      { type: 'checkout', name: 'main' },
      { type: 'merge', name: 'feature' },
    ]);
    expect(s.branches.main).toBe(s.branches.feature);
    expect(s.commits.some((c) => c.parents.length === 2)).toBe(false);
    expect(s.event).toMatch(/Fast-forward/);
  });

  it('creates a two-parent merge commit when both branches moved', () => {
    let s = initGit();
    while (!gitEngine.isDone?.(s)) s = gitEngine.step(s);
    const tip = s.commits.find((c) => c.id === s.branches.main);
    expect(tip?.parents).toHaveLength(2);
    expect(isAncestor(s, s.branches.feature ?? '', s.branches.main ?? '')).toBe(true);
    expect(history(s, s.branches.main).size).toBe(s.commits.length);
    expect(applyGit(s, { type: 'merge', name: 'feature' }).event).toMatch(/Already up to date/);
  });

  it('validates branch names and refuses bad operations', () => {
    const s = initGit();
    expect(applyGit(s, { type: 'branch', name: 'Bad Name' }).branches).toEqual(s.branches);
    expect(applyGit(s, { type: 'checkout', name: 'nope' }).head).toBe('main');
    expect(applyGit(s, { type: 'merge', name: 'main' }).event).toMatch(/itself/);
    const b = applyGit(s, { type: 'branch', name: 'feature' });
    expect(b.head).toBe('main');
    expect(applyGit(b, { type: 'branch', name: 'feature' }).event).toMatch(/already exists/);
  });
});

describe('pipeline', () => {
  it('takes 11 units sequentially and 8 in parallel', () => {
    expect(finishPipeline(initPipeline(false, false))).toMatchObject({ time: 11 });
    expect(finishPipeline(initPipeline(true, false))).toMatchObject({ time: 8 });
    expect(finishPipeline(initPipeline(true, false)).status.deploy).toBe('passed');
  });

  it('a failing unit test skips build, E2E and deploy; parallel reports it sooner', () => {
    const seq = finishPipeline(initPipeline(false, true));
    expect(seq.status).toMatchObject({
      lint: 'passed',
      unit: 'failed',
      build: 'skipped',
      e2e: 'skipped',
      deploy: 'skipped',
    });
    expect(seq.finished.unit).toBe(4);
    const par = finishPipeline(initPipeline(true, true));
    expect(par.finished.unit).toBe(3);
    expect(par.status.deploy).toBe('skipped');
  });
});

describe('docker layer cache', () => {
  it('both orders are valid; broken orders are rejected', () => {
    expect(validate(NAIVE_ORDER)).toBeNull();
    expect(validate(CACHE_FRIENDLY_ORDER)).toBeNull();
    expect(validate(['workdir', 'from', 'manifest', 'install', 'source', 'build'])).toMatch(/FROM/);
    expect(validate(['from', 'workdir', 'install', 'manifest', 'source', 'build'])).toMatch(
      /npm ci/,
    );
    expect(validate(['from', 'workdir', 'manifest', 'install', 'build', 'source'])).toMatch(
      /source code/,
    );
  });

  it('matches the lesson: 48 s vs 17 s for a source edit, 48 s for a dependency edit', () => {
    expect(rebuildSeconds(NAIVE_ORDER, 'source')).toBe(2 + 1 + 30 + 15);
    expect(rebuildSeconds(CACHE_FRIENDLY_ORDER, 'source')).toBe(2 + 15);
    expect(rebuildSeconds(CACHE_FRIENDLY_ORDER, 'dependencies')).toBe(1 + 30 + 2 + 15);
    expect(firstInvalidated(CACHE_FRIENDLY_ORDER, 'source')).toBe(4);
  });

  it('17 s is the best any valid order achieves for a source edit', () => {
    const ids = [...CACHE_FRIENDLY_ORDER];
    const perms = (xs: string[]): string[][] =>
      xs.length <= 1
        ? [xs]
        : xs.flatMap((x, i) =>
            perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]),
          );
    const valid = perms(ids).filter((p) => validate(p) === null);
    expect(Math.min(...valid.map((p) => rebuildSeconds(p, 'source')))).toBe(17);
  });

  it('steps layer by layer and accumulates rebuild time', () => {
    let s = dockerEngine.init(1);
    while (!dockerEngine.isDone?.(s)) s = dockerEngine.step(s);
    expect(s.elapsed).toBe(48);
    const moved = dockerEngine.apply?.(dockerEngine.init(1), { type: 'move', id: 'source', by: 1 });
    expect(moved?.order).toEqual(['from', 'workdir', 'manifest', 'source', 'install', 'build']);
  });
});

describe('SLO error budget', () => {
  it('matches the budgets the lesson states', () => {
    expect(budgetMinutes(99.9)).toBeCloseTo(43.2, 10);
    expect(budgetMinutes(99.99)).toBeCloseTo(4.32, 10);
    expect(budgetMinutes(99)).toBeCloseTo(432, 10);
    expect(budgetMinutes(99.9, 365) / 60).toBeCloseTo(8.76, 10);
    expect(INCIDENTS.reduce((n, i) => n + i.minutes, 0)).toBe(50);
  });

  it('runs out on day 19 at 99.9%, day 11 at 99.95%, day 3 at 99.99%, never at 99.5%', () => {
    const exhausted = (target: number) => {
      let s =
        sloEngine.apply?.(sloEngine.init(1), { type: 'set-target', target }) ?? sloEngine.init(1);
      while (s.day < PERIOD_DAYS) s = stepSlo(s);
      return s.exhaustedOn;
    };
    // cumulative downtime: 12, 37, 46, 50 minutes on days 3, 11, 19, 26
    expect(exhausted(99.9)).toBe(19);
    expect(exhausted(99.95)).toBe(11);
    expect(exhausted(99.99)).toBe(3);
    expect(exhausted(99.5)).toBeNull();
    expect(exhausted(99)).toBeNull();
    expect(TARGETS).toContain(99.95);
  });
});
