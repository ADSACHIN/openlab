import { describe, expect, it } from 'vitest';
import { emptyProgress, isProgress, migrateProgress } from './schema';

describe('progress schema', () => {
  it('accepts the empty progress and a populated one', () => {
    expect(isProgress(emptyProgress())).toBe(true);
    expect(
      isProgress({
        ...emptyProgress(),
        completedLessons: { 'networking/osi': { completedAt: '2026-11-15T00:00:00.000Z' } },
        labResults: {
          'networking/l': {
            passed: true,
            score: 80,
            attempts: 2,
            lastAttemptAt: '2026-11-15T00:00:00.000Z',
          },
        },
        quizResults: { q: { correct: 2, total: 3, at: '2026-11-15T00:00:00.000Z' } },
        lastVisited: { path: '/domains/networking', at: '2026-11-15T00:00:00.000Z' },
      }),
    ).toBe(true);
  });

  it('rejects extra keys, bad dates, out-of-range scores', () => {
    expect(isProgress({ ...emptyProgress(), extra: 1 })).toBe(false);
    expect(
      isProgress({ ...emptyProgress(), completedLessons: { x: { completedAt: 'yesterday' } } }),
    ).toBe(false);
    expect(
      isProgress({
        ...emptyProgress(),
        labResults: {
          x: { passed: true, score: 101, attempts: 1, lastAttemptAt: '2026-11-15T00:00:00.000Z' },
        },
      }),
    ).toBe(false);
    expect(
      isProgress({
        ...emptyProgress(),
        quizResults: { q: { correct: 5, total: 3, at: '2026-11-15T00:00:00.000Z' } },
      }),
    ).toBe(false);
    expect(
      isProgress({
        ...emptyProgress(),
        completedLessons: { __proto__: { completedAt: '2026-11-15T00:00:00.000Z' }, polluted: 1 },
      }),
    ).toBe(false);
  });

  it('migrates v1 and refuses future or unknown versions', () => {
    expect(migrateProgress(emptyProgress())).toEqual({ ok: true, progress: emptyProgress() });
    expect(migrateProgress({ ...emptyProgress(), schemaVersion: 99 })).toEqual({
      ok: false,
      reason: 'unsupported-version',
    });
    expect(migrateProgress({ foo: 'bar' })).toEqual({ ok: false, reason: 'invalid' });
    expect(migrateProgress('nope')).toEqual({ ok: false, reason: 'invalid' });
  });
});
