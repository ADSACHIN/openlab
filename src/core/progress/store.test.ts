import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PROGRESS_KEY, emptyProgress } from './schema';
import { createProgressStore } from './store';

const T0 = new Date('2026-11-15T10:00:00.000Z');

describe('progress store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts empty, notifies subscribers and persists after the debounce', () => {
    const store = createProgressStore({ debounceMs: 300 });
    const spy = vi.fn();
    store.subscribe(spy);
    store.markLessonComplete('networking/osi');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(store.getState().completedLessons['networking/osi']?.completedAt).toBe(T0.toISOString());
    expect(window.localStorage.getItem(`openlab:${PROGRESS_KEY}`)).toBeNull();
    vi.advanceTimersByTime(300);
    expect(window.localStorage.getItem(`openlab:${PROGRESS_KEY}`)).toContain('networking/osi');
  });

  it('reloads persisted state and ignores duplicates', () => {
    const a = createProgressStore({ debounceMs: 0 });
    a.markLessonComplete('x');
    a.markLessonComplete('x');
    const b = createProgressStore({ debounceMs: 0 });
    expect(Object.keys(b.getState().completedLessons)).toEqual(['x']);
    b.unmarkLesson('x');
    expect(b.getState().completedLessons).toEqual({});
  });

  it('tracks lab attempts and keeps the best score / any pass', () => {
    const store = createProgressStore({ debounceMs: 0 });
    store.recordLabResult('lab', { passed: false, message: '', score: 40 });
    store.recordLabResult('lab', { passed: true, message: '', score: 90 });
    store.recordLabResult('lab', { passed: false, message: '', score: 10 });
    expect(store.getState().labResults.lab).toEqual({
      passed: true,
      score: 90,
      attempts: 3,
      lastAttemptAt: T0.toISOString(),
    });
  });

  it('exports and imports with replace and merge', () => {
    const store = createProgressStore({ debounceMs: 0 });
    store.markLessonComplete('a');
    const json = store.exportJson();
    store.reset();
    expect(store.getState()).toEqual(emptyProgress());

    store.markLessonComplete('b');
    expect(store.importJson(json, 'merge')).toEqual({
      ok: true,
      counts: { lessons: 1, labs: 0, quizzes: 0 },
    });
    expect(Object.keys(store.getState().completedLessons).sort()).toEqual(['a', 'b']);

    expect(store.importJson(json, 'replace').ok).toBe(true);
    expect(Object.keys(store.getState().completedLessons)).toEqual(['a']);
  });

  it('rejects bad imports without changing state', () => {
    const store = createProgressStore({ debounceMs: 0 });
    store.markLessonComplete('keep');
    expect(store.importJson('{nope', 'replace')).toEqual({ ok: false, reason: 'invalid-json' });
    expect(store.importJson('{"schemaVersion":1}', 'replace')).toEqual({
      ok: false,
      reason: 'invalid',
    });
    expect(store.importJson('x'.repeat(256 * 1024 + 1), 'replace')).toEqual({
      ok: false,
      reason: 'too-large',
    });
    expect(
      store.importJson(JSON.stringify({ ...emptyProgress(), schemaVersion: 7 }), 'replace'),
    ).toEqual({ ok: false, reason: 'unsupported-version' });
    expect(Object.keys(store.getState().completedLessons)).toEqual(['keep']);
  });

  it('works in memory when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const store = createProgressStore({ debounceMs: 0 });
    expect(store.persisted).toBe(false);
    store.markLessonComplete('m');
    expect(store.getState().completedLessons.m).toBeDefined();
    vi.restoreAllMocks();
  });
});
